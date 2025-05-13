// migration.js – import posts, featured cover, and images (robust, batched, polite)
// -------------------------------------------------------------------------------------
// Creates a **Cover** block, downloads + uploads images with limited concurrency, converts
// Gutenberg HTML to Payload Lexical JSON, then bulk‑creates blogPosts.
// Designed for speed *and* friendliness to the origin server.
// -------------------------------------------------------------------------------------

import 'dotenv/config';
import { getPayload } from 'payload';
import payloadConfig from './src/payload.config.js';
import { parse as parseBlocks } from '@wordpress/block-serialization-default-parser';
import { readFile } from 'fs/promises';
import { XMLParser } from 'fast-xml-parser';
import { load as loadHTML } from 'cheerio';
import slugify from 'slugify';
import path from 'path';
import mime from 'mime';
import undici from 'undici';
import pLimit from 'p-limit';
import { createHeadlessEditor } from '@lexical/headless';
import {
  getEnabledNodes,
  sanitizeServerEditorConfig,
  defaultEditorConfig,
} from '@payloadcms/richtext-lexical';
import { $generateNodesFromDOM } from '@lexical/html';
import { $getRoot } from 'lexical';
import { JSDOM } from 'jsdom';

// ════════════════════════════════════════
//  CONFIGURABLE THROTTLING CONSTANTS
// ════════════════════════════════════════
const DOWNLOAD_CONCURRENCY = 5;   // remote host friendliness
const UPLOAD_CONCURRENCY   = 3;   // DB + GridFS happy zone
const JITTER_MIN_MS = 100;
const JITTER_MAX_MS = 300;

// ════════════════════════════════════════
//  NETWORK
// ════════════════════════════════════════
const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36',
  Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
  Referer: 'https://mogadishu24.com/',
};
const agent = new undici.Agent({ connect: { timeout: 30_000 }, keepAliveTimeout: 30_000 });

async function safeFetch(url, opts = {}, retries = 3) {
  const attempt = (u) => fetch(u, { dispatcher: agent, headers: DEFAULT_HEADERS, ...opts });
  for (let i = 1; i <= retries; i++) {
    try {
      const res = await attempt(url);
      if (res.status === 404 && url.startsWith('https://'))
        return attempt(url.replace(/^https:/, 'http:'));
      return res;
    } catch (err) {
      if (i === retries) throw err;
      console.warn(`[safeFetch] Attempt ${i}/${retries} failed for ${url}: ${err?.code ?? err}. Retrying…`);
      await new Promise((r) => setTimeout(r, i * 1_000));
    }
  }
}

// ════════════════════════════════════════
//  UTILITY HELPERS
// ════════════════════════════════════════
const categoryMap = {
  'Recent News': '681fd5d07527d2b6bb614bd1',
  News: '681fd5f97527d2b6bb614bfd',
  'Popular News': '681fd61f7527d2b6bb614c21',
  Opinion: '681fd64a7527d2b6bb614c47',
  Features: '681fd6737527d2b6bb614c6b',
};
const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);
function makeSlug(title, wpSlug) {
  const candidate = wpSlug?.length ? wpSlug : slugify(title || 'untitled', { lower: true, strict: true });
  return candidate || `post-${Date.now()}`;
}
function getRootImageUrl(url) {
  const urlObj = new URL(url);
  const fileName = path.basename(urlObj.pathname);
  const cleanName = fileName.replace(/-\d+x\d+(?=\.[a-z]+$)/i, '');
  urlObj.pathname = path.join(path.dirname(urlObj.pathname), cleanName);
  return urlObj.toString();
}

// ════════════════════════════════════════
//  MEDIA CACHE & DOWNLOAD LOGIC
// ════════════════════════════════════════
const mediaByFilename = new Map();                  // filename → mediaId (in‑memory)
const limitedDownload = pLimit(DOWNLOAD_CONCURRENCY);
async function downloadAndUploadImage(payload, url, alt = '') {
  const filename = url.split('?')[0].split('/').pop();
  if (mediaByFilename.has(filename)) return mediaByFilename.get(filename);

  // Check Payload once (dedupe across runs)
  const { docs: [existing] } = await payload.find({ collection: 'media', where: { filename: { equals: filename } } });
  if (existing) {
    mediaByFilename.set(filename, existing.id);
    return existing.id;
  }

  // politeness jitter
  await new Promise((r) => setTimeout(r, JITTER_MIN_MS + Math.random() * (JITTER_MAX_MS - JITTER_MIN_MS)));

  // download with concurrency guard
  return limitedDownload(async () => {
    try {
      const res = await safeFetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const chunks = [];
      let total = 0;
      for await (const chunk of res.body) {
        chunks.push(chunk);
        total += chunk.length;
        if (total > 50 * 1024 * 1024) throw new Error('file too large');
      }
      const buffer = Buffer.concat(chunks, total);
      const mimetype = mime.getType(filename) || 'application/octet-stream';
      const media = await payload.create({
        collection: 'media',
        data: { alt },
        file: { data: buffer, mimetype, name: filename, size: buffer.length },
      });
      mediaByFilename.set(filename, media.id);
      return media.id;
    } catch (err) {
      console.warn(`   ⚠️  Could not download ${url}:`, err.message);
      return null;
    }
  });
}

// ════════════════════════════════════════
//  HTML → LEXICAL
// ════════════════════════════════════════
function htmlToLexicalJSON(html, editor) {
  editor.update(() => {
    const dom = new JSDOM(html);
    const nodes = $generateNodesFromDOM(editor, dom.window.document);
    const root = $getRoot();
    nodes.forEach((n) => root.append(n));
  }, { discrete: true });

  const json = editor.getEditorState().toJSON();
  console.assert(json.root?.children?.length, '⚠️  Empty Lexical JSON produced');
  editor.update(() => $getRoot().clear(), { discrete: true });
  return json;
}

// ════════════════════════════════════════
//  MAIN MIGRATION
// ════════════════════════════════════════
async function main() {
  console.log('👋  Starting migration');

  const payload = await getPayload({ config: payloadConfig });
  const sanitised = await sanitizeServerEditorConfig(defaultEditorConfig, payload.config);
  const headlessEditor = createHeadlessEditor({ nodes: getEnabledNodes({ editorConfig: sanitised, config: payload.config }) });

  const xmlData = await readFile('./wp-data.xml', 'utf8');
  const wpData = new XMLParser().parse(xmlData);

  // Build lookup tables
  const authorMap = {};
  for (const a of toArray(wpData.rss.channel['wp:author']))
    authorMap[a['wp:author_login']] = (a['wp:author_email'] ?? '').toLowerCase();

  const attachmentMap = {};
  for (const item of toArray(wpData.rss.channel.item))
    if (item['wp:post_type'] === 'attachment') attachmentMap[item['wp:post_id']] = (item['wp:attachment_url'] || item.guid)?.trim();

  const createLimit = pLimit(UPLOAD_CONCURRENCY);
  const createJobs = [];

  for (const post of toArray(wpData.rss.channel.item)) {
    if (post['wp:post_type'] !== 'post') continue;
    const slug = makeSlug(post.title, post['wp:post_name']);
    console.log(`— Migrating «${post.title || 'Untitled'}» (${slug})`);

    // Author
    const authorEmail = authorMap[post['dc:creator']];
    const { docs: [author] } = authorEmail ? await payload.find({ collection: 'users', where: { email: { equals: authorEmail } } }) : { docs: [] };

    const newPost = {
      slug,
      author: author?.id ?? null,
      name: post.title || 'Untitled',
      creationDate: new Date(post.pubDate),
      layout: [],
      categories: toArray(post.category).map((c) => categoryMap[c]).filter(Boolean),
    };

    // Cover
    const thumbId = toArray(post['wp:postmeta']).find((m) => m['wp:meta_key'] === '_thumbnail_id')?.['wp:meta_value'];
    let coverImageId = null;
    if (thumbId && attachmentMap[thumbId])
      coverImageId = await downloadAndUploadImage(payload, getRootImageUrl(attachmentMap[thumbId]), post.title);

    newPost.layout.push({
      blockType: 'cover',
      heading: htmlToLexicalJSON(`<p>${(post.title || 'Untitled').slice(0, 250)}</p>`, headlessEditor),
      subheading: (post.title || 'Untitled').slice(0, 250),
      image: coverImageId,
    });

    // Body blocks
    for (const block of parseBlocks(post['content:encoded'] || '')) {
      if (block.blockName === 'core/image') {
        const $ = loadHTML(block.innerHTML);
        const src = $('img').attr('src');
        if (!src) continue;
        const id = await downloadAndUploadImage(payload, getRootImageUrl(src), $('img').attr('alt') ?? '');
        newPost.layout.push({ blockType: 'image', image: id, alt: $('img').attr('alt') ?? '' });
        continue;
      }
      if (['core/paragraph', 'core/heading'].includes(block.blockName)) {
        newPost.layout.push({ blockType: 'richtext', content: htmlToLexicalJSON(block.innerHTML, headlessEditor) });
      }
    }

    // Batch the create with limited concurrency
    createJobs.push(createLimit(() => payload.create({ collection: 'blogPosts', data: newPost }))
      .then(() => console.log('   ✅  Created'))
      .catch((e) => console.error('   ❌  Failed to create post:', e)));
  }

  await Promise.allSettled(createJobs);
  await agent.close();
  console.log('🏁  Migration complete');
}

main().catch((err) => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});

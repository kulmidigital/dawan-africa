// migration.js – import posts, featured cover, and images (robust, no‑skip, email lookup)
// -------------------------------------------------------------------------------------
// Creates a **Cover** block with heading + image (from WP _thumbnail_id) plus normal body.
// Requires: Cover block now has an `image` upload field (relationTo "media").
// -------------------------------------------------------------------------------------

import 'dotenv/config'
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
import { createHeadlessEditor } from '@lexical/headless';
import {
  getEnabledNodes,
  sanitizeServerEditorConfig,
  defaultEditorConfig,
} from '@payloadcms/richtext-lexical';
import { $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $getSelection } from 'lexical';
import { JSDOM } from 'jsdom';

// ---------- Network helpers -------------------------------------------------

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
      if (res.status === 404 && url.startsWith('https://')) {
        return attempt(url.replace(/^https:/, 'http:'));
      }
      return res;
    } catch (err) {
      if (i === retries) throw err;
      console.warn(`[safeFetch] Attempt ${i}/${retries} failed for ${url}: ${err?.code ?? err}. Retrying…`);
      await new Promise((r) => setTimeout(r, i * 1_000));
    }
  }
}

// ---------- Misc helpers ----------------------------------------------------

const categoryMap = {
  "Recent News": "681fd5d07527d2b6bb614bd1",
  "News": "681fd5f97527d2b6bb614bfd",
  "Popular News": "681fd61f7527d2b6bb614c21",
  "Opinion": "681fd64a7527d2b6bb614c47",
  "Features": "681fd6737527d2b6bb614c6b",
};

const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

function makeSlug(title, wpSlug) {
  const candidate = wpSlug && wpSlug.length ? wpSlug : slugify(title || 'untitled', { lower: true, strict: true });
  return candidate || `post-${Date.now()}`;
}

function getRootImageUrl(url) {
  const urlObj = new URL(url);
  const fileName = path.basename(urlObj.pathname);
  const cleanName = fileName.replace(/-\d+x\d+(?=\.[a-z]+$)/i, '');
  urlObj.pathname = path.join(path.dirname(urlObj.pathname), cleanName);
  return urlObj.toString();
}

async function downloadAndUploadImage(payload, url, alt = '') {
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
    const filename = url.split('?')[0].split('/').pop();
    const mimetype = mime.getType(filename) || 'application/octet-stream';
    const media = await payload.create({
      collection: 'media',
      data: { alt },
      file: { data: buffer, mimetype, name: filename, size: buffer.length },
    });
    return media.id;
  } catch (err) {
    console.warn(`   ⚠️  Could not download ${url}:`, err.message);
    return null;
  }
}

function htmlToLexicalJSON(html, editor) {
  editor.update(() => {
    const dom = new JSDOM(html);
    const nodes = $generateNodesFromDOM(editor, dom.window.document);
    $getRoot().select();
    $getSelection().insertNodes(nodes);
  }, { discrete: true });
  const json = editor.getEditorState().toJSON();
  editor.update(() => $getRoot().clear(), { discrete: true });
  return json;
}

// ---------- Main -----------------------------------------------------------

async function main() {
  console.log('👋  Starting migration');
  const payload = await getPayload({ config: payloadConfig });
  const sanitised = await sanitizeServerEditorConfig(defaultEditorConfig, payload.config);
  const headlessEditor = createHeadlessEditor({ nodes: getEnabledNodes({ editorConfig: sanitised, config: payload.config }) });

  const xmlData = await readFile('./wp-data.xml', 'utf8');
  const wpData = new XMLParser().parse(xmlData);

  // Build login→email map
  const authorMap = {};
  for (const a of toArray(wpData.rss.channel['wp:author'])) {
    authorMap[a['wp:author_login']] = (a['wp:author_email'] ?? '').toLowerCase();
  }
  // Build attachment ID → url map
  const attachmentMap = {};
  for (const item of toArray(wpData.rss.channel.item)) {
    if (item['wp:post_type'] === 'attachment') attachmentMap[item['wp:post_id']] = (item['wp:attachment_url'] || item.guid)?.trim();
  }

  for (const post of toArray(wpData.rss.channel.item)) {
    if (post['wp:post_type'] !== 'post') continue; // skip attachments etc.
    const slug = makeSlug(post.title, post['wp:post_name']);
    console.log(`— Migrating «${post.title || 'Untitled'}» (${slug})`);

    // ----- Author ---------------------------------------------------------
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

    // ----- Cover (featured image) ----------------------------------------
    const thumbId = toArray(post['wp:postmeta']).find((m) => m['wp:meta_key'] === '_thumbnail_id')?.['wp:meta_value'];
    let coverImageId = null;
    if (thumbId && attachmentMap[thumbId]) {
      const fileUrl = getRootImageUrl(attachmentMap[thumbId]);
      const fileName = path.basename(fileUrl);
      let { docs: [img] } = await payload.find({ collection: 'media', where: { filename: { equals: fileName } } });
      if (!img) img = { id: await downloadAndUploadImage(payload, fileUrl, post.title) };
      coverImageId = img?.id ?? null;
    }
    newPost.layout.push({
      blockType: 'cover',
      heading: htmlToLexicalJSON(`<p>${(post.title || 'Untitled').slice(0,250)}</p>`, headlessEditor),
      subheading: (post.title || 'Untitled').slice(0,250),
      image: coverImageId,
    });

    // ----- Body blocks ----------------------------------------------------
    for (const block of parseBlocks(post['content:encoded'] || '')) {
      if (block.blockName === 'core/image') {
        const $ = loadHTML(block.innerHTML);
        const src = $('img').attr('src');
        if (!src) continue;
        const rootSrc = getRootImageUrl(src);
        const fname = path.basename(rootSrc);
        let { docs: [image] } = await payload.find({ collection: 'media', where: { filename: { equals: fname } } });
        if (!image) {
          const id = await downloadAndUploadImage(payload, rootSrc, $('img').attr('alt') ?? '');
          if (id) image = { id };
        }
        newPost.layout.push({ blockType: 'image', image: image?.id ?? null, alt: $('img').attr('alt') ?? '' });
        continue;
      }
      if (['core/paragraph', 'core/heading'].includes(block.blockName)) {
        newPost.layout.push({ blockType: 'richtext', content: htmlToLexicalJSON(block.innerHTML, headlessEditor) });
      }
    }

    // ----- Persist --------------------------------------------------------
    try {
      await payload.create({ collection: 'blogPosts', data: newPost });
      console.log('   ✅  Created');
    } catch (e) {
      console.error('   ❌  Failed to create post:', e);
    }
  }

  await agent.close();
  console.log('🏁  Migration complete');
}

main().catch((err) => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});

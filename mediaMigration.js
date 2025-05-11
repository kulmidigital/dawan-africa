

import fs from 'fs/promises'
import { XMLParser } from 'fast-xml-parser'
import mime from 'mime'
import { getPayload } from 'payload'
import undici from 'undici'
import config from './src/payload.config.js'

// ---------- Fixed parameters -----------------------------------------------

const SKIP_FIRST = 2635              // Number of media items to skip
const MAX_FILE_SIZE_MB = 50         // Hard size ceiling for a single file
const WXR_PATH = './media.xml'      // Location of WordPress export

// ---------- HTTP helpers ----------------------------------------------------

const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36',
  Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
  Referer: 'https://mogadishu24.com/', // certain CDNs demand an in‑domain referrer
}

// Re‑use one connection pool across requests
const agent = new undici.Agent({
  connect: { timeout: 30_000 },
  keepAliveTimeout: 30_000,
})

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function safeFetch(url, opts = {}, retries = 3) {
  const attempt = (u) => fetch(u, { dispatcher: agent, headers: DEFAULT_HEADERS, ...opts })

  for (let i = 1; i <= retries; i++) {
    try {
      const res = await attempt(url)
      if (res.status === 404 && url.startsWith('https://')) {
        return attempt(url.replace(/^https:/, 'http:'))
      }
      return res
    } catch (err) {
      if (i === retries) throw err
      console.warn(`Attempt ${i} failed for ${url}: ${err.code ?? err}. Retrying…`)
      await sleep(i * 1000)
    }
  }
}

async function downloadToBuffer(res, url) {
  const chunks = []
  let total = 0
  for await (const chunk of res.body) {
    chunks.push(chunk)
    total += chunk.length
    if (total > MAX_FILE_SIZE_MB * 1024 * 1024) {
      throw new Error(`File too large (${(total / 1024 / 1024).toFixed(1)} MiB)`) // stop early
    }
  }
  return Buffer.concat(chunks, total)
}

// ---------- Core pipeline ---------------------------------------------------

async function parseWXR(path) {
  const xml = await fs.readFile(path, 'utf8')
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' })
  return parser.parse(xml).rss.channel.item
}

async function migrate() {
  console.log('▶ Starting media migration')

  const payload = await getPayload({ config })

  const items = (await parseWXR(WXR_PATH)).slice(SKIP_FIRST)
  console.log(`ℹ Skipping first ${SKIP_FIRST} items; processing ${items.length}`)

  for (const item of items) {
    const url = (item['wp:attachment_url'] || item.guid)?.trim()
    if (!url) continue

    console.log(`\n⇢ Downloading ${url}`)

    let res
    try {
      res = await safeFetch(url)
    } catch (err) {
      console.error(`⤫ Network error for ${url}`, err)
      continue
    }

    if (!res.ok) {
      console.warn(`⤫ HTTP ${res.status} for ${url}`)
      continue
    }

    try {
      const buffer = await downloadToBuffer(res, url)
      const filename = url.split('?')[0].split('/').pop()
      const mimetype = mime.getType(filename) || 'application/octet-stream'

      await payload.create({
        collection: 'media',
        data: { alt: item.title },
        file: {
          data: buffer,
          mimetype,
          name: filename,
          size: buffer.length,
        },
      })
      console.log(`✓ Uploaded ${filename} (${(buffer.length / 1024).toFixed(1)} KiB)`)
    } catch (err) {
      console.error(`⤫ Failed to process ${url}:`, err.message ?? err)
    }
  }

  console.log('\n✅ Migration complete')
  await agent.close()
}

// ---------- Entrypoint ------------------------------------------------------

migrate().catch((err) => {
  console.error('Fatal error:', err)
  process.exitCode = 1
})


// import fs from 'fs/promises'
// import { XMLParser } from 'fast-xml-parser'
// import mime from 'mime'
// import { getPayload } from 'payload'
// import undici from 'undici'
// import config from './src/payload.config.js'

// // ---------- Network helpers -------------------------------------------------

// const DEFAULT_HEADERS = {
//   /** Pretend to be a real browser so hot‑link protections don’t 404 us */
//   'User-Agent':
//     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36',
//   /** Ask specifically for binary data */
//   Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
//   /** Some CDNs require an in‑domain referer otherwise they 404‑spoof */
//   Referer: 'https://mogadishu24.com/',
// }

// // Re‑use a single connection pool with sensible timeouts
// const agent = new undici.Agent({
//   connect: { timeout: 30_000 }, // 30 s max to establish TLS
//   keepAliveTimeout: 30_000, // 30 s idle keep‑alive
// })

// /**
//  * Robust fetch with retries and fallback to `http://` (many legacy WP sites
//  * only serve media over plain HTTP or hide behind Cloudflare rules).
//  */
// async function safeFetch(url, opts = {}, retries = 3) {
//   const attemptURL = (u) => fetch(u, { dispatcher: agent, headers: DEFAULT_HEADERS, ...opts })

//   for (let attempt = 1; attempt <= retries; attempt++) {
//     try {
//       const res = await attemptURL(url)
//       // On a 404 from HTTPS, try HTTP once before we give up
//       if (res.status === 404 && url.startsWith('https://')) {
//         const httpURL = url.replace(/^https:/, 'http:')
//         return await attemptURL(httpURL)
//       }
//       return res
//     } catch (err) {
//       if (attempt === retries) throw err
//       console.warn(`Attempt ${attempt} for ${url} failed: ${err.code ?? err}. Retrying…`)
//       await new Promise((r) => setTimeout(r, attempt * 1000))
//     }
//   }
// }

// // ---------- Main migration routine -----------------------------------------

// ;(async () => {
//   console.log('Starting migration')

//   const payload = await getPayload({ config })

//   // Parse WordPress WXR export
//   const xmlData = await fs.readFile('./media.xml', 'utf8')
//   const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' })
//   const wpData = parser.parse(xmlData)

//   for (const item of wpData.rss.channel.item) {
//     // Prefer <wp:attachment_url>; fall back to <guid>
//     const url = (item['wp:attachment_url'] || item.guid)?.trim()
//     if (!url) continue

//     console.log(`\nDownloading ${url}`)

//     let res
//     try {
//       res = await safeFetch(url)
//     } catch (err) {
//       console.error(`Skipping ${url}: network error`, err)
//       continue
//     }

//     if (!res.ok) {
//       console.warn(`Skipping ${url}: HTTP ${res.status}`)
//       continue
//     }

//     // Stream response to buffer (≤ 50 MB)
//     const chunks = []
//     let total = 0
//     for await (const chunk of res.body) {
//       chunks.push(chunk)
//       total += chunk.length
//       if (total > 50 * 1024 * 1024) {
//         console.warn(`Skipping ${url}: file too large (${(total / 1024 / 1024).toFixed(1)} MiB)`)
//         continue
//       }
//     }
//     const buffer = Buffer.concat(chunks, total)

//     const filename = url.split('?')[0].split('/').pop()
//     const mimetype = mime.getType(filename) || 'application/octet-stream'

//     try {
//       await payload.create({
//         collection: 'media',
//         data: { alt: item.title },
//         file: {
//           data: buffer,
//           mimetype,
//           name: filename,
//           size: buffer.length,
//         },
//       })
//       console.log(`Uploaded ${filename} (${(buffer.length / 1024).toFixed(1)} KiB)`)
//     } catch (err) {
//       console.error(`Failed to save ${filename}:`, err)
//     }
//   }

//   console.log('\nMigration complete')
//   await agent.close()
// })()

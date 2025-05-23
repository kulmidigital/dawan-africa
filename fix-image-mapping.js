import 'dotenv/config'
import payload from 'payload'
import configPromise from './src/payload.config.js'
import { readFile } from 'fs/promises'
import { XMLParser } from 'fast-xml-parser'
import { parse as parseBlocks } from '@wordpress/block-serialization-default-parser'
import { load as loadHTML } from 'cheerio'
import path from 'path'

const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : [])

function getRootImageUrl(url) {
  try {
    const urlObj = new URL(url)
    const fileName = path.basename(urlObj.pathname)
    const cleanName = fileName.replace(/-\d+x\d+(?=\.[a-z]+$)/i, '')
    urlObj.pathname = path.join(path.dirname(urlObj.pathname), cleanName)
    return urlObj.toString()
  } catch (err) {
    console.warn(`Invalid URL: ${url}`)
    return url
  }
}

function getFilenameFromUrl(url) {
  try {
    return url.split('?')[0].split('/').pop()
  } catch (err) {
    console.warn(`Could not extract filename from: ${url}`)
    return null
  }
}

const fixImageMapping = async () => {
  try {
    console.log('🔧 Starting image mapping fix...')
    const config = await configPromise

    await payload.init({
      secret: process.env.PAYLOAD_SECRET,
      mongoURL: process.env.DATABASE_URI,
      local: true,
      config: config,
    })

    console.log('✅ Payload initialized.')

    // Parse WordPress data
    console.log('📖 Reading WordPress data...')
    const xmlData = await readFile('./wp-data.xml', 'utf8')
    const wpData = new XMLParser().parse(xmlData)

    // Build media lookup by filename
    console.log('🔍 Building media lookup table...')
    const { docs: allMedia } = await payload.find({
      collection: 'media',
      limit: 0,
    })

    const mediaByFilename = new Map()
    allMedia.forEach((media) => {
      if (media.filename) {
        mediaByFilename.set(media.filename, media.id)
      }
    })
    console.log(`📊 Found ${mediaByFilename.size} media files in database`)

    // Build attachment lookup from WordPress data
    console.log('📋 Building WordPress attachment lookup...')
    const attachmentMap = {}
    for (const item of toArray(wpData.rss.channel.item)) {
      if (item['wp:post_type'] === 'attachment') {
        const attachmentUrl = (item['wp:attachment_url'] || item.guid)?.trim()
        if (attachmentUrl) {
          attachmentMap[item['wp:post_id']] = attachmentUrl
        }
      }
    }
    console.log(`📊 Found ${Object.keys(attachmentMap).length} attachments in WordPress data`)

    // Get all blog posts
    console.log('📚 Fetching all remaining blog posts (skipping first 5 already processed)...')
    const { docs: allPosts } = await payload.find({
      collection: 'blogPosts',
      limit: 0,
      skip: 5,
      sort: '-createdAt',
      depth: 1,
    })

    if (!allPosts || allPosts.length === 0) {
      console.log('❌ No more blog posts found.')
      return
    }

    console.log(
      `📊 Found ${allPosts.length} blog posts to process (posts 6-${5 + allPosts.length})`,
    )

    let processedCount = 0
    let updatedCount = 0
    let errorCount = 0

    // Process each post
    for (const post of allPosts) {
      try {
        console.log(`\n🔄 Processing: "${post.name || post.slug || post.id}"`)

        // Find corresponding WordPress post
        const wpPost = toArray(wpData.rss.channel.item).find(
          (item) =>
            item['wp:post_type'] === 'post' &&
            (item['wp:post_name'] === post.slug || item.title === post.name),
        )

        if (!wpPost) {
          console.log(`   ⚠️  Could not find matching WordPress post`)
          processedCount++
          continue
        }

        let layoutUpdated = false
        const newLayout = []

        for (const block of post.layout || []) {
          if (block.blockType === 'cover') {
            // Try to fix cover image
            const thumbId = toArray(wpPost['wp:postmeta']).find(
              (m) => m['wp:meta_key'] === '_thumbnail_id',
            )?.['wp:meta_value']

            if (thumbId && attachmentMap[thumbId]) {
              const coverUrl = getRootImageUrl(attachmentMap[thumbId])
              const coverFilename = getFilenameFromUrl(coverUrl)

              if (coverFilename && mediaByFilename.has(coverFilename)) {
                const existingImageId = mediaByFilename.get(coverFilename)
                if (block.image !== existingImageId) {
                  block.image = existingImageId
                  layoutUpdated = true
                  console.log(`   ✅ Fixed cover image: ${coverFilename}`)
                }
              } else if (coverFilename) {
                console.log(`   ⚠️  Cover image not found in media: ${coverFilename}`)
              }
            }
            newLayout.push(block)
          } else if (block.blockType === 'image') {
            // Try to find corresponding image in WordPress content
            const gutenbergBlocks = parseBlocks(wpPost['content:encoded'] || '')
            let imageFixed = false

            for (const gutenbergBlock of gutenbergBlocks) {
              if (gutenbergBlock.blockName === 'core/image') {
                const $ = loadHTML(gutenbergBlock.innerHTML)
                const src = $('img').attr('src')

                if (src) {
                  const imageUrl = getRootImageUrl(src)
                  const imageFilename = getFilenameFromUrl(imageUrl)

                  if (imageFilename && mediaByFilename.has(imageFilename)) {
                    const existingImageId = mediaByFilename.get(imageFilename)
                    if (block.image !== existingImageId) {
                      block.image = existingImageId
                      // Update alt text if available
                      const altText = $('img').attr('alt')
                      if (altText) {
                        block.alt = altText
                      }
                      layoutUpdated = true
                      imageFixed = true
                      console.log(`   ✅ Fixed content image: ${imageFilename}`)
                      break
                    }
                  }
                }
              }
            }

            if (!imageFixed && block.image) {
              console.log(`   ⚠️  Could not map image block to WordPress content`)
            }

            newLayout.push(block)
          } else {
            // Keep other blocks as they are
            newLayout.push(block)
          }
        }

        // Update post if layout was modified
        if (layoutUpdated) {
          await payload.update({
            collection: 'blogPosts',
            id: post.id,
            data: {
              layout: newLayout,
            },
          })
          updatedCount++
          console.log(`   ✅ Updated post layout`)
        } else {
          console.log(`   ℹ️  No updates needed`)
        }

        processedCount++
      } catch (error) {
        errorCount++
        console.error(`   ❌ Error processing post "${post.name || post.id}":`, error.message)
      }
    }

    console.log('\n🎉 Image mapping fix complete!')
    console.log(`📊 Posts processed: ${processedCount}`)
    console.log(`✅ Posts updated: ${updatedCount}`)
    console.log(`❌ Errors: ${errorCount}`)
  } catch (error) {
    console.error('❌ Fatal error during image mapping fix:', error)
    process.exit(1)
  } finally {
    console.log('👋 Exiting script.')
    process.exit(0)
  }
}

fixImageMapping().catch((err) => {
  console.error('❌ Unhandled error in fixImageMapping:', err)
  process.exit(1)
})

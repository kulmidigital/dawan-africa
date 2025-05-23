import { ImageResponse } from 'next/og'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { BlogPost } from '@/payload-types'
import { getPostImageFromLayout, getPostExcerpt } from '@/utils/postUtils'
import { SITE_CONFIG } from '@/lib/seo'

// Image metadata
export const alt = 'Article Preview'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

// Function to fetch a single post by slug
async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const payload = await getPayload({ config })
  try {
    const response = await payload.find({
      collection: 'blogPosts',
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
      depth: 3,
    })
    return response.docs[0] || null
  } catch (error) {
    console.error('Error fetching post by slug:', error)
    return null
  }
}

// Image generation
export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    // Fallback image for non-existent posts
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: 'linear-gradient(135deg, #2aaac6 0%, #1a7a8a 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 72, marginBottom: 20 }}>📰</div>
            <div>Article Not Found</div>
            <div style={{ fontSize: 24, marginTop: 10, opacity: 0.8 }}>{SITE_CONFIG.name}</div>
          </div>
        </div>
      ),
      { ...size },
    )
  }

  const title = post.name
  const excerpt = getPostExcerpt(post, { maxLength: 150 })
  const coverImageUrl = getPostImageFromLayout(post.layout)

  // Check if we have a cover image to use as background
  if (coverImageUrl) {
    const fullImageUrl = coverImageUrl.startsWith('http')
      ? coverImageUrl
      : `${SITE_CONFIG.url}${coverImageUrl}`

    try {
      return new ImageResponse(
        (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              position: 'relative',
            }}
          >
            {/* Background image with overlay */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${fullImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'brightness(0.4)',
              }}
            />

            {/* Content overlay */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '60px',
                background:
                  'linear-gradient(transparent 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.8) 100%)',
              }}
            >
              {/* Site logo/name */}
              <div
                style={{
                  position: 'absolute',
                  top: 40,
                  right: 60,
                  color: 'white',
                  fontSize: 24,
                  fontWeight: 'bold',
                  fontFamily: 'system-ui, sans-serif',
                }}
              >
                {SITE_CONFIG.name}
              </div>

              {/* Article title */}
              <div
                style={{
                  color: 'white',
                  fontSize: title.length > 80 ? 42 : 52,
                  fontWeight: 'bold',
                  lineHeight: 1.2,
                  marginBottom: excerpt ? 20 : 0,
                  fontFamily: 'system-ui, sans-serif',
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                }}
              >
                {title}
              </div>

              {/* Article excerpt */}
              {excerpt && (
                <div
                  style={{
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: 18,
                    lineHeight: 1.4,
                    fontFamily: 'system-ui, sans-serif',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  }}
                >
                  {excerpt}
                </div>
              )}
            </div>
          </div>
        ),
        { ...size },
      )
    } catch (error) {
      console.error('Error generating image with cover:', error)
      // Fallback to text-based image if cover image fails
    }
  }

  // Fallback: Text-based OpenGraph image
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #2aaac6 0%, #1a7a8a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '60px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Site name */}
        <div
          style={{
            color: 'white',
            fontSize: 32,
            fontWeight: 'bold',
            opacity: 0.9,
          }}
        >
          {SITE_CONFIG.name}
        </div>

        {/* Article content */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {/* Title */}
          <div
            style={{
              color: 'white',
              fontSize: title.length > 80 ? 42 : 52,
              fontWeight: 'bold',
              lineHeight: 1.2,
              marginBottom: excerpt ? 20 : 0,
            }}
          >
            {title}
          </div>

          {/* Excerpt */}
          {excerpt && (
            <div
              style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: 18,
                lineHeight: 1.4,
              }}
            >
              {excerpt}
            </div>
          )}
        </div>

        {/* Bottom decoration */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            color: 'rgba(255,255,255,0.7)',
            fontSize: 16,
          }}
        >
          <div style={{ fontSize: 24, marginRight: 12 }}>📰</div>
          <div>African News & Insights</div>
        </div>
      </div>
    ),
    { ...size },
  )
}

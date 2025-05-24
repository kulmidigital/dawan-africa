import { ImageResponse } from 'next/og'
import { join } from 'node:path'
import { readFile } from 'node:fs/promises'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { BlogPost } from '@/payload-types'
import { getPostExcerpt } from '@/utils/postUtils'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  // Get the post data
  const { slug } = await params
  const payload = await getPayload({ config })
  const post = await payload
    .find({
      collection: 'blogPosts',
      where: {
        slug: {
          equals: slug,
        },
      },
    })
    .then((res) => res.docs[0] as BlogPost)

  // Read the logo file and convert to base64
  const logoData = await readFile(join(process.cwd(), 'public/og-default.png'))
  const logoBase64 = `data:image/png;base64,${Buffer.from(logoData).toString('base64')}`

  // Get the excerpt from the layout
  const excerpt = getPostExcerpt(post)

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to right, #000000, #2EC6FE)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '40px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
          <img
            src={logoBase64}
            alt="Dawan Africa Logo"
            style={{
              width: '200px',
            }}
          />
        </div>
        <div
          style={{
            color: 'white',
            fontSize: '48px',
            fontWeight: 'bold',
            lineHeight: 1.2,
            marginBottom: '20px',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            display: 'flex',
          }}
        >
          {post.name}
        </div>
        <div
          style={{
            color: '#E0E0E0',
            fontSize: '24px',
            lineHeight: 1.4,
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            display: 'flex',
          }}
        >
          {excerpt}
        </div>
      </div>
    ),
    {
      ...size,
    },
  )
}

export async function generateImageMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return [
    {
      contentType: 'image/png',
      size: size,
      id: 'og-image',
      alt: `Dawan Africa - ${slug}`,
    },
  ]
}

import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { BlogPost } from '@/payload-types'
import { ArticleView } from '@/components/news/ArticleView'
import { notFound } from 'next/navigation'
// import type { Metadata, ResolvingMetadata } from 'next'

interface PageProps {
  params: { slug: string } // This is what params will be *after* await
}

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
      depth: 5,
    })
    return response.docs[0] || null
  } catch (error) {
    console.error('Error fetching post by slug:', error)
    return null
  }
}

// Generate dynamic metadata (optional)
// export async function generateMetadata(
//   { params }: PageProps,
//   parent: ResolvingMetadata,
// ): Promise<Metadata> {
//   const post = await getPostBySlug(params.slug)
//   if (!post) {
//     return {
//       title: 'Article Not Found',
//       description: 'The article you are looking for does not exist.'
//     }
//   }
//   const parentTitle = (await parent).title?.absolute || 'Dawan Africa'
//   return {
//     title: `${post.name} | ${parentTitle}`,
//     description: post.layout?.find(block => block.blockType === 'richText')
//                  ? (post.layout.find(block => block.blockType === 'richText') as any).content?.root?.children?.[0]?.text?.substring(0, 160)
//                  : 'Read this article on Dawan Africa.',
//     // openGraph: { ... }, // Add OpenGraph metadata if needed
//   }
// }

// Generate static paths (optional, for SSG)
// export async function generateStaticParams() {
//   const payload = await getPayload({ config })
//   try {
//     const posts = await payload.find({
//       collection: 'blogPosts',
//       limit: 100, // Adjust as needed
//       select: { slug: true }, // Only fetch slugs
//     })
//     return posts.docs.map((post) => ({ slug: post.slug }))
//   } catch (error) {
//     console.error('Error fetching slugs for static params:', error)
//     return []
//   }
// }

export default async function NewsArticlePage({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await paramsPromise
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound() // Triggers the not-found page
  }


  return (
    <main className="bg-gray-50 min-h-screen">
      <ArticleView post={post} />
    </main>
  )
}

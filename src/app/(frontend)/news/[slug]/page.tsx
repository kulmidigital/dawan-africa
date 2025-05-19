import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { BlogPost, BlogCategory } from '@/payload-types'
import { ArticleView } from '@/components/news/ArticleView'
import { notFound } from 'next/navigation'
import type { Metadata, ResolvingMetadata } from 'next'
import { getPostImageFromLayout, getPostExcerpt } from '@/utils/postUtils'

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
      depth: 5, // Ensure categories are populated, may need to adjust depth or use GraphQL for precise field selection
    })
    return response.docs[0] || null
  } catch (error) {
    console.error('Error fetching post by slug:', error)
    return null
  }
}

// Function to fetch related posts by category IDs
async function getRelatedPosts(categoryIds: string[], currentPostId: string): Promise<BlogPost[]> {
  if (!categoryIds || categoryIds.length === 0) return []
  const payload = await getPayload({ config })
  try {
    const response = await payload.find({
      collection: 'blogPosts',
      where: {
        and: [
          {
            categories: {
              in: categoryIds,
            },
          },
          {
            id: {
              not_equals: currentPostId,
            },
          },
        ],
      },
      limit: 3, // Limit the number of related posts
      depth: 1, // Adjust depth as needed for related post cards
    })
    return response.docs
  } catch (error) {
    console.error('Error fetching related posts:', error)
    return []
  }
}

// Generate dynamic metadata
export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    return {
      title: 'Article Not Found',
      description: 'The article you are looking for does not exist.',
    }
  }

  const parentMetadata = await parent
  const parentTitle = parentMetadata.title?.absolute || 'Dawan Africa'
  const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000' // Define siteUrl
  const postDescription = getPostExcerpt(post, { maxLength: 160 })
  const coverImageUrl = getPostImageFromLayout(post.layout)
  const ogImage = coverImageUrl
    ? `${siteUrl}${coverImageUrl}`
    : `${siteUrl}/placeholder-og-image.png` // Ensure absolute URL and add fallback

  return {
    title: `${post.name} | ${parentTitle}`,
    description: postDescription,
    openGraph: {
      title: post.name,
      description: postDescription,
      url: `${siteUrl}/news/${post.slug}`, // Add post URL
      siteName: parentMetadata.openGraph?.siteName || 'Dawan Africa', // Inherit or set siteName
      images: [
        {
          url: ogImage, // Must be an absolute URL
          width: 1200, // Example width
          height: 630, // Example height
          alt: post.name,
        },
      ],
      type: 'article', // Set type to article
      publishedTime: post.createdAt, // Add published time
      // authors: post.author ? [getAuthorDisplayName(post.author)] : [], // Add author if available, might need getAuthorDisplayName
    },
    // You can add Twitter card metadata here as well if desired
    // twitter: {
    //   card: 'summary_large_image',
    //   title: post.name,
    //   description: postDescription,
    //   images: [ogImage],
    //   creator: '@yourTwitterHandle', // Optional
    // },
  }
}

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

  let relatedPosts: BlogPost[] = []
  if (post.categories && post.categories.length > 0) {
    // Extract category IDs. Categories can be objects or just IDs depending on depth.
    const categoryIds = post.categories
      .map((cat) => {
        if (typeof cat === 'string') return cat
        return (cat as BlogCategory).id
      })
      .filter((id) => id != null) as string[]

    if (categoryIds.length > 0) {
      relatedPosts = await getRelatedPosts(categoryIds, post.id)
    }
  }

  return (
    <main className="bg-gray-50 min-h-screen">
      <ArticleView post={post} relatedPosts={relatedPosts} />
    </main>
  )
}

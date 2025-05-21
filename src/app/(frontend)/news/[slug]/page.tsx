import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { BlogPost, BlogCategory } from '@/payload-types'
import { notFound } from 'next/navigation'
import type { Metadata, ResolvingMetadata } from 'next'
import { getPostImageFromLayout, getPostExcerpt } from '@/utils/postUtils'
import { ArticleClientView } from '@/components/news/ArticleClientView'

interface PageProps {
  params: Promise<{ slug: string }>
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
  { params: paramsPromise }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { slug } = await paramsPromise
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Article Not Found',
      description: 'The article you are looking for does not exist.',
    }
  }

  const parentMetadata = await parent
  const parentTitle = parentMetadata.title?.absolute ?? 'Dawan Africa'
  const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

  // Get post description with length limit for metadata
  const postDescription = getPostExcerpt(post, { maxLength: 160 })

  // Get cover image URL from post layout
  const coverImageUrl = getPostImageFromLayout(post.layout)

  // Ensure we have an absolute URL for the image
  const ogImage = coverImageUrl
    ? coverImageUrl.startsWith('http')
      ? coverImageUrl
      : `${siteUrl}${coverImageUrl}`
    : `${siteUrl}/placeholder-og-image.png`

  // Get author name if available
  const authorName =
    typeof post.author === 'object' && post.author?.name ? post.author.name : 'Dawan Africa'

  return {
    title: `${post.name} | ${parentTitle}`,
    description: postDescription,
    openGraph: {
      title: post.name,
      description: postDescription,
      url: `${siteUrl}/news/${post.slug}`,
      siteName: parentMetadata.openGraph?.siteName ?? 'Dawan Africa',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.name,
        },
      ],
      type: 'article',
      publishedTime: post.createdAt,
      authors: [authorName],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.name,
      description: postDescription,
      images: [ogImage],
    },
  }
}

export default async function NewsArticlePage({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await paramsPromise
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
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
      <ArticleClientView post={post} relatedPosts={relatedPosts} />
    </main>
  )
}

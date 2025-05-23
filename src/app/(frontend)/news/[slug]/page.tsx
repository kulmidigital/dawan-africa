import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { BlogPost, BlogCategory } from '@/payload-types'
import { notFound } from 'next/navigation'
import type { Metadata, ResolvingMetadata } from 'next'
import { ArticleClientView } from '@/components/news/ArticleClientView'
import { generateArticleMetadata, generateArticleJsonLd, SITE_CONFIG } from '@/lib/seo'

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
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const currentUrl = `${SITE_CONFIG.url}/news/${post.slug}`

  return generateArticleMetadata({
    post,
    currentUrl,
  })
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

  // Generate JSON-LD structured data
  const currentUrl = `${SITE_CONFIG.url}/news/${post.slug}`
  const articleJsonLd = generateArticleJsonLd({
    post,
    currentUrl,
  })

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* JSON-LD structured data for the article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd),
        }}
      />
      <ArticleClientView post={post} relatedPosts={relatedPosts} />
    </main>
  )
}

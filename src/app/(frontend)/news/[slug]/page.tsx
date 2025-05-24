import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { BlogPost, BlogCategory } from '@/payload-types'
import { notFound } from 'next/navigation'
import type { Metadata, ResolvingMetadata } from 'next'
import { getPostImageFromLayout, getPostExcerpt } from '@/utils/postUtils'
import { ArticleClientView } from '@/components/news/ArticleClientView'
import { sharedMetadata } from '@/app/shared-metadata'
import siteConfig from '@/app/shared-metadata'

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
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  // Get the post data
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const post = await payload
    .find({
      collection: 'blogPosts',
      where: {
        slug: {
          equals: params.slug,
        },
      },
    })
    .then((res) => res.docs[0] as BlogPost)

  if (!post) {
    return {
      ...sharedMetadata,
      title: 'Article Not Found | Dawan Africa',
    }
  }

  // Get the excerpt from the layout
  const excerpt = getPostExcerpt(post)

  // Get the cover image from the layout
  const coverImage = post.layout?.find((block) => block.blockType === 'cover')?.image
  const ogImageUrl = coverImage
    ? typeof coverImage === 'string'
      ? coverImage
      : coverImage?.url
    : null

  // Ensure we have a valid image URL
  const ogImage =
    ogImageUrl || new URL(`/news/${params.slug}/opengraph-image`, siteConfig.url).toString()

  return {
    ...sharedMetadata,
    title: `${post.name} | Dawan Africa`,
    description:
      excerpt ||
      'Read this insightful article on Dawan Africa, your trusted source for African news and perspectives.',
    openGraph: {
      ...sharedMetadata.openGraph,
      title: post.name,
      description:
        excerpt ||
        'Read this insightful article on Dawan Africa, your trusted source for African news and perspectives.',
      url: new URL(`/news/${params.slug}`, siteConfig.url).toString(),
      type: 'article',
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [siteConfig.url],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.name,
        },
      ],
    },
    twitter: {
      ...sharedMetadata.twitter,
      title: post.name,
      description:
        excerpt ||
        'Read this insightful article on Dawan Africa, your trusted source for African news and perspectives.',
      images: [ogImage],
    },
    alternates: {
      canonical: new URL(`/news/${params.slug}`, siteConfig.url).toString(),
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

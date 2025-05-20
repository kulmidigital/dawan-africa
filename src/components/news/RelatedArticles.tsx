'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { BlogPost } from '@/payload-types'
import Image from 'next/image'
import { Calendar, Tag } from 'lucide-react'

interface RelatedArticlesProps {
  posts: BlogPost[]
  currentPostId?: string
}

export const RelatedArticles: React.FC<RelatedArticlesProps> = ({ posts, currentPostId }) => {
  // Filter out current post and shuffle the remaining posts
  const filteredPosts = useMemo(() => {
    // First filter out the current post
    const filtered = currentPostId ? posts.filter((post) => post.id !== currentPostId) : [...posts]

    // Then shuffle the array (Fisher-Yates algorithm)
    for (let i = filtered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[filtered[i], filtered[j]] = [filtered[j], filtered[i]]
    }

    // Return at most 6 posts
    return filtered.slice(0, 6)
  }, [posts, currentPostId])

  if (!filteredPosts || filteredPosts.length === 0) {
    return null // Don't render anything if there are no related posts
  }

  // Extract a thumbnail image from the post's layout blocks if available
  const getPostThumbnail = (post: BlogPost) => {
    if (!post.layout || !Array.isArray(post.layout)) return null

    // Try to find an image in the post's layout blocks
    for (const block of post.layout) {
      if (block.blockType === 'cover' && block.image && typeof block.image !== 'string') {
        return block.image.url
      }
      if (block.blockType === 'image' && block.image && typeof block.image !== 'string') {
        return block.image.url
      }
    }
    return null
  }

  // Format date from post if available
  const formatDate = (post: BlogPost) => {
    if (!post.createdAt) return null
    const date = new Date(post.createdAt)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Determine the grid layout based on the number of items
  const gridClass =
    filteredPosts.length > 3
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
      : filteredPosts.length === 3
        ? 'grid grid-cols-1 md:grid-cols-3 gap-6'
        : 'grid grid-cols-1 md:grid-cols-2 gap-6'

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 mb-8">Related Articles</h2>
      <div className={gridClass}>
        {filteredPosts.map((post) => {
          const thumbnailUrl = getPostThumbnail(post)
          const postDate = formatDate(post)

          return (
            <Link
              key={post.id}
              href={`/news/${post.slug}`}
              className="group flex flex-col h-full bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#2aaac6]/30"
            >
              {/* Thumbnail image if available */}
              {thumbnailUrl ? (
                <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                  <Image
                    src={thumbnailUrl}
                    alt={post.name || 'Article thumbnail'}
                    className="object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
                    fill
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ) : (
                <div className="h-32 bg-gradient-to-r from-[#2aaac6]/10 to-[#2aaac6]/20 flex items-center justify-center">
                  <span className="text-[#2aaac6] font-medium">Read Article</span>
                </div>
              )}

              {/* Article info */}
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-[#2aaac6] transition-colors duration-300 mb-2 line-clamp-2">
                  {post.name}
                </h3>

                <div className="mt-auto pt-4">
                  {/* Date if available */}
                  {postDate && (
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      <span>{postDate}</span>
                    </div>
                  )}

                  {/* Categories if available */}
                  {post.categories &&
                    Array.isArray(post.categories) &&
                    post.categories.length > 0 && (
                      <div className="flex items-start gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-gray-500 mt-0.5" />
                        <div className="flex flex-wrap gap-1.5">
                          {post.categories.map((category, index) => {
                            const categoryName =
                              typeof category !== 'string' && category.name ? category.name : ''
                            if (!categoryName) return null

                            return (
                              <span
                                key={index}
                                className="inline-block px-2 py-0.5 text-xs bg-[#2aaac6]/10 text-[#2aaac6] rounded-full"
                              >
                                {categoryName}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    )}
                </div>

                {/* Read more indication */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <span className="inline-block text-sm font-medium text-[#2aaac6] group-hover:translate-x-1 transition-transform duration-300">
                    Read more →
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

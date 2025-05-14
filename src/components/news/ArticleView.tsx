'use client'

import React from 'react'
import { BlogPost } from '@/payload-types'
import { BlockRenderer } from './BlockRenderer'
import { ArticleHeader } from './ArticleHeader'
import { Bookmark, MessageCircle, ThumbsUp } from 'lucide-react'
import Link from 'next/link'

interface ArticleViewProps {
  post: BlogPost
}

export const ArticleView: React.FC<ArticleViewProps> = ({ post }) => {
  if (!post) return <div>Article not found.</div>

  const firstBlockIsCover = !!(
    post.layout &&
    post.layout.length > 0 &&
    post.layout[0].blockType?.toLowerCase() === 'cover'
  )

  return (
    <div className="bg-white min-h-screen">
      {/* Header Section */}
      <ArticleHeader post={post} />

      <article className="relative">
        {/* Article Content Container */}
        <div className="container mx-auto px-4 sm:px-6 md:px-8 relative">
          <div className="max-w-3xl mx-auto bg-white rounded-t-2xl -mt-6 sm:-mt-10 pt-10 pb-16 px-5 sm:px-8 md:px-12 shadow-sm relative z-10 article-content">
            {/* Main Content - Render Blocks */}
            {post.layout && post.layout.length > 0 ? (
              post.layout.map((block, i) => {
                // Skip rendering the first block if it's a cover or image type,
                // as ArticleHeader will handle its display.
                if (i === 0) {
                  const blockType = block.blockType?.toLowerCase()
                  if (blockType === 'cover' || blockType === 'image') {
                    return null
                  }
                }

                const hideCoverBlockTextOverlay = i === 0 && firstBlockIsCover
                return (
                  <BlockRenderer
                    key={`${block.blockType}-${i}-${post.id}`}
                    block={block}
                    hideTextOverlay={hideCoverBlockTextOverlay}
                  />
                )
              })
            ) : (
              <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-800">
                <p>This article doesn&apos;t have any content blocks yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Article Engagement */}
        <div className="bg-gray-50 py-8 sm:py-12 mt-8 border-t border-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              {/* Engagement Section */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm hover:shadow transition-all border border-gray-200">
                    <ThumbsUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Like</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm hover:shadow transition-all border border-gray-200">
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Comment</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm hover:shadow transition-all border border-gray-200">
                    <Bookmark className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Save</span>
                  </button>
                </div>
              </div>

              {/* Navigation options */}
              <div className="flex justify-between">
                <Link
                  href="/news"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 transition-colors text-white font-medium rounded-lg"
                >
                  More Articles
                </Link>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-6 py-3 bg-white hover:bg-gray-50 transition-colors text-blue-600 font-medium border border-blue-200 rounded-lg"
                >
                  Back to Top
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}

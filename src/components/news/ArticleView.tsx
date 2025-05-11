'use client'

import React from 'react'
import { BlogPost } from '@/payload-types'
import { BlockRenderer } from './BlockRenderer'
import { ArticleHeader } from './ArticleHeader'

interface ArticleViewProps {
  post: BlogPost
}

export const ArticleView: React.FC<ArticleViewProps> = ({ post }) => {
  if (!post) return <div>Article not found.</div>

  return (
    <article className="bg-white py-4 sm:py-6 md:py-10">
      <div className="container mx-auto px-4">
        {/* Article Header */}
        <ArticleHeader post={post} />

        {/* Main Content - Render Blocks */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {post.layout && post.layout.length > 0 ? (
            post.layout.map((block, i) => (
              <BlockRenderer key={`${block.blockType}-${i}`} block={block} />
            ))
          ) : (
            <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-800">
              <p>This article doesn&apos;t have any content blocks yet.</p>
            </div>
          )}
        </div>

        {/* Optional: Share Buttons */}
        {/* <div className="max-w-3xl mx-auto mt-6 sm:mt-8 md:mt-10 pt-4 sm:pt-6 border-t">
          <ShareButtons url={`/news/${post.slug}`} title={post.name} />
        </div> */}

        {/* Optional: Related Articles */}
        {/* <div className="mt-8 sm:mt-12 md:mt-16">
          <RelatedArticles currentPostId={post.id} /> 
        </div> */}

        {/* Optional: Comments Section */}
        {/* <div className="max-w-3xl mx-auto mt-8 sm:mt-12 md:mt-16 pt-6 sm:pt-8 md:pt-10 border-t">
          <CommentsSection postId={post.id} />
        </div> */}
      </div>
    </article>
  )
}

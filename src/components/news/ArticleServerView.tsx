import React from 'react'
import { BlogPost } from '@/payload-types'
import { BlockRenderer } from './BlockRenderer'
import { ArticleHeader } from './ArticleHeader'
import { RelatedArticles } from './RelatedArticles'
import { ArticleInteractions } from './ArticleInteractions'
import { BackToTopButton } from './BackToTopButton'
import { AudioTrigger } from '@/components/audio/AudioTrigger'
import type { AudioTrack } from '@/contexts/AudioPlayerContext'
import Link from 'next/link'

interface ArticleServerViewProps {
  post: BlogPost
  relatedPosts: BlogPost[]
  currentUrl: string
}

export const ArticleServerView: React.FC<ArticleServerViewProps> = ({
  post,
  relatedPosts,
  currentUrl,
}) => {
  const firstBlockIsCover = !!(
    post.layout &&
    post.layout.length > 0 &&
    post.layout[0].blockType?.toLowerCase() === 'cover'
  )

  return (
    <div className="bg-white min-h-screen">
      {/* Header Section */}
      <ArticleHeader post={post} currentUrl={currentUrl} />

      <article className="relative">
        {/* Article Content Container */}
        <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto bg-white rounded-t-2xl -mt-2 sm:-mt-10 pt-6 sm:pt-10 pb-8 sm:pb-16 px-4 sm:px-8 md:px-12 shadow-sm relative z-10 article-content">
            {/* Audio Player Section */}
            {post.audioUrl && (
              <div className="mb-6 sm:mb-8">
                <AudioTrigger
                  track={
                    {
                      id: post.id,
                      title: post.name,
                      src: post.audioUrl,
                      articleSlug: post.slug,
                    } as AudioTrack
                  }
                  variant="button"
                  size="lg"
                  className="mx-auto"
                >
                  Listen to Article
                </AudioTrigger>
              </div>
            )}

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

        {/* Article Engagement & Navigation */}
        <div className="bg-gray-50 py-6 sm:py-8 md:py-12 mt-6 sm:mt-8 border-t border-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              {/* Engagement Section - Client Component */}
              <ArticleInteractions post={post} currentUrl={currentUrl} />

              {/* Navigation options */}
              <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-8">
                <Link
                  href="/news"
                  className="px-6 py-3 bg-[#2aaac6] hover:bg-[#238ca3] transition-colors text-white font-medium rounded-lg text-center sm:text-left"
                >
                  More Articles
                </Link>
                <BackToTopButton className="px-6 py-3 bg-white hover:bg-gray-50 transition-colors text-[#2aaac6] font-medium border border-gray-200 rounded-lg text-center sm:text-left">
                  Back to Top
                </BackToTopButton>
              </div>

              {/* Related Articles Section */}
              {relatedPosts && relatedPosts.length > 0 && (
                <RelatedArticles posts={relatedPosts} currentPostId={post.id} />
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}

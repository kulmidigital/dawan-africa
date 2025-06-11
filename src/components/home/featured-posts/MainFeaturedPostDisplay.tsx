import React from 'react'
import Link from 'next/link'
import { BlogPost } from '@/payload-types'
import { ArrowRight, Calendar } from 'lucide-react'
import Image from 'next/image'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { getPostImageFromLayout, getPostExcerpt, getPostAuthorDisplayName } from '@/utils/postUtils'
import { formatTimeAgo } from '@/utils/dateUtils'

interface MainFeaturedPostDisplayProps {
  post: BlogPost | null // Can be null if not enough posts
}

export const MainFeaturedPostDisplay: React.FC<MainFeaturedPostDisplayProps> = ({ post }) => {
  if (!post) return null

  const imageUrl = getPostImageFromLayout(post.layout)
  const excerpt = getPostExcerpt(post, { maxLength: 180, prioritizeCoverSubheading: false })
  const authorName = getPostAuthorDisplayName(post)

  return (
    <div className="lg:col-span-5">
      <Card className="group h-full overflow-hidden border-0 shadow-md sm:shadow-xl transition-all duration-300 hover:shadow-2xl">
        <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full w-full overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={post.name}
              fill
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-blue-50 to-teal-50 flex items-center justify-center">
              <span className="text-[#2aaac6]/70 text-base sm:text-xl font-sans font-bold">
                Featured Story
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <div className="absolute bottom-0 left-0 p-3 sm:p-6">
              <div className="mb-2 flex items-center text-[10px] sm:text-xs text-gray-300 gap-2 sm:gap-3 flex-wrap">
                <span className="flex items-center">
                  <Calendar className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  {formatTimeAgo(post.createdAt)}
                </span>
                {typeof post.author === 'object' && post.author && (
                  <span className="flex items-center">
                    <span className="inline-block w-1 h-1 rounded-full bg-gray-400 mr-2"></span>
                    {authorName}
                  </span>
                )}
              </div>
              <h2 className="mb-2 sm:mb-3 font-sans text-lg sm:text-xl md:text-2xl font-bold leading-tight text-white break-words">
                <Link href={`/news/${post.slug}`} className="hover:underline">
                  {post.name}
                </Link>
              </h2>
              <p className="mb-3 sm:mb-5 text-xs sm:text-sm leading-relaxed text-gray-200 line-clamp-2 sm:line-clamp-3">
                {excerpt}
              </p>
              <Button
                asChild
                className="bg-[#2aaac6] hover:bg-[#2aaac6]/80 text-white gap-1 group-hover:gap-2 transition-all text-xs sm:text-sm h-8 sm:h-9"
              >
                <Link href={`/news/${post.slug}`}>
                  Read Full Story
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

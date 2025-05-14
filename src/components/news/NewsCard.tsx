'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BlogPost } from '@/payload-types'
import { ArrowRight, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Import utility functions
import { getPostImageFromLayout, getPostExcerpt, getAuthorDisplayName } from '@/utils/postUtils'
import { formatTimeAgo } from '@/utils/dateUtils'

interface NewsCardProps {
  post: BlogPost
}

export const NewsCard: React.FC<NewsCardProps> = ({ post }) => {
  const imageUrl = getPostImageFromLayout(post.layout)
  const excerpt = getPostExcerpt(post, { maxLength: 120, prioritizeCoverSubheading: false })
  const authorName = getAuthorDisplayName(post.author)
  const timeAgo = formatTimeAgo(post.createdAt)

  return (
    <Card className="group overflow-hidden border-0 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <Link href={`/news/${post.slug}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={post.name}
              width={1600}
              height={900}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-xs sm:text-sm text-gray-400">No image</span>
            </div>
          )}
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
            {post.author && typeof post.author === 'object' && (
              <Badge
                variant="secondary"
                className="bg-black/20 text-white backdrop-blur-sm text-[10px] sm:text-xs"
              >
                {authorName}
              </Badge>
            )}
          </div>
        </div>
      </Link>
      <CardContent className="p-3 sm:p-4 md:p-5">
        <div className="flex items-center text-[10px] sm:text-xs text-gray-500 mb-2 sm:mb-3 gap-2 sm:gap-3 flex-wrap">
          <span className="flex items-center">
            <Clock className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5" />
            {timeAgo}
          </span>
        </div>

        <h3 className="font-serif text-base sm:text-lg font-bold leading-tight line-clamp-2 mb-2 sm:mb-3 text-gray-800 group-hover:text-[#2aaac6] transition-colors">
          <Link href={`/news/${post.slug}`} className="hover:underline">
            {post.name}
          </Link>
        </h3>

        {excerpt && (
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4">
            {excerpt}
          </p>
        )}

        <Button
          asChild
          variant="ghost"
          size="sm"
          className="p-0 h-auto text-[#2aaac6] hover:bg-transparent hover:text-[#2aaac6]/80 group-hover:text-[#218ba0]"
        >
          <Link href={`/news/${post.slug}`} className="flex items-center">
            <span className="text-xs sm:text-sm">Read more</span>
            <ArrowRight className="ml-1 sm:ml-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BlogPost } from '@/payload-types'
import { ArrowRight } from 'lucide-react'
import { CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface FeaturedPostCardProps {
  latestPost: BlogPost
  featuredImage: string | null
  excerpt: string
  formatTimeAgo: (dateString: string) => string
}

export const FeaturedPostCard: React.FC<FeaturedPostCardProps> = ({
  latestPost,
  featuredImage,
  excerpt,
  formatTimeAgo,
}) => {
  return (
    <>
      {featuredImage ? (
        <div className="relative aspect-[4/3] sm:aspect-video w-full overflow-hidden">
          <Image
            src={featuredImage}
            alt={latestPost.name}
            fill
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent">
            <div className="absolute bottom-0 left-0 p-3 sm:p-4 md:p-6">
              <div className="mb-2 flex gap-2">
                <Badge className="text-xs font-medium" style={{ backgroundColor: '#2aaac6' }}>
                  FEATURED
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-black/30 text-xs font-normal text-gray-200 backdrop-blur-sm"
                >
                  {formatTimeAgo(latestPost.createdAt)}
                </Badge>
              </div>
              <h1 className="mb-2 sm:mb-3 font-sans text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-white">
                {latestPost.name}
              </h1>
              {excerpt && (
                <p className="mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 max-w-xl font-sans text-xs sm:text-sm md:text-base leading-relaxed text-gray-200">
                  {excerpt}
                </p>
              )}
              <Link
                href={`/news/${latestPost.slug}`}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white transition-all hover:gap-2"
                style={{ backgroundColor: '#2aaac6' }}
              >
                Read Full Story
                <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <CardContent className="p-4 sm:p-6">
          <h1 className="mb-3 font-sans text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-gray-900">
            {latestPost.name}
          </h1>
          {excerpt && (
            <p className="mb-4 font-sans text-sm sm:text-base leading-relaxed text-gray-700">
              {excerpt}
            </p>
          )}
          <Link
            href={`/news/${latestPost.slug}`}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white transition-all hover:gap-2"
            style={{ backgroundColor: '#2aaac6' }}
          >
            Read Full Story
            <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
          </Link>
        </CardContent>
      )}
    </>
  )
}

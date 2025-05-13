'use client'

import React from 'react'
import Link from 'next/link'
import { BlogPost} from '@/payload-types'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { getPostImageFromLayout, getPostExcerpt, getAuthorDisplayName } from '@/utils/postUtils'
import { formatTimeAgo } from '@/utils/dateUtils'

interface GridPostsProps {
  posts: BlogPost[]
}

export const GridPosts: React.FC<GridPostsProps> = ({ posts }) => {
  if (!posts || posts.length === 0) return null

  return (
    <div className="lg:col-span-7">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {posts.map((post) => {
          const imageUrl = getPostImageFromLayout(post.layout)
          const excerpt = getPostExcerpt(post, { maxLength: 80, prioritizeCoverSubheading: false })
          const authorName = getAuthorDisplayName(post.author)

          return (
            <Card
              key={post.id}
              className="group overflow-hidden border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-200"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={post.name}
                    fill
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No image</span>
                  </div>
                )}
              </div>
              <CardContent className="p-3 sm:p-4">
                <div className="text-[10px] sm:text-xs text-gray-500 mb-1.5 sm:mb-2 flex gap-2 items-center flex-wrap">
                  {formatTimeAgo(post.createdAt)}
                  {typeof post.author === 'object' && post.author && (
                    <>
                      <span className="inline-block w-1 h-1 rounded-full bg-gray-300"></span>
                      <span>{authorName}</span>
                    </>
                  )}
                </div>
                <h3 className="font-serif text-sm sm:text-base font-bold line-clamp-2 mb-1.5 sm:mb-2 group-hover:text-[#2aaac6] transition-colors break-words">
                  <Link href={`/news/${post.slug}`} className="hover:underline">
                    {post.name}
                  </Link>
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2 mb-2 sm:mb-3">{excerpt}</p>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto text-[#2aaac6] hover:bg-transparent hover:text-[#2aaac6]/80"
                >
                  <Link href={`/news/${post.slug}`} className="flex items-center">
                    <span className="text-xs sm:text-sm">Read more</span>
                    <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

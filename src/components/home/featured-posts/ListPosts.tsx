import React from 'react'
import Link from 'next/link'
import { BlogPost } from '@/payload-types'
import { ArrowRight, Clock, Tag } from 'lucide-react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import { getPostImageFromLayout } from '@/utils/postUtils'
import { formatTimeAgo } from '@/utils/dateUtils'

interface ListPostsProps {
  posts: BlogPost[]
}

export const ListPosts: React.FC<ListPostsProps> = ({ posts }) => {
  if (!posts || posts.length === 0) return null

  return (
    <div className="mt-8 sm:mt-12 overflow-hidden">
      <div className="text-center mb-6 sm:mb-8 relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full bg-gray-200" />
        </div>
        <span className="relative bg-gradient-to-b from-white to-gray-50 px-4 sm:px-6 inline-flex items-center">
          <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-[#2aaac6] mr-2" />
          <h3 className="font-sans text-lg sm:text-xl font-bold text-gray-800">Recent Articles</h3>
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-x-5 sm:gap-y-4 w-full">
        {posts.map((post) => {
          const imageUrl = getPostImageFromLayout(post.layout)
          // This list style doesn't show excerpt or author directly

          return (
            <div
              key={post.id}
              className="group flex gap-2 sm:gap-3 items-start pb-3 sm:pb-4 border-b border-gray-100 hover:border-[#2aaac6]/20 transition-colors w-full overflow-hidden hover:bg-gray-50/50 px-2 rounded-sm"
            >
              <div className="relative flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-md overflow-hidden bg-gray-100">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={post.name}
                    fill
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-[10px] sm:text-xs">No image</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="text-[10px] sm:text-xs text-gray-500 mb-1 flex items-center">
                  <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 flex-shrink-0" />
                  {formatTimeAgo(post.createdAt)}
                </div>
                <h4 className="font-sans text-xs sm:text-sm font-bold leading-tight line-clamp-2 group-hover:text-[#2aaac6] transition-colors">
                  <Link href={`/news/${post.slug}`} className="hover:underline">
                    {post.name}
                  </Link>
                </h4>
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-8 sm:mt-10 text-center">
        <Link href="/news">
          <Button
            variant="outline"
            className="border-[#2aaac6] text-[#2aaac6] hover:bg-[#2aaac6]/5 transition-all text-xs sm:text-sm h-9"
          >
            View All Articles
            <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

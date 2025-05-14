'use client'

import React from 'react'
import Link from 'next/link'
import { BlogPost } from '@/payload-types'
import { Clock } from 'lucide-react'

interface RecentNewsItemProps {
  post: BlogPost
  imageUrl: string | null
  formatTimeAgo: (dateString: string) => string
}

export const RecentNewsItem: React.FC<RecentNewsItemProps> = ({
  post,
  imageUrl,
  formatTimeAgo,
}) => {
  return (
    <div className="group p-2 sm:p-3 transition-colors hover:bg-gray-50">
      <div className="flex gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <div className="mb-1 text-[10px] sm:text-xs font-medium text-gray-500 flex items-center">
            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 text-[#2aaac6]" />
            {formatTimeAgo(post.createdAt)}
          </div>
          <h3 className="mb-1 sm:mb-2 font-sans text-xs sm:text-sm font-medium text-gray-900 transition-colors group-hover:text-[#2aaac6] line-clamp-2">
            <Link href={`/news/${post.slug}`} className="hover:underline">
              {post.name}
            </Link>
          </h3>
        </div>
        <div className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded-md">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={post.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ backgroundColor: 'rgba(42, 170, 198, 0.1)' }}
            >
              <span className="text-[10px] sm:text-xs" style={{ color: '#2aaac6' }}>
                No image
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

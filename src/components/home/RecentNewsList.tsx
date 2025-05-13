'use client'

import React from 'react'
import { BlogPost } from '@/payload-types'
import { Newspaper } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { RecentNewsItem } from './RecentNewsItem'
import { getPostImageFromLayout } from '@/utils/postUtils'

interface RecentNewsListProps {
  posts: BlogPost[]
  formatTimeAgo: (dateString: string) => string
  postsToShow: number
}

export const RecentNewsList: React.FC<RecentNewsListProps> = ({
  posts,
  formatTimeAgo,
  postsToShow,
}) => {
  return (
    <Card className="h-full border-0 shadow-md">
      <div
        className="sticky top-0 flex items-center justify-between gap-2 border-b border-gray-100 bg-white p-2 sm:p-3 z-10"
        style={{ borderColor: '#2aaac6' }}
      >
        <div className="flex items-center gap-1 sm:gap-2">
          <Newspaper className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#2aaac6' }} />
          <h2 className="font-serif text-base sm:text-xl font-bold text-gray-900">Recent News</h2>
        </div>
        <div className="text-[10px] sm:text-xs text-[#2aaac6] font-medium">
          {postsToShow} articles
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {Array.from({ length: postsToShow }).map((_, index) => {
          const post = posts[index % Math.max(1, posts.length)]
          if (!post) return null

          const imageUrl = getPostImageFromLayout(post.layout)

          return (
            <RecentNewsItem
              key={`${post.id}-${index}`}
              post={post}
              imageUrl={imageUrl}
              formatTimeAgo={formatTimeAgo}
            />
          )
        })}
      </div>
    </Card>
  )
}

'use client'

import React from 'react'
import Link from 'next/link'
import { BlogPost } from '@/payload-types'
import { Zap } from 'lucide-react'

interface FlashNewsProps {
  currentFlashPost: BlogPost | undefined
  formatTimeAgo: (dateString: string) => string
}

export const FlashNews: React.FC<FlashNewsProps> = ({ currentFlashPost, formatTimeAgo }) => {
  if (!currentFlashPost) return null

  return (
    <div
      className="relative overflow-hidden"
      style={{ backgroundColor: 'rgba(42, 170, 198, 0.03)' }}
    >
      <div className="flex flex-wrap sm:flex-nowrap items-center">
        <div
          className="flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 text-white"
          style={{ backgroundColor: '#2aaac6' }}
        >
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse text-white" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">
              FLASH NEWS
            </span>
          </div>
        </div>

        <div className="flex-1 animate-fadeIn overflow-hidden px-3 py-1.5 sm:px-4 sm:py-2 transition-all duration-500">
          <Link
            href={`/news/${currentFlashPost.slug}`}
            className="text-gray-800 hover:text-[#2aaac6] hover:underline transition-colors"
          >
            <span className="line-clamp-1 text-xs sm:text-sm font-medium">
              {currentFlashPost.name}
            </span>
          </Link>
        </div>

        <div
          className="w-full sm:w-auto sm:ml-auto flex-shrink-0 border-t sm:border-t-0 sm:border-l px-3 py-1.5 sm:px-4 sm:py-2 text-xs"
          style={{
            borderColor: 'rgba(42, 170, 198, 0.2)',
            color: 'rgba(42, 170, 198, 0.8)',
          }}
        >
          {formatTimeAgo(currentFlashPost.createdAt)}
        </div>
      </div>
    </div>
  )
}

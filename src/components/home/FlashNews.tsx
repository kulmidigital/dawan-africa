'use client'

import React from 'react'
import Link from 'next/link'
import { BlogPost } from '@/payload-types'
import { Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatTimeAgo } from '@/utils/dateUtils'

interface FlashNewsProps {
  currentFlashPost: BlogPost | undefined
}

export const FlashNews: React.FC<FlashNewsProps> = ({ currentFlashPost }) => {
  if (!currentFlashPost) return null

  return (
    <div
      className="relative overflow-hidden border-b"
      style={{
        backgroundColor: 'rgba(42, 170, 198, 0.03)',
        borderColor: 'rgba(42, 170, 198, 0.12)',
      }}
    >
      <div className="flex flex-wrap sm:flex-nowrap items-stretch">
        <div
          className="flex-shrink-0 px-3 py-1 sm:px-4 sm:py-1.5 text-white"
          style={{ backgroundColor: '#2aaac6' }}
        >
          <div className="flex items-center gap-1 h-full">
            <Zap className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse text-white" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">FLASH</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentFlashPost.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="flex-1 overflow-hidden px-3 py-1 sm:px-4 sm:py-1.5"
          >
            <Link
              href={`/news/${currentFlashPost.slug}`}
              className="text-gray-800 hover:text-[#2aaac6] hover:underline transition-colors"
            >
              <span className="line-clamp-1 text-xs sm:text-sm font-medium">
                {currentFlashPost.name}
              </span>
            </Link>
          </motion.div>
        </AnimatePresence>

        <div
          className="w-full sm:w-auto sm:ml-auto flex-shrink-0 border-t sm:border-t-0 sm:border-l px-3 py-1 sm:px-4 sm:py-1.5 text-xs"
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

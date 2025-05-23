'use client'

import React, { useEffect, useState } from 'react'
import { BlogPost } from '@/payload-types'
import { FlashNews } from './FlashNews'

interface HeroSectionClientProps {
  recentPosts: BlogPost[]
  children: React.ReactNode
}

export const HeroSectionClient: React.FC<HeroSectionClientProps> = ({ recentPosts, children }) => {
  const [currentFlashIndex, setCurrentFlashIndex] = useState(0)

  useEffect(() => {
    if (recentPosts.length <= 1) return
    const interval = setInterval(() => {
      setCurrentFlashIndex((prevIndex) =>
        prevIndex === recentPosts.length - 1 ? 0 : prevIndex + 1,
      )
    }, 5000)
    return () => clearInterval(interval)
  }, [recentPosts.length])

  const currentFlashPost = recentPosts[currentFlashIndex]

  return (
    <>
      {/* Flash News - hidden on small screens */}
      {recentPosts.length > 0 && (
        <div className="hidden md:block">
          <FlashNews currentFlashPost={currentFlashPost} />
        </div>
      )}

      {/* Server-rendered content */}
      {children}
    </>
  )
}

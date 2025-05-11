'use client'

import React from 'react'
import { BlogPost, User, Media } from '@/payload-types'
import { format } from 'date-fns'
import { CalendarDays, Clock, UserCircle } from 'lucide-react'

interface ArticleHeaderProps {
  post: BlogPost
}

// Get author name (can be shared or defined locally)
const getAuthorName = (author: string | User | null): string => {
  if (!author) return 'Dawan Africa Team' // Default author name
  if (typeof author === 'object') {
    return author.email?.split('@')[0] || 'Dawan Africa User'
  }
  return 'Dawan Africa' // Fallback if author is a string (ID)
}

// Get the main cover image if available
const getCoverImage = (post: BlogPost): string | null => {
  if (!post.layout) return null
  for (const block of post.layout) {
    if (block.blockType === 'cover' && block.image) {
      const media = typeof block.image === 'string' ? null : (block.image as Media)
      return media?.url || null
    }
  }
  // As a fallback, check for a top-level image block if no cover image exists
  for (const block of post.layout) {
    if (block.blockType === 'image' && block.image) {
      const media = typeof block.image === 'string' ? null : (block.image as Media)
      return media?.url || null
    }
  }
  return null
}

export const ArticleHeader: React.FC<ArticleHeaderProps> = ({ post }) => {
  const authorName = getAuthorName(post.author)
  const publishedDate = format(new Date(post.createdAt), 'MMMM d, yyyy')
  const readingTime = Math.ceil((post.name.split(' ').length / 200) * 2) // Rough estimate
  const coverImageUrl = getCoverImage(post)

  return (
    <header className="mb-6 sm:mb-8 md:mb-10 pt-4 sm:pt-6 md:pt-8">
      {/* Cover Image if available */}
      {coverImageUrl && (
        <div className="mb-4 sm:mb-6 md:mb-8 h-48 sm:h-64 md:h-80 lg:h-[500px] w-full overflow-hidden rounded-lg sm:rounded-xl shadow-md sm:shadow-xl md:shadow-2xl">
          <img src={coverImageUrl} alt={post.name} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-extrabold text-gray-900 mb-4 sm:mb-6 leading-tight">
          {post.name}
        </h1>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 text-gray-600 mb-4 sm:mb-6 text-xs sm:text-sm md:text-base">
          <div className="flex items-center">
            <UserCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-[#2aaac6]" />
            <span>By {authorName}</span>
          </div>
          <div className="flex items-center">
            <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-[#2aaac6]" />
            <span>{publishedDate}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-[#2aaac6]" />
            <span>{readingTime} min read</span>
          </div>
        </div>

        {/* Categories/Tags if available (assuming categories are part of post data directly or via relation) */}
        {/* This part needs adjustment based on how categories are linked to posts */}
        {/* {post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-4 sm:mb-8">
            <TagIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            {(post.categories as BlogCategory[]).map((category) => (
              <Badge key={category.id} variant="secondary" className="text-xs sm:text-sm bg-[#2aaac6]/10 text-[#2aaac6] hover:bg-[#2aaac6]/20">
                {category.name}
              </Badge>
            ))}
          </div>
        )} */}
      </div>
    </header>
  )
}

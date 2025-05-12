'use client'

import React from 'react'
import Link from 'next/link'
import { BlogPost, Media, User } from '@/payload-types'
import { formatDistanceToNow } from 'date-fns'
import { ArrowRight, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface NewsCardProps {
  post: BlogPost
}

// Helper function to get post image (similar to other components)
const getPostImage = (post: BlogPost): string | null => {
  if (!post.layout) return null
  for (const block of post.layout) {
    if (block.blockType === 'cover' && block.image) {
      const media = typeof block.image === 'string' ? null : (block.image as Media)
      return media?.url || null
    }
  }
  for (const block of post.layout) {
    if (block.blockType === 'image' && block.image) {
      const media = typeof block.image === 'string' ? null : (block.image as Media)
      return media?.url || null
    }
  }
  return null
}

// Helper function to get post excerpt (similar to other components)
const getPostExcerpt = (post: BlogPost, maxLength = 120): string => {
  if (!post.layout) return ''
  for (const block of post.layout) {
    if (block.blockType === 'richtext' && block.content?.root?.children?.[0]?.text) {
      const text = block.content.root.children[0].text as string
      return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
    }
  }
  return ''
}

// Format time ago
const formatTimeAgo = (dateString: string): string => {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true })
}

// Get author name
const getAuthorName = (author: string | User | null): string => {
  if (!author) return 'Unknown Author'
  if (typeof author === 'object') {
    return author.email?.split('@')[0] || 'Unknown Author'
  }
  return 'Unknown Author'
}

export const NewsCard: React.FC<NewsCardProps> = ({ post }) => {
  const imageUrl = getPostImage(post)
  const excerpt = getPostExcerpt(post)

  return (
    <Card className="group overflow-hidden border-0 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <Link href={`/news/${post.slug}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={post.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-xs sm:text-sm text-gray-400">No image</span>
            </div>
          )}
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
            {post.author && typeof post.author === 'object' && post.author.email && (
              <Badge
                variant="secondary"
                className="bg-black/20 text-white backdrop-blur-sm text-[10px] sm:text-xs"
              >
                {getAuthorName(post.author)}
              </Badge>
            )}
          </div>
        </div>
      </Link>
      <CardContent className="p-3 sm:p-4 md:p-5">
        <div className="flex items-center text-[10px] sm:text-xs text-gray-500 mb-2 sm:mb-3 gap-2 sm:gap-3 flex-wrap">
          <span className="flex items-center">
            <Clock className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5" />
            {formatTimeAgo(post.createdAt)}
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

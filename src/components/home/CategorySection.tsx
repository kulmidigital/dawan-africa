'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { BlogCategory, BlogPost, Media } from '@/payload-types'
import {
  Building2,
  CircleDollarSign,
  Globe,
  Palette,
  Smartphone,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface CategorySectionProps {
  categories: BlogCategory[]
}

export const CategorySection: React.FC<CategorySectionProps> = ({ categories }) => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Category information with icons and colors (fallbacks)
  const categoryStyles = [
    {
      icon: <Building2 className="h-8 w-8" />,
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: <CircleDollarSign className="h-8 w-8" />,
      gradient: 'from-[#2aaac6] to-[#218ba0]',
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      icon: <Globe className="h-8 w-8" />,
      gradient: 'from-orange-500 to-orange-600',
    },
    {
      icon: <Palette className="h-8 w-8" />,
      gradient: 'from-pink-500 to-pink-600',
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      gradient: 'from-[#2aaac6] to-[#218ba0]',
    },
  ]

  // Fetch posts only once for all categories
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)

      try {
        // Only fetch exactly what we need (posts equal to categories count)
        const response = await fetch(
          `/api/blogPosts?limit=${categories.length}&sort=-createdAt&depth=2`,
        )

        if (!response.ok) {
          throw new Error('Failed to fetch posts')
        }

        const data = await response.json()
        setPosts(data.docs || [])
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setLoading(false)
      }
    }

    if (categories.length > 0) {
      fetchPosts()
    }
  }, [categories.length])

  // Function to extract image from the post layout blocks
  const getPostImage = (post: BlogPost | null): string | null => {
    if (!post || !post.layout) return null

    // Look first for cover blocks with images
    for (const block of post.layout) {
      if (block.blockType === 'cover' && block.image) {
        // Handle both string ID and Media object
        const media = typeof block.image === 'string' ? null : (block.image as Media)
        return media?.url || null
      }
    }

    // Fall back to image blocks if no cover blocks have images
    for (const block of post.layout) {
      if (block.blockType === 'image' && block.image) {
        const media = typeof block.image === 'string' ? null : (block.image as Media)
        return media?.url || null
      }
    }

    return null
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: categories.length }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category, index) => {
        const style = categoryStyles[index % categoryStyles.length]
        const post = posts[index] || null
        const imageUrl = getPostImage(post)

        return (
          <Link
            key={category.id}
            href={`/category/${category.id}`}
            className="group relative bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1"
          >
            {/* Image section */}
            <div className="relative h-48 overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={category.name}
                  className="h-full w-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div
                  className={`h-full w-full bg-gradient-to-r ${style.gradient} flex items-center justify-center p-6`}
                >
                  <div className="text-white">{style.icon}</div>
                </div>
              )}

              {/* Overlay with category name */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex flex-col justify-end p-4">
                <div className={`text-white font-serif font-bold text-2xl`}>{category.name}</div>
              </div>
            </div>

            {/* Bottom section */}
            <div className="p-4 border-t border-gray-100">
              {post ? (
                <div className="flex flex-col">
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-[#2aaac6] transition-colors mb-2">
                    {post.name}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  Explore the latest {category.name.toLowerCase()} articles
                </p>
              )}

              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm font-medium text-[#2aaac6]">Browse articles</span>
                <div className="h-8 w-8 rounded-full flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-[#2aaac6]" />
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

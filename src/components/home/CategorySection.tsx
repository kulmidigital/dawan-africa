import React from 'react'
import Link from 'next/link'
import { BlogCategory, BlogPost } from '@/payload-types'
import {
  Building2,
  CircleDollarSign,
  Globe,
  Palette,
  Smartphone,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import Image from 'next/image'

// Import utility functions
import { getPostImageFromLayout } from '@/utils/postUtils'

interface CategorySectionProps {
  categoriesWithPosts: (BlogCategory & { latestPost?: BlogPost })[]
}

export const CategorySection: React.FC<CategorySectionProps> = ({ categoriesWithPosts }) => {
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

  if (categoriesWithPosts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No categories with posts found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categoriesWithPosts.map((category, index) => {
        const style = categoryStyles[index % categoryStyles.length]
        const post = category.latestPost
        const imageUrl = post ? getPostImageFromLayout(post.layout) : null

        return (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group relative bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1"
          >
            {/* Image section */}
            <div className="relative h-48 overflow-hidden">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={category.name}
                  fill
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
                <div className={`text-white font-sans font-bold text-2xl`}>{category.name}</div>
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
                    {/* Consider using formatTimeAgo for consistency if desired */}
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

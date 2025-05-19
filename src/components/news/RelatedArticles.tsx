'use client'

import React from 'react'
import Link from 'next/link'
import { BlogPost } from '@/payload-types' // Assuming BlogPost type is available

interface RelatedArticlesProps {
  posts: BlogPost[]
  currentPostId?: string
}

export const RelatedArticles: React.FC<RelatedArticlesProps> = ({ posts, currentPostId }) => {
  const filteredPosts = currentPostId ? posts.filter((post) => post.id !== currentPostId) : posts

  if (!filteredPosts || filteredPosts.length === 0) {
    return null // Don't render anything if there are no related posts
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Related Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post) => (
          <Link key={post.id} href={`/news/${post.slug}`} passHref>
            <a className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
              <h3 className="text-xl font-semibold text-[#2aaac6] hover:text-[#238ca3] mb-2">
                {post.name}
              </h3>
              {/* Optionally, you could add a brief excerpt or image here */}
              {/* <p className="text-gray-600 text-sm">{getPostExcerpt(post, { maxLength: 100 })}</p> */}
            </a>
          </Link>
        ))}
      </div>
    </div>
  )
}

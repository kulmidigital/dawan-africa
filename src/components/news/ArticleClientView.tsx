'use client'

import React, { useEffect, useState } from 'react'
import { BlogPost } from '@/payload-types'
import { ArticleServerView } from './ArticleServerView'

interface ArticleClientViewProps {
  post: BlogPost
  relatedPosts: BlogPost[]
}

export const ArticleClientView: React.FC<ArticleClientViewProps> = ({ post, relatedPosts }) => {
  const [currentUrl, setCurrentUrl] = useState('')

  useEffect(() => {
    let isMounted = true

    const incrementViewCount = async () => {
      if (!post?.id) return

      try {
        const response = await fetch(`/api/blogPosts/increment-view/${post.id}`, {
          method: 'POST',
        })

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: 'Failed to parse error response' }))
          console.warn('Failed to increment view count:', {
            status: response.status,
            error: errorData.error || 'Unknown error',
          })
          return
        }

        const data = await response.json()
        if (data.success) {
          // View count was incremented successfully
          // We don't need to do anything here since this is just analytics
        }
      } catch (err) {
        // Network error or other unexpected error
        console.error('Error calling increment view endpoint:', err)
      }
    }

    // Set current URL for sharing - this will update after initial render
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href)
    }

    // Call the view increment function
    incrementViewCount()

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false
    }
  }, [post?.id]) // Only depend on post.id, not the entire post object

  // Render immediately with currentUrl (will be empty initially, then update)
  return <ArticleServerView post={post} relatedPosts={relatedPosts} currentUrl={currentUrl} />
}

import React from 'react'
import { BlogPost } from '@/payload-types'

// Import shadcn components
import { Card, CardContent } from '@/components/ui/card'

import { FeaturedPostsClient } from './FeaturedPostsClient'

interface FeaturedPostsProps {
  trendingPosts: BlogPost[]
  editorsPicks: BlogPost[]
  recentNewsItems: BlogPost[]
}

export const FeaturedPosts: React.FC<FeaturedPostsProps> = ({
  trendingPosts,
  editorsPicks,
  recentNewsItems,
}) => {
  // Check if we have any data to display
  if (trendingPosts.length === 0 && editorsPicks.length === 0 && recentNewsItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-10">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No posts available at the moment.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <section className="py-8 sm:py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <FeaturedPostsClient
          trendingPosts={trendingPosts}
          editorsPicks={editorsPicks}
          recentNewsItems={recentNewsItems}
        />
      </div>
    </section>
  )
}

import React from 'react'
import { BlogPost } from '@/payload-types'

// Import shadcn components
import { Card, CardContent } from '@/components/ui/card'

import { HeroSectionClient } from './HeroSectionClient'
import { FeaturedPostCard } from './FeaturedPostCard'
import { RecentNewsList } from './RecentNewsList'

// Import utility functions
import { getPostImageFromLayout, getPostExcerpt } from '@/utils/postUtils'

interface HeroSectionProps {
  latestPost: BlogPost | null
  recentPosts: BlogPost[]
}

export const HeroSection: React.FC<HeroSectionProps> = ({ latestPost, recentPosts }) => {
  // If no latestPost is available and we have no recent posts
  if (!latestPost && recentPosts.length === 0) {
    return (
      <section className="py-4">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-500 font-sans">No recent news available.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  // If latestPost is null, show minimal UI
  if (!latestPost) {
    return (
      <section className="py-4">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-500 font-sans">No featured news available at the moment.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  const featuredImage = getPostImageFromLayout(latestPost.layout)
  const excerpt = getPostExcerpt(latestPost)

  // Make sure we have different posts for the sidebar (not including the featured post)
  const sidebarPosts = recentPosts
    .filter((post) => post.id !== latestPost.id) // Filter out the featured post
    .slice(0, 5) // Take exactly 5 posts

  const POSTS_TO_SHOW = 5

  return (
    <section className="bg-gradient-to-b from-slate-100 to-white py-4 sm:py-6 font-sans">
      <div className="container mx-auto px-4">
        {/* Main grid layout with equal heights */}
        <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-3">
          {/* Main featured article - left side (2/3 width on desktop) */}
          <div className="md:col-span-2">
            <Card className="group h-full overflow-hidden border-0 shadow-md sm:shadow-xl transition-all hover:shadow-2xl">
              {/* Flash News with client-side rotation */}
              <HeroSectionClient recentPosts={recentPosts}>
                {/* Featured image with text overlay */}
                <FeaturedPostCard
                  latestPost={latestPost}
                  featuredImage={featuredImage}
                  excerpt={excerpt}
                />
              </HeroSectionClient>
            </Card>
          </div>

          {/* Recent news articles - right side (1/3 width on desktop) */}
          <div className="md:col-span-1">
            <RecentNewsList posts={sidebarPosts} postsToShow={POSTS_TO_SHOW} />
          </div>
        </div>
      </div>
    </section>
  )
}

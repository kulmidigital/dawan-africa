'use client'

import React, { useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { BlogPost } from '@/payload-types'

// Import shadcn components
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Import sub-components
import { TopPosts } from './featured-posts/TopPosts'
import { MainFeaturedPostDisplay } from './featured-posts/MainFeaturedPostDisplay'
import { GridPosts } from './featured-posts/GridPosts'
import { ListPosts } from './featured-posts/ListPosts'

interface FeaturedPostsClientProps {
  trendingPosts: BlogPost[]
  editorsPicks: BlogPost[]
  recentNewsItems: BlogPost[]
}

export const FeaturedPostsClient: React.FC<FeaturedPostsClientProps> = ({
  trendingPosts,
  editorsPicks,
  recentNewsItems,
}) => {
  const [activeTab, setActiveTab] = useState('trending')

  // Get the posts for the active tab
  const tabbedPosts = activeTab === 'trending' ? trendingPosts : editorsPicks

  const topPostsData = tabbedPosts.slice(0, 3)
  const mainFeaturedPostData = tabbedPosts.length > 3 ? tabbedPosts[3] : null
  const gridPostsData = tabbedPosts.slice(4, 6)

  return (
    <>
      <div className="mb-6 sm:mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#2aaac6]" strokeWidth={2.5} />
            <h2 className="font-sans text-xl sm:text-2xl font-bold text-gray-900">More Stories</h2>
          </div>
          <Tabs
            defaultValue="trending"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full sm:w-auto"
          >
            <TabsList className="bg-gray-100/80 w-full rounded-full h-9">
              <TabsTrigger
                value="trending"
                className="flex-1 sm:flex-none text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#2aaac6] rounded-full h-7"
              >
                Trending
              </TabsTrigger>
              <TabsTrigger
                value="editors"
                className="flex-1 sm:flex-none text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#2aaac6] rounded-full h-7"
              >
                Editor&apos;s Picks
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <TopPosts posts={topPostsData} />

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12 mb-8 sm:mb-12 max-w-full">
        <MainFeaturedPostDisplay post={mainFeaturedPostData} />
        <GridPosts posts={gridPostsData} />
      </div>

      <ListPosts posts={recentNewsItems} />
    </>
  )
}

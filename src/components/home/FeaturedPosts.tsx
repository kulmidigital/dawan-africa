'use client'

import React, { useState } from 'react'
import { TrendingUp } from 'lucide-react'

// Import shadcn components
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'

// Import custom hook
import { useFeaturedPostsData } from '@/hooks/useFeaturedPostsData'

// Import sub-components
import { TopPosts } from './featured-posts/TopPosts'
import { MainFeaturedPostDisplay } from './featured-posts/MainFeaturedPostDisplay'
import { GridPosts } from './featured-posts/GridPosts'
import { ListPosts } from './featured-posts/ListPosts'

interface FeaturedPostsProps {
  excludePostIds?: string[]
}

export const FeaturedPosts: React.FC<FeaturedPostsProps> = ({ excludePostIds = [] }) => {
  const [activeTab, setActiveTab] = useState('latest')
  const { posts, isLoadingPosts, postsError, isLoadingCategories, categoriesError } =
    useFeaturedPostsData({ excludePostIds })

  const topPostsData = posts.slice(0, 3)
  const mainFeaturedPostData = posts[3] || null
  const gridPostsData = posts.slice(4, 10)
  const listPostsData = posts.slice(10)

  if (isLoadingPosts || isLoadingCategories) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-10">
        <div className="space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <Skeleton className="h-7 w-44 rounded-md" />
            <Skeleton className="h-10 w-full sm:w-72 rounded-md" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 sm:h-64 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 sm:h-96 rounded-xl" />
        </div>
      </div>
    )
  }

  if (postsError || categoriesError) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-10">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-500">
              {postsError ? 'Error loading posts. ' : ''}
              {categoriesError ? 'Error loading categories. ' : ''}
              Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-10">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No additional posts available.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <section className="py-8 sm:py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="mb-6 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#2aaac6]" strokeWidth={2.5} />
              <h2 className="font-sans text-xl sm:text-2xl font-bold text-gray-900">
                More Stories
              </h2>
            </div>
            <Tabs
              defaultValue="latest"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full sm:w-auto"
            >
              <TabsList className="bg-gray-100/80 w-full rounded-full h-9">
                <TabsTrigger
                  value="latest"
                  className="flex-1 sm:flex-none text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-[#2aaac6] rounded-full h-7"
                >
                  Latest
                </TabsTrigger>
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

        <ListPosts posts={listPostsData} />
      </div>
    </section>
  )
}

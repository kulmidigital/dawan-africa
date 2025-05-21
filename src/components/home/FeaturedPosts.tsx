'use client'

import React, { useState } from 'react'
import { TrendingUp } from 'lucide-react'

// Import shadcn components
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'

// Import custom hook
import { useFeaturedPostsData } from '@/hooks/useFeaturedPostsData'
import { useRecentNewsData } from '@/hooks/useRecentNewsData'

// Import sub-components
import { TopPosts } from './featured-posts/TopPosts'
import { MainFeaturedPostDisplay } from './featured-posts/MainFeaturedPostDisplay'
import { GridPosts } from './featured-posts/GridPosts'
import { ListPosts } from './featured-posts/ListPosts'

interface FeaturedPostsProps {
  excludePostIds?: string[]
  heroPostIds?: string[]
}

export const FeaturedPosts: React.FC<FeaturedPostsProps> = ({
  excludePostIds = [],
  heroPostIds = [],
}) => {
  const [activeTab, setActiveTab] = useState('trending')

  const {
    posts: tabbedPosts,
    isLoadingPosts: isLoadingTabbedPosts,
    postsError: tabbedPostsError,
    isLoadingCategories,
    categoriesError,
  } = useFeaturedPostsData({ excludePostIds, activeTab })

  const {
    posts: recentNewsItems,
    isLoading: isLoadingRecentNews,
    error: recentNewsError,
  } = useRecentNewsData({ limit: 6, excludePostIds: heroPostIds })

  const topPostsData = tabbedPosts.slice(0, 3)
  const mainFeaturedPostData = tabbedPosts.length > 3 ? tabbedPosts[3] : null
  const gridPostsData = tabbedPosts.slice(4, 6)

  const isLoading = isLoadingTabbedPosts || isLoadingCategories || isLoadingRecentNews
  const hasError = tabbedPostsError || categoriesError || recentNewsError

  if (isLoading) {
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
          <div className="mt-8 sm:mt-12">
            <Skeleton className="h-6 w-40 mx-auto mb-6 sm:mb-8 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-x-5 sm:gap-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-20 rounded-md" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-10">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-500">
              {tabbedPostsError ? 'Error loading featured stories. ' : ''}
              {categoriesError ? 'Error loading categories. ' : ''}
              {recentNewsError ? 'Error loading recent news. ' : ''}
              Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (tabbedPosts.length === 0 && recentNewsItems.length === 0) {
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
        <div className="mb-6 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#2aaac6]" strokeWidth={2.5} />
              <h2 className="font-sans text-xl sm:text-2xl font-bold text-gray-900">
                More Stories
              </h2>
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
      </div>
    </section>
  )
}

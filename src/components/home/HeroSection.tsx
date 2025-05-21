'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { BlogPost } from '@/payload-types'
import { useQuery } from '@tanstack/react-query'

// Import shadcn components
import { Card, CardContent } from '@/components/ui/card'

import { FlashNews } from './FlashNews'
import { FeaturedPostCard } from './FeaturedPostCard'
import { RecentNewsList } from './RecentNewsList'

// Import utility functions
import { getPostImageFromLayout, getPostExcerpt } from '@/utils/postUtils'
import { formatTimeAgo } from '@/utils/dateUtils'

// Fetcher function (can be moved to a shared utils file if used elsewhere)
const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    const errorDetails = await response.json().catch(() => ({}))
    const error = new Error('An error occurred while fetching the data.')
    // @ts-ignore
    error.info = errorDetails
    // @ts-ignore
    error.status = response.status
    throw error
  }
  return response.json()
}

interface HeroSectionProps {
  latestPost: BlogPost | null
  recentPosts?: BlogPost[] // These are initial/server-fetched recent posts
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  latestPost,
  recentPosts: initialRecentPosts = [],
}) => {
  const queryParamsObject = useMemo(
    () => ({
      limit: '20',
      sort: '-createdAt',
      depth: '2',
    }),
    [],
  )

  const recentPostsQueryKey = ['blogPosts', 'heroRecent', queryParamsObject]

  // Fetch recent posts with useQuery only if initialRecentPosts are not provided (or empty)
  const shouldFetch = initialRecentPosts.length === 0

  const {
    data: fetchedRecentPostsData, // Renamed to avoid conflict with `recentPosts` variable
    error: recentPostsError,
    isLoading: isLoadingRecentPosts, // Renamed to be specific
  } = useQuery<
    {
      docs: BlogPost[]
    },
    Error
  >({
    queryKey: recentPostsQueryKey,
    queryFn: () => fetcher(`/api/blogPosts?${new URLSearchParams(queryParamsObject).toString()}`),
    enabled: shouldFetch, // Only run query if initialRecentPosts is empty
    // Default options from QueryProvider will apply (staleTime, refetchOnWindowFocus, etc.)
  })

  // Combine initial props with TanStack Query data
  const recentPosts: BlogPost[] = useMemo(() => {
    if (shouldFetch && fetchedRecentPostsData?.docs && Array.isArray(fetchedRecentPostsData.docs)) {
      return fetchedRecentPostsData.docs.filter(
        (post: BlogPost, index: number, self: BlogPost[]) =>
          index === self.findIndex((p: BlogPost) => p.id === post.id),
      )
    }
    return initialRecentPosts
  }, [initialRecentPosts, fetchedRecentPostsData, shouldFetch])

  const [currentFlashIndex, setCurrentFlashIndex] = useState(0)

  useEffect(() => {
    if (recentPosts.length <= 1) return
    const interval = setInterval(() => {
      setCurrentFlashIndex((prevIndex) =>
        prevIndex === recentPosts.length - 1 ? 0 : prevIndex + 1,
      )
    }, 5000)
    return () => clearInterval(interval)
  }, [recentPosts.length])

  // Adjusted loading and error states
  const isLoading = shouldFetch && isLoadingRecentPosts

  if (isLoading) {
    return (
      <section className="py-4">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-500 font-sans">Loading news...</p>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  if (recentPostsError && shouldFetch) {
    // Only show error if we were trying to fetch
    return (
      <section className="py-4">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-red-500 font-sans">Error loading recent news.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  // If no latestPost is available and we have no recent posts (either from props or query)
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

  // If latestPost is somehow null, but we might have recentPosts, decide on UI.
  // For now, if no latestPost, show a specific message or minimal UI.
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
  const currentFlashPost = recentPosts[currentFlashIndex]

  // Make sure we have different posts for the sidebar (not including the featured post)
  // Important: Get at least 6 different posts to ensure we have 5 for display
  const sidebarPosts = recentPosts
    .filter((post) => post.id !== latestPost.id) // Filter out the featured post
    .slice(0, 5) // Take exactly 5 posts

  // If we don't have 5 sidebar posts, add more from recentPosts if available
  const displayedPosts = [...sidebarPosts]

  // Force exactly 5 posts to be shown
  const POSTS_TO_SHOW = 5

  return (
    <section className="bg-gradient-to-b from-slate-100 to-white py-4 sm:py-6 font-sans">
      {/* Flash News */}
      <div className="container mx-auto px-4">
        {/* Main grid layout with equal heights */}
        <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-3">
          {/* Main featured article - left side (2/3 width on desktop) */}
          <div className="md:col-span-2">
            <Card className="group h-full overflow-hidden border-0 shadow-md sm:shadow-xl transition-all hover:shadow-2xl">
              {/* Flash News integrated inside the Card - hidden on small screens */}
              <div className="hidden md:block">
                {recentPosts.length > 0 && (
                  <FlashNews currentFlashPost={currentFlashPost} formatTimeAgo={formatTimeAgo} />
                )}
              </div>

              {/* Featured image with text overlay */}
              <FeaturedPostCard
                latestPost={latestPost}
                featuredImage={featuredImage}
                excerpt={excerpt}
                formatTimeAgo={formatTimeAgo}
              />
            </Card>
          </div>

          {/* Recent news articles - right side (1/3 width on desktop) */}
          <div className="md:col-span-1">
            <RecentNewsList
              posts={displayedPosts}
              formatTimeAgo={formatTimeAgo}
              postsToShow={POSTS_TO_SHOW}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </section>
  )
}

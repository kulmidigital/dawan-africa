'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { BlogPost, Media } from '@/payload-types'
import { ArrowRight, Newspaper, Zap, Clock } from 'lucide-react'

// Import shadcn components
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'


interface HeroSectionProps {
  latestPost: BlogPost | null
  recentPosts?: BlogPost[]
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  latestPost,
  recentPosts: initialRecentPosts = [],
}) => {
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>(initialRecentPosts)
  const [currentFlashIndex, setCurrentFlashIndex] = useState(0)
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false)

  // Fetch recent posts if not provided as props
  useEffect(() => {
    // Skip if already have posts from props
    if (initialRecentPosts.length > 0) return

    // Skip if we've already fetched posts
    if (recentPosts.length > 0) return

    // Skip if we've already attempted a fetch (even if it failed)
    if (hasAttemptedFetch) return

    const fetchRecentPosts = async () => {
      setHasAttemptedFetch(true)
      try {
        // Fetch more posts to ensure we have enough for the sidebar
        const response = await fetch('/api/blogPosts?limit=20&sort=-createdAt&depth=1')
        if (!response.ok) throw new Error('Failed to fetch recent posts')

        const data = await response.json()
        if (data.docs && Array.isArray(data.docs)) {
          // Make sure we have distinct posts by removing any duplicates
          const uniquePosts = data.docs.filter(
            (post: BlogPost, index: number, self: BlogPost[]) =>
              index === self.findIndex((p: BlogPost) => p.id === post.id),
          )
          setRecentPosts(uniquePosts)
        }
      } catch (error) {
        console.error('Error fetching recent posts:', error)
      }
    }

    fetchRecentPosts()
  }, [initialRecentPosts.length, hasAttemptedFetch])

  // Flash news headline rotation
  useEffect(() => {
    if (recentPosts.length <= 1) return

    const interval = setInterval(() => {
      setCurrentFlashIndex((prevIndex) =>
        prevIndex === recentPosts.length - 1 ? 0 : prevIndex + 1,
      )
    }, 5000) // Change headline every 5 seconds

    return () => clearInterval(interval)
  }, [recentPosts.length])

  if (!latestPost) {
    return (
      <section className="py-4">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-500">No recent news available.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  // Function to extract image from the post layout blocks
  const getPostImage = (post: BlogPost): string | null => {
    if (!post.layout) return null

    // Look first for cover blocks with images
    for (const block of post.layout) {
      if (block.blockType === 'cover' && block.image) {
        // Handle both string ID and Media object
        const media = typeof block.image === 'string' ? null : (block.image as Media)
        return media?.url ?? null
      }
    }

    // Fall back to image blocks if no cover blocks have images
    for (const block of post.layout) {
      if (block.blockType === 'image' && block.image) {
        const media = typeof block.image === 'string' ? null : (block.image as Media)
        return media?.url ?? null
      }
    }

    return null
  }

  // Function to extract text content from cover blocks
  const getCoverSubheading = (post: BlogPost): string | null => {
    if (!post.layout) return null

    // Look for cover blocks with subheadings
    for (const block of post.layout) {
      if (block.blockType === 'cover' && block.subheading) {
        return block.subheading
      }
    }

    return null
  }

  // Function to extract text content from richText blocks
  const getPostExcerpt = (post: BlogPost, maxLength = 180): string => {
    if (!post.layout) return ''

    // Try to get subheading from cover block first
    const coverSubheading = getCoverSubheading(post)
    if (coverSubheading) {
      return coverSubheading.length > maxLength
        ? `${coverSubheading.substring(0, maxLength)}...`
        : coverSubheading
    }

    // Fall back to richText blocks
    for (const block of post.layout) {
      if (block.blockType === 'richtext' && block.content?.root?.children?.[0]?.text) {
        const text = block.content.root.children[0].text as string
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
      }
    }

    return ''
  }

  // Format time ago (e.g., "2 hours ago")
  const formatTimeAgo = (dateString: string): string => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes} mins ago`
    } else if (diffInMinutes < 24 * 60) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`
    } else {
      return `${Math.floor(diffInMinutes / (60 * 24))} days ago`
    }
  }

  const featuredImage = getPostImage(latestPost)
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
    <section className="bg-gradient-to-b from-slate-100 to-white py-4 sm:py-6">
      {/* Flash News */}
      <div className="container mx-auto px-4">
        {/* Main grid layout with equal heights */}
        <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-3">
          {/* Main featured article - left side (2/3 width on desktop) */}
          <div className="md:col-span-2">
            <Card className="group h-full overflow-hidden border-0 shadow-md sm:shadow-xl transition-all hover:shadow-2xl">
              {/* Flash News integrated inside the Card */}
              {recentPosts.length > 0 && (
                <div
                  className="relative overflow-hidden"
                  style={{ backgroundColor: 'rgba(42, 170, 198, 0.03)' }}
                >
                  <div className="flex flex-wrap sm:flex-nowrap items-center">
                    <div
                      className="flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 text-white"
                      style={{ backgroundColor: '#2aaac6' }}
                    >
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse text-white" />
                        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">
                          FLASH NEWS
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 animate-fadeIn overflow-hidden px-3 py-1.5 sm:px-4 sm:py-2 transition-all duration-500">
                      {currentFlashPost && (
                        <Link
                          href={`/news/${currentFlashPost.slug}`}
                          className="text-gray-800 hover:text-[#2aaac6] hover:underline transition-colors"
                        >
                          <span className="line-clamp-1 text-xs sm:text-sm font-medium">
                            {currentFlashPost.name}
                          </span>
                        </Link>
                      )}
                    </div>

                    <div
                      className="w-full sm:w-auto sm:ml-auto flex-shrink-0 border-t sm:border-t-0 sm:border-l px-3 py-1.5 sm:px-4 sm:py-2 text-xs"
                      style={{
                        borderColor: 'rgba(42, 170, 198, 0.2)',
                        color: 'rgba(42, 170, 198, 0.8)',
                      }}
                    >
                      {currentFlashPost && formatTimeAgo(currentFlashPost.createdAt)}
                    </div>
                  </div>
                </div>
              )}

              {/* Featured image with text overlay */}
              {featuredImage ? (
                <div className="relative aspect-[4/3] sm:aspect-video w-full overflow-hidden">
                  <img
                    src={featuredImage}
                    alt={latestPost.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Text overlay with vignette effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent">
                    <div className="absolute bottom-0 left-0 p-3 sm:p-4 md:p-6">
                      <div className="mb-2 flex gap-2">
                        <Badge
                          className="text-xs font-medium"
                          style={{ backgroundColor: '#2aaac6' }}
                        >
                          FEATURED
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-black/30 text-xs font-normal text-gray-200 backdrop-blur-sm"
                        >
                          {formatTimeAgo(latestPost.createdAt)}
                        </Badge>
                      </div>

                      <h1 className="mb-2 sm:mb-3 font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-white">
                        {latestPost.name}
                      </h1>

                      {excerpt && (
                        <p className="mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 max-w-xl font-serif text-xs sm:text-sm md:text-base leading-relaxed text-gray-200">
                          {excerpt}
                        </p>
                      )}

                      <Link
                        href={`/news/${latestPost.slug}`}
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white transition-all hover:gap-2"
                        style={{ backgroundColor: '#2aaac6' }}
                      >
                        Read Full Story
                        <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <CardContent className="p-4 sm:p-6">
                  <h1 className="mb-3 font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-gray-900">
                    {latestPost.name}
                  </h1>

                  {excerpt && (
                    <p className="mb-4 font-serif text-sm sm:text-base leading-relaxed text-gray-700">
                      {excerpt}
                    </p>
                  )}

                  <Link
                    href={`/news/${latestPost.slug}`}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white transition-all hover:gap-2"
                    style={{ backgroundColor: '#2aaac6' }}
                  >
                    Read Full Story
                    <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                  </Link>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Recent news articles - right side (1/3 width on desktop) */}
          <div className="md:col-span-1">
            <Card className="h-full border-0 shadow-md">
              <div
                className="sticky top-0 flex items-center justify-between gap-2 border-b border-gray-100 bg-white p-2 sm:p-3 z-10"
                style={{ borderColor: '#2aaac6' }}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <Newspaper className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#2aaac6' }} />
                  <h2 className="font-serif text-base sm:text-xl font-bold text-gray-900">
                    Recent News
                  </h2>
                </div>
                <div className="text-[10px] sm:text-xs text-[#2aaac6] font-medium">
                  {POSTS_TO_SHOW} articles
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {/* Always render exactly 5 items */}
                {Array.from({ length: POSTS_TO_SHOW }).map((_, index) => {
                  // Use available posts, or repeat the first one if we don't have enough
                  const post = displayedPosts[index % Math.max(1, displayedPosts.length)]

                  if (!post) return null // Safety check

                  return (
                    <div
                      key={`${post.id}-${index}`}
                      className="group p-2 sm:p-3 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex gap-2 sm:gap-3">
                        {/* Article content */}
                        <div className="flex-1 min-w-0">
                          <div className="mb-1 text-[10px] sm:text-xs font-medium text-gray-500 flex items-center">
                            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 text-[#2aaac6]" />
                            {formatTimeAgo(post.createdAt)}
                          </div>

                          <h3 className="mb-1 sm:mb-2 font-serif text-xs sm:text-sm font-medium text-gray-900 transition-colors group-hover:text-[#2aaac6] line-clamp-2">
                            <Link href={`/news/${post.slug}`} className="hover:underline">
                              {post.name}
                            </Link>
                          </h3>
                        </div>

                        {/* Thumbnail image */}
                        <div className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded-md">
                          {getPostImage(post) ? (
                            <img
                              src={getPostImage(post) || ''}
                              alt={post.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <div
                              className="flex h-full w-full items-center justify-center"
                              style={{ backgroundColor: 'rgba(42, 170, 198, 0.1)' }}
                            >
                              <span className="text-[10px] sm:text-xs" style={{ color: '#2aaac6' }}>
                                No image
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
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

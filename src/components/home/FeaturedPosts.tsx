'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { BlogPost, Media, User } from '@/payload-types'
import { formatDistanceToNow, subDays } from 'date-fns'
import { ArrowRight, Calendar, Clock, Tag, TrendingUp } from 'lucide-react'

// Import shadcn components
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

interface FeaturedPostsProps {
  excludePostIds?: string[]
}

export const FeaturedPosts: React.FC<FeaturedPostsProps> = ({ excludePostIds = [] }) => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('latest')
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])

  // Fetch posts from the last 30 days, limit 50, excluding posts shown in HeroSection
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true)
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString()

        // Build query for posts in the last 30 days, excluding specific IDs
        const queryParams = new URLSearchParams({
          limit: '50',
          depth: '2',
          sort: '-createdAt',
          where: JSON.stringify({
            and: [
              {
                createdAt: {
                  greater_than: thirtyDaysAgo,
                },
              },
            ],
          }),
        })

        // Add exclusion of IDs if provided
        if (excludePostIds.length > 0) {
          const whereQuery = JSON.parse(queryParams.get('where') || '{}')
          whereQuery.and.push({
            id: {
              not_in: excludePostIds,
            },
          })
          queryParams.set('where', JSON.stringify(whereQuery))
        }

        const response = await fetch(`/api/blogPosts?${queryParams.toString()}`)

        if (!response.ok) throw new Error('Failed to fetch posts')

        const data = await response.json()
        if (data.docs && Array.isArray(data.docs)) {
          setPosts(data.docs)
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/blogCategories')
        if (!response.ok) throw new Error('Failed to fetch categories')

        const data = await response.json()
        if (data.docs && Array.isArray(data.docs)) {
          setCategories(data.docs)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchPosts()
    fetchCategories()
  }, [excludePostIds])

  // Function to extract image from the post layout blocks
  const getPostImage = (post: BlogPost): string | null => {
    if (!post.layout) return null

    // Look first for cover blocks with images
    for (const block of post.layout) {
      if (block.blockType === 'cover' && block.image) {
        // Handle both string ID and Media object
        const media = typeof block.image === 'string' ? null : (block.image as Media)
        return media?.url || null
      }
    }

    // Fall back to image blocks if no cover blocks have images
    for (const block of post.layout) {
      if (block.blockType === 'image' && block.image) {
        const media = typeof block.image === 'string' ? null : (block.image as Media)
        return media?.url || null
      }
    }

    return null
  }

  // Function to extract text content from richText blocks
  const getPostExcerpt = (post: BlogPost, maxLength = 140): string => {
    if (!post.layout) return ''

    // Look for richText blocks
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
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  }

  // Get the author name or username
  const getAuthorName = (author: string | User | null): string => {
    if (!author) return 'Unknown Author'

    if (typeof author === 'object') {
      return author.email?.split('@')[0] || 'Unknown Author'
    }

    return 'Unknown Author'
  }

  // Split posts into different sections
  const topPosts = posts.slice(0, 3) // First 3 posts for top row
  const mainFeaturedPost = posts[3] || null // 4th post for large feature
  const gridPosts = posts.slice(4, 10) // Next 6 posts for grid
  const listPosts = posts.slice(10) // Remaining posts for list view

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
        </div>
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
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
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

        {/* Top row - 3 equally sized posts */}
        {topPosts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-10">
            {topPosts.map((post) => (
              <Card
                key={post.id}
                className="group overflow-hidden border-0 shadow-md transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px]"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  {getPostImage(post) ? (
                    <img
                      src={getPostImage(post) || ''}
                      alt={post.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs sm:text-sm">No image</span>
                    </div>
                  )}

                  <div className="absolute top-0 left-0 w-full p-2 sm:p-3">
                    <Badge className="bg-[#2aaac6]/80 backdrop-blur-sm text-white text-xs">
                      New
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-3 sm:p-5">
                  <div className="flex items-center text-[10px] sm:text-xs text-gray-500 mb-2 sm:mb-3 gap-2 sm:gap-3 flex-wrap">
                    <span className="flex items-center">
                      <Clock className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      {formatTimeAgo(post.createdAt)}
                    </span>

                    {typeof post.author === 'object' && post.author && (
                      <span className="flex items-center">
                        <span className="inline-block w-1 h-1 rounded-full bg-gray-300 mr-2"></span>
                        {getAuthorName(post.author)}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-base sm:text-lg font-bold leading-tight line-clamp-2 mb-2 sm:mb-3 text-gray-800 group-hover:text-[#2aaac6] transition-colors">
                    <Link href={`/news/${post.slug}`} className="hover:underline">
                      {post.name}
                    </Link>
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3 sm:mb-4">
                    {getPostExcerpt(post, 100)}
                  </p>

                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto text-[#2aaac6] hover:bg-transparent hover:text-[#2aaac6]/80"
                  >
                    <Link href={`/news/${post.slug}`} className="flex items-center">
                      <span className="text-xs sm:text-sm">Read more</span>
                      <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Main grid with featured post on left and grid on right */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12 mb-8 sm:mb-12 max-w-full">
          {/* Main featured post - 5/12 width */}
          {mainFeaturedPost && (
            <div className="lg:col-span-5">
              <Card className="group h-full overflow-hidden border-0 shadow-md sm:shadow-xl transition-all duration-300 hover:shadow-2xl">
                <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full w-full overflow-hidden">
                  {getPostImage(mainFeaturedPost) ? (
                    <img
                      src={getPostImage(mainFeaturedPost) || ''}
                      alt={mainFeaturedPost.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-r from-blue-50 to-teal-50 flex items-center justify-center">
                      <span className="text-[#2aaac6]/70 text-base sm:text-xl font-serif font-bold">
                        Featured Story
                      </span>
                    </div>
                  )}

                  {/* Text overlay with vignette effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                      <Badge className="bg-[#2aaac6] hover:bg-[#2aaac6] text-white text-xs">
                        FEATURED
                      </Badge>
                    </div>

                    <div className="absolute bottom-0 left-0 p-3 sm:p-6">
                      <div className="mb-2 flex items-center text-[10px] sm:text-xs text-gray-300 gap-2 sm:gap-3 flex-wrap">
                        <span className="flex items-center">
                          <Calendar className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          {formatTimeAgo(mainFeaturedPost.createdAt)}
                        </span>

                        {typeof mainFeaturedPost.author === 'object' && mainFeaturedPost.author && (
                          <span className="flex items-center">
                            <span className="inline-block w-1 h-1 rounded-full bg-gray-400 mr-2"></span>
                            {getAuthorName(mainFeaturedPost.author)}
                          </span>
                        )}
                      </div>

                      <h2 className="mb-2 sm:mb-3 font-serif text-lg sm:text-xl md:text-2xl font-bold leading-tight text-white break-words">
                        <Link href={`/news/${mainFeaturedPost.slug}`} className="hover:underline">
                          {mainFeaturedPost.name}
                        </Link>
                      </h2>

                      <p className="mb-3 sm:mb-5 text-xs sm:text-sm leading-relaxed text-gray-200 line-clamp-2 sm:line-clamp-3">
                        {getPostExcerpt(mainFeaturedPost, 180)}
                      </p>

                      <Button
                        asChild
                        className="bg-[#2aaac6] hover:bg-[#2aaac6]/80 text-white gap-1 group-hover:gap-2 transition-all text-xs sm:text-sm h-8 sm:h-9"
                      >
                        <Link href={`/news/${mainFeaturedPost.slug}`}>
                          Read Full Story
                          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Grid posts - 7/12 width */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {gridPosts.map((post) => (
                <Card
                  key={post.id}
                  className="group overflow-hidden border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-200"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {getPostImage(post) ? (
                      <img
                        src={getPostImage(post) || ''}
                        alt={post.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-3 sm:p-4">
                    <div className="text-[10px] sm:text-xs text-gray-500 mb-1.5 sm:mb-2 flex gap-2 items-center flex-wrap">
                      {formatTimeAgo(post.createdAt)}
                      {typeof post.author === 'object' && post.author && (
                        <>
                          <span className="inline-block w-1 h-1 rounded-full bg-gray-300"></span>
                          <span>{getAuthorName(post.author)}</span>
                        </>
                      )}
                    </div>

                    <h3 className="font-serif text-sm sm:text-base font-bold line-clamp-2 mb-1.5 sm:mb-2 group-hover:text-[#2aaac6] transition-colors break-words">
                      <Link href={`/news/${post.slug}`} className="hover:underline">
                        {post.name}
                      </Link>
                    </h3>

                    <p className="text-xs text-gray-600 line-clamp-2 mb-2 sm:mb-3">
                      {getPostExcerpt(post, 80)}
                    </p>

                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto text-[#2aaac6] hover:bg-transparent hover:text-[#2aaac6]/80"
                    >
                      <Link href={`/news/${post.slug}`} className="flex items-center">
                        <span className="text-xs sm:text-sm">Read more</span>
                        <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* List view for remaining posts */}
        {listPosts.length > 0 && (
          <div className="mt-8 sm:mt-12 overflow-hidden">
            <div className="text-center mb-6 sm:mb-8 relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-gray-200" />
              </div>
              <span className="relative bg-gradient-to-b from-white to-gray-50 px-4 sm:px-6 inline-flex items-center">
                <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-[#2aaac6] mr-2" />
                <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-800">
                  Recent Articles
                </h3>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-x-5 sm:gap-y-4 w-full">
              {listPosts.map((post) => (
                <div
                  key={post.id}
                  className="group flex gap-2 sm:gap-3 items-start pb-3 sm:pb-4 border-b border-gray-100 hover:border-[#2aaac6]/20 transition-colors w-full overflow-hidden hover:bg-gray-50/50 px-2 rounded-sm"
                >
                  <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-md overflow-hidden bg-gray-100">
                    {getPostImage(post) ? (
                      <img
                        src={getPostImage(post) || ''}
                        alt={post.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 text-[10px] sm:text-xs">No image</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="text-[10px] sm:text-xs text-gray-500 mb-1 flex items-center">
                      <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 flex-shrink-0" />
                      {formatTimeAgo(post.createdAt)}
                    </div>

                    <h4 className="font-serif text-xs sm:text-sm font-bold leading-tight line-clamp-2 group-hover:text-[#2aaac6] transition-colors">
                      <Link href={`/news/${post.slug}`} className="hover:underline">
                        {post.name}
                      </Link>
                    </h4>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 sm:mt-10 text-center">
              <Link href="/news">
                <Button
                  variant="outline"
                  className="border-[#2aaac6] text-[#2aaac6] hover:bg-[#2aaac6]/5 transition-all text-xs sm:text-sm h-9"
                >
                  View All Articles
                  <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

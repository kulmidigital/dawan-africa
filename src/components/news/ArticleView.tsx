'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { BlogPost as PayloadBlogPost, User as PayloadUser, BlogCategory } from '@/payload-types'
import { BlockRenderer } from './BlockRenderer'
import { ArticleHeader } from './ArticleHeader'
import { Bookmark, ThumbsUp, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RelatedArticles } from './RelatedArticles'

// Use the original types from payload-types
type BlogPost = PayloadBlogPost
type User = PayloadUser

interface ArticleViewProps {
  post: BlogPost
  relatedPosts?: BlogPost[]
}

export const ArticleView: React.FC<ArticleViewProps> = ({
  post,
  relatedPosts: propRelatedPosts,
}) => {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>(propRelatedPosts || [])
  const [isLoadingRelated, setIsLoadingRelated] = useState(!propRelatedPosts)

  const fetchCurrentUser = useCallback(async () => {
    setIsLoadingUser(true)
    try {
      const resp = await fetch('/api/users/me', {
        headers: {
          Accept: 'application/json',
        },
      })
      if (resp.ok) {
        const data = await resp.json()
        setCurrentUser(data.user as User)
      } else {
        setCurrentUser(null)
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
      setCurrentUser(null)
    } finally {
      setIsLoadingUser(false)
    }
  }, [])

  const fetchRelatedPosts = useCallback(async () => {
    if (propRelatedPosts?.length) return // Don't fetch if already provided as props

    setIsLoadingRelated(true)
    try {
      // Create a query to fetch all posts except current one
      const queryParams = new URLSearchParams()

      // Exclude current post
      queryParams.append('where[id][not_equals]', post.id)

      // Increase limit to get more posts that we'll randomize from
      queryParams.append('limit', '20')

      const response = await fetch(`/api/blogPosts?${queryParams.toString()}`)

      if (response.ok) {
        const data = await response.json()
        if (data.docs && data.docs.length > 0) {
          // First try to filter posts that share categories with the current post
          let categoryMatches: BlogPost[] = []

          if (post.categories && Array.isArray(post.categories) && post.categories.length > 0) {
            const currentPostCategoryIds = post.categories.map((cat) =>
              typeof cat === 'string' ? cat : cat.id,
            )

            // Find posts that share at least one category
            categoryMatches = data.docs.filter((otherPost: BlogPost) => {
              if (!otherPost.categories || !Array.isArray(otherPost.categories)) return false

              const otherPostCategoryIds = otherPost.categories.map((cat) =>
                typeof cat === 'string' ? cat : cat.id,
              )

              // Check if any category matches
              return otherPostCategoryIds.some((catId) => currentPostCategoryIds.includes(catId))
            })
          }

          // If we have enough category matches, use those
          if (categoryMatches.length >= 6) {
            // Truly randomize the array (Fisher-Yates shuffle)
            for (let i = categoryMatches.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1))
              ;[categoryMatches[i], categoryMatches[j]] = [categoryMatches[j], categoryMatches[i]]
            }

            setRelatedPosts(categoryMatches.slice(0, 6))
          } else {
            // If not enough category matches, use a mix of category matches and random posts
            const otherPosts = data.docs.filter(
              (p: BlogPost) => !categoryMatches.some((match) => match.id === p.id),
            )

            // Shuffle both arrays
            for (let i = otherPosts.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1))
              ;[otherPosts[i], otherPosts[j]] = [otherPosts[j], otherPosts[i]]
            }

            // Combine category matches with random posts to get 6 total
            const combinedPosts = [
              ...categoryMatches,
              ...otherPosts.slice(0, 6 - categoryMatches.length),
            ]

            // Additional shuffle for good measure
            for (let i = combinedPosts.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1))
              ;[combinedPosts[i], combinedPosts[j]] = [combinedPosts[j], combinedPosts[i]]
            }

            setRelatedPosts(combinedPosts.slice(0, 6))
          }
        }
      }
    } catch (error) {
      console.error('Error fetching related posts:', error)
    } finally {
      setIsLoadingRelated(false)
    }
  }, [post.id, post.categories, propRelatedPosts])

  useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  useEffect(() => {
    fetchRelatedPosts()
  }, [fetchRelatedPosts])

  useEffect(() => {
    if (currentUser && post) {
      const favoritedPostIds =
        currentUser.favoritedPosts?.map((p) => (typeof p === 'string' ? p : p.id)) || []
      setIsFavorited(favoritedPostIds.includes(post.id))
    } else {
      setIsFavorited(false) // Not logged in or post not loaded, so not favorited
    }
  }, [currentUser, post])

  if (!post) return <div>Article not found.</div>

  const handleToggleFavorite = async () => {
    if (!currentUser) {
      router.push('/login?redirect_to=' + encodeURIComponent(window.location.pathname))
      return
    }
    if (isUpdatingFavorite) return

    setIsUpdatingFavorite(true)
    const currentlyFavorited = isFavorited
    setIsFavorited(!currentlyFavorited) // Optimistic update

    const originalFavoritedPosts =
      currentUser.favoritedPosts?.map((p) => (typeof p === 'string' ? p : p.id)) || []
    let updatedFavoritedPosts: string[]

    if (currentlyFavorited) {
      // Unfavorite: remove post.id
      updatedFavoritedPosts = originalFavoritedPosts.filter((id) => id !== post.id)
    } else {
      // Favorite: add post.id
      updatedFavoritedPosts = [...originalFavoritedPosts, post.id]
    }

    try {
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Ensure you have a way to authenticate this request, e.g., cookies, Authorization header
        },
        body: JSON.stringify({ favoritedPosts: updatedFavoritedPosts }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Failed to update favorites:', errorData)
        setIsFavorited(currentlyFavorited) // Revert optimistic update
        // Optionally, show an error message to the user
      } else {
        // Update current user state if needed, or refetch
        setCurrentUser((prevUser) =>
          prevUser ? { ...prevUser, favoritedPosts: updatedFavoritedPosts } : null,
        )
      }
    } catch (error) {
      console.error('Error updating favorites:', error)
      setIsFavorited(currentlyFavorited) // Revert optimistic update
      // Optionally, show an error message to the user
    } finally {
      setIsUpdatingFavorite(false)
    }
  }

  const firstBlockIsCover = !!(
    post.layout &&
    post.layout.length > 0 &&
    post.layout[0].blockType?.toLowerCase() === 'cover'
  )

  return (
    <div className="bg-white min-h-screen">
      {/* Header Section */}
      <ArticleHeader post={post} />

      <article className="relative">
        {/* Article Content Container */}
        <div className="container mx-auto px-4 sm:px-6 md:px-8 relative">
          <div className="max-w-3xl mx-auto bg-white rounded-t-2xl -mt-6 sm:-mt-10 pt-10 pb-16 px-5 sm:px-8 md:px-12 shadow-sm relative z-10 article-content">
            {/* Main Content - Render Blocks */}
            {post.layout && post.layout.length > 0 ? (
              post.layout.map((block, i) => {
                // Skip rendering the first block if it's a cover or image type,
                // as ArticleHeader will handle its display.
                if (i === 0) {
                  const blockType = block.blockType?.toLowerCase()
                  if (blockType === 'cover' || blockType === 'image') {
                    return null
                  }
                }

                const hideCoverBlockTextOverlay = i === 0 && firstBlockIsCover
                return (
                  <BlockRenderer
                    key={`${block.blockType}-${i}-${post.id}`}
                    block={block}
                    hideTextOverlay={hideCoverBlockTextOverlay}
                  />
                )
              })
            ) : (
              <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-800">
                <p>This article doesn&apos;t have any content blocks yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Article Engagement & Navigation */}
        <div className="bg-gray-50 py-8 sm:py-12 mt-8 border-t border-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              {/* Engagement Section */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm hover:shadow transition-all border border-gray-200">
                    <ThumbsUp className="h-4 w-4 text-[#2aaac6]" />
                    <span className="text-sm font-medium">Like</span>
                  </button>
                  {/* <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm hover:shadow transition-all border border-gray-200">
                    <MessageCircle className="h-4 w-4 text-[#2aaac6]" />
                    <span className="text-sm font-medium">Comment</span>
                  </button> */}
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm hover:shadow transition-all border border-gray-200 disabled:opacity-50"
                    onClick={handleToggleFavorite}
                    disabled={isUpdatingFavorite || isLoadingUser}
                  >
                    {isUpdatingFavorite ? (
                      <Loader2 className="h-4 w-4 text-[#2aaac6] animate-spin" />
                    ) : (
                      <Bookmark
                        className={`h-4 w-4 ${isFavorited ? 'text-red-500 fill-red-500' : 'text-[#2aaac6]'}`}
                      />
                    )}
                    <span className="text-sm font-medium">{isFavorited ? 'Saved' : 'Save'}</span>
                  </button>
                </div>
              </div>

              {/* Navigation options */}
              <div className="flex justify-between mb-8">
                <Link
                  href="/news"
                  className="px-6 py-3 bg-[#2aaac6] hover:bg-[#238ca3] transition-colors text-white font-medium rounded-lg"
                >
                  More Articles
                </Link>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-6 py-3 bg-white hover:bg-gray-50 transition-colors text-[#2aaac6] font-medium border border-gray-200 rounded-lg"
                >
                  Back to Top
                </button>
              </div>

              {/* Related Articles Section */}
              {isLoadingRelated ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 text-[#2aaac6] animate-spin" />
                </div>
              ) : relatedPosts && relatedPosts.length > 0 ? (
                <RelatedArticles posts={relatedPosts} currentPostId={post.id} />
              ) : null}
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}

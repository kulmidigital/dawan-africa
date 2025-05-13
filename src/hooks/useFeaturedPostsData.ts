import { useState, useEffect } from 'react'
import { BlogPost, BlogCategory } from '@/payload-types'
import { subDays } from 'date-fns'

interface UseFeaturedPostsDataProps {
  excludePostIds?: string[]
}

interface UseFeaturedPostsDataReturn {
  posts: BlogPost[]
  categories: BlogCategory[] // Assuming BlogCategory is the correct type from payload-types
  isLoading: boolean
}

export const useFeaturedPostsData = ({
  excludePostIds = [],
}: UseFeaturedPostsDataProps): UseFeaturedPostsDataReturn => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // setIsLoading(true) is managed by the initial state and finally block
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString()

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

        if (excludePostIds.length > 0) {
          const whereQuery = JSON.parse(queryParams.get('where') || '{}')
          if (whereQuery.and) {
            // Ensure 'and' exists
            whereQuery.and.push({
              id: {
                not_in: excludePostIds,
              },
            })
          } else {
            // Initialize 'and' if it doesn't
            whereQuery.and = [
              {
                id: {
                  not_in: excludePostIds,
                },
              },
            ]
          }
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
        setPosts([]) // Set to empty array on error
      }
      // setIsLoading(false) will be handled in the combined finally block
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
        setCategories([]) // Set to empty array on error
      }
    }

    const fetchData = async () => {
      setIsLoading(true)
      await Promise.all([fetchPosts(), fetchCategories()])
      setIsLoading(false)
    }

    fetchData()
  }, [excludePostIds])

  return { posts, categories, isLoading }
}

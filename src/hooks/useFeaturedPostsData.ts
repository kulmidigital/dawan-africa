import { useMemo } from 'react'
import { BlogPost, BlogCategory } from '@/payload-types'
import { subDays } from 'date-fns'
import { useQuery } from '@tanstack/react-query'

interface UseFeaturedPostsDataProps {
  excludePostIds?: string[]
}

// Define a fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    const errorDetails = await response.json().catch(() => ({}))
    const error = new Error('An error occurred while fetching the data.')
    // Attach more info to the error object
    // @ts-ignore
    error.info = errorDetails
    // @ts-ignore
    error.status = response.status
    throw error
  }
  return response.json()
}

interface UseFeaturedPostsDataReturn {
  posts: BlogPost[]
  categories: BlogCategory[]
  isLoadingPosts: boolean
  isLoadingCategories: boolean
  postsError: any
  categoriesError: any
}

export const useFeaturedPostsData = ({
  excludePostIds = [],
}: UseFeaturedPostsDataProps): UseFeaturedPostsDataReturn => {
  // Memoize excludePostIds to create a stable cache key part if it's an array of strings
  const stableExcludePostIds = useMemo(() => excludePostIds.join(','), [excludePostIds])

  const thirtyDaysAgo = useMemo(() => subDays(new Date(), 30).toISOString(), [])

  const queryParamsObject = useMemo(() => {
    const baseParams: Record<string, string> = {
      limit: '50',
      depth: '2',
      sort: '-createdAt',
    }
    const whereClause: any = {
      and: [
        {
          createdAt: {
            greater_than: thirtyDaysAgo,
          },
        },
      ],
    }
    if (stableExcludePostIds) {
      whereClause.and.push({
        id: {
          not_in: stableExcludePostIds.split(',').filter((id) => id),
        },
      })
    }
    baseParams.where = JSON.stringify(whereClause)
    return baseParams
  }, [thirtyDaysAgo, stableExcludePostIds])

  const postsQueryKey = ['blogPosts', 'featured', queryParamsObject]

  const {
    data: postsData,
    error: postsError,
    isLoading: isLoadingPosts,
  } = useQuery<
    {
      docs: BlogPost[]
    },
    Error
  >({
    queryKey: postsQueryKey,
    queryFn: () => fetcher(`/api/blogPosts?${new URLSearchParams(queryParamsObject).toString()}`),
  })

  // Fetch categories using useQuery
  const categoriesQueryKey = ['blogCategories', 'all']
  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: isLoadingCategories,
  } = useQuery<
    {
      docs: BlogCategory[]
    },
    Error
  >({
    queryKey: categoriesQueryKey,
    queryFn: () => fetcher('/api/blogCategories'),
  })

  return {
    posts: postsData?.docs || [],
    categories: categoriesData?.docs || [],
    isLoadingPosts,
    isLoadingCategories,
    postsError,
    categoriesError,
  }
}

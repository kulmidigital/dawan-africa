import { useMemo } from 'react'
import { BlogPost } from '@/payload-types'
import { useQuery } from '@tanstack/react-query'

// Re-using the fetcher from useFeaturedPostsData or a shared utility
const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    const errorDetails = await response.json().catch(() => ({}))
    const error = new Error('An error occurred while fetching the data.')
    // @ts-ignore-error
    error.info = errorDetails
    // @ts-ignore-error
    error.status = response.status
    throw error
  }
  return response.json()
}

interface UseRecentNewsDataProps {
  limit?: number
  excludePostIds?: string[]
}

interface UseRecentNewsDataReturn {
  posts: BlogPost[]
  isLoading: boolean
  error: any
}

export const useRecentNewsData = ({
  limit = 6,
  excludePostIds = [],
}: UseRecentNewsDataProps): UseRecentNewsDataReturn => {
  const stableExcludePostIds = useMemo(() => excludePostIds.join(','), [excludePostIds])

  const queryParamsObject = useMemo(() => {
    const params: Record<string, string> = {
      limit: String(limit),
      sort: '-createdAt',
      depth: '2', // Keep depth to populate author/category if needed by ListPosts
    }
    const whereClause: any = { and: [] }

    if (stableExcludePostIds) {
      whereClause.and.push({
        id: {
          not_in: stableExcludePostIds.split(',').filter((id) => id),
        },
      })
    }

    // Only add whereClause if it has conditions
    if (whereClause.and.length > 0) {
      params.where = JSON.stringify(whereClause)
    }

    return params
  }, [limit, stableExcludePostIds])

  const queryKey = ['blogPosts', 'recentNews', queryParamsObject]

  const { data, error, isLoading } = useQuery<
    {
      docs: BlogPost[]
    },
    Error
  >({
    queryKey,
    queryFn: () => fetcher(`/api/blogPosts?${new URLSearchParams(queryParamsObject).toString()}`),
  })

  return {
    posts: data?.docs || [],
    isLoading,
    error,
  }
}

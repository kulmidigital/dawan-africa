import React, { Suspense } from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Metadata } from 'next'
import { PodcastList } from '@/components/podcasts/PodcastList'
import { Skeleton } from '@/components/ui/skeleton'
import { sharedMetadata } from '@/app/shared-metadata'
import siteConfig from '@/app/shared-metadata'
import ErrorFallback from '@/components/ErrorFallback'

export const metadata: Metadata = {
  ...sharedMetadata,
  title: 'Podcasts | Dawan Africa - African Voices & Stories',
  description:
    'Listen to engaging podcasts featuring African voices, stories, and perspectives. In-depth discussions on politics, culture, business, and current affairs across the continent.',
  openGraph: {
    ...sharedMetadata.openGraph,
    title: 'Podcasts | Dawan Africa - African Voices & Stories',
    description:
      'Listen to engaging podcasts featuring African voices, stories, and perspectives. In-depth discussions on politics, culture, business, and current affairs across the continent.',
    url: new URL('/podcasts', siteConfig.url).toString(),
    type: 'website',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Dawan Africa - African Podcasts & Audio Stories',
      },
    ],
  },
  twitter: {
    ...sharedMetadata.twitter,
    title: 'Podcasts | Dawan Africa - African Voices & Stories',
    description:
      'Listen to engaging podcasts featuring African voices, stories, and perspectives. In-depth discussions on politics, culture, business, and current affairs across the continent.',
    images: ['/og-default.png'],
  },
  keywords: [
    'African podcasts',
    'East Africa podcasts',
    'Somalia podcasts',
    'Kenya podcasts',
    'Ethiopia podcasts',
    'African voices',
    'African stories',
    'African politics podcast',
    'African business podcast',
    'Horn of Africa',
    'Dawan Africa',
    'African perspectives',
  ],
  alternates: {
    canonical: new URL('/podcasts', siteConfig.url).toString(),
  },
}

// Enable revalidation every 60 seconds for fresh podcast content
export const revalidate = 60

interface PodcastsPageProps {
  searchParams?: Promise<{
    search?: string
    page?: string
    category?: string
    series?: string
    sort?: string
  }>
}

// Function to fetch podcasts with filters
async function getPodcasts(
  page: number = 1,
  limit: number = 20,
  searchTerm?: string,
  category?: string,
  series?: string,
  sortBy?: string,
) {
  try {
    const payload = await getPayload({ config })

    // Build where conditions
    const whereConditions: any[] = [
      {
        isPublished: { equals: true },
      },
    ]

    // Add search condition
    if (searchTerm) {
      whereConditions.push({
        or: [
          {
            title: {
              contains: searchTerm,
            },
          },
          {
            description: {
              contains: searchTerm,
            },
          },
        ],
      })
    }

    // Add category filter
    if (category && category !== 'all') {
      whereConditions.push({
        categories: {
          contains: category,
        },
      })
    }

    // Add series filter
    if (series && series !== 'all') {
      whereConditions.push({
        series: {
          equals: series,
        },
      })
    }

    // Determine sort order
    let sort = '-publishedAt'
    switch (sortBy) {
      case 'oldest':
        sort = 'publishedAt'
        break
      case 'duration':
        sort = '-duration'
        break
      case 'popularity':
        sort = '-playCount'
        break
      case 'newest':
      default:
        sort = '-publishedAt'
        break
    }

    const response = await payload.find({
      collection: 'podcasts',
      where: {
        and: whereConditions,
      },
      limit,
      page,
      sort,
      depth: 2,
    })

    return {
      docs: response.docs,
      totalDocs: response.totalDocs,
      totalPages: response.totalPages,
      page: response.page,
      hasNextPage: response.hasNextPage,
      hasPrevPage: response.hasPrevPage,
    }
  } catch (error) {
    console.error('Error fetching podcasts:', error)
    throw error
  }
}

// Define a skeleton component for the fallback
const PodcastsPageSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-6 md:pt-4 md:pb-12 ">
      {/* Skeleton for Header */}
      <div className="mb-6 sm:mb-8 md:mb-10">
        <Skeleton className="h-8 w-48 mb-2 rounded" /> {/* Title */}
        <Skeleton className="h-5 w-96 rounded" /> {/* Subtitle */}
      </div>

      {/* Skeleton for Filters */}
      <div className="bg-gray-50 rounded-lg p-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Skeleton className="h-10 rounded" />
          <Skeleton className="h-10 rounded" />
          <Skeleton className="h-10 rounded" />
          <Skeleton className="h-10 rounded" />
        </div>
        <Skeleton className="h-10 w-full rounded" />
      </div>

      {/* Skeleton for Podcasts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square rounded-lg" />
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function PodcastsPage({ searchParams }: Readonly<PodcastsPageProps>) {
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const page = parseInt(resolvedSearchParams.page ?? '1', 10)
  const searchTerm = resolvedSearchParams.search ?? ''
  const category = resolvedSearchParams.category ?? 'all'
  const series = resolvedSearchParams.series ?? 'all'
  const sortBy = resolvedSearchParams.sort ?? 'newest'

  try {
    const podcastsData = await getPodcasts(page, 20, searchTerm, category, series, sortBy)

    return (
      <main className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-2 md:py-4">
          <Suspense fallback={<PodcastsPageSkeleton />}>
            <PodcastList
              podcasts={podcastsData.docs}
              title="Podcasts"
              showFilters={true}
              showSearch={true}
              className="w-full"
            />
          </Suspense>

          {/* Pagination could be added here if needed */}
          {podcastsData.totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <p className="text-sm text-gray-600">
                Page {podcastsData.page} of {podcastsData.totalPages} • {podcastsData.totalDocs}{' '}
                total episodes
              </p>
            </div>
          )}
        </div>
      </main>
    )
  } catch (error) {
    console.error('Error loading podcasts:', error)

    return (
      <main className="bg-gray-50 min-h-screen">
        <ErrorFallback
          title="Podcasts Unavailable"
          message="We're having trouble loading the podcast content. Please try again later."
        />
      </main>
    )
  }
}

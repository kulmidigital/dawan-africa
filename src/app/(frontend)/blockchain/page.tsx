import React from 'react'
import { Metadata } from 'next'
import { CryptoMarketsServer } from '@/components/markets/CryptoMarketsServer'
import { getGlobalMarketData, getTrendingCoins, getMarketListings } from '@/lib/market-data'
import { sharedMetadata } from '@/app/shared-metadata'
import siteConfig from '@/app/shared-metadata'
import ErrorFallback from '@/components/ErrorFallback'

export const metadata: Metadata = {
  ...sharedMetadata,
  title: 'Blockchain | Dawan Africa - African Financial Markets & Analysis',
  description:
    'Track African financial markets, get real-time market data, expert analysis, and insights into African economies and business trends.',
  openGraph: {
    ...sharedMetadata.openGraph,
    title: 'Blockchain | Dawan Africa - African Financial Markets & Analysis',
    description:
      'Track African financial markets, get real-time market data, expert analysis, and insights into African economies and business trends.',
    url: new URL('/blockchain', siteConfig.url).toString(),
    type: 'website',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Dawan Africa - African Financial Markets & Analysis',
      },
    ],
  },
  twitter: {
    ...sharedMetadata.twitter,
    title: 'Blockchain | Dawan Africa - African Financial Markets & Analysis',
    description:
      'Track African financial markets, get real-time market data, expert analysis, and insights into African economies and business trends.',
    images: ['/og-default.png'],
  },
  alternates: {
    canonical: new URL('/blockchain', siteConfig.url).toString(),
  },
}

// Enable revalidation every 30 seconds for the entire page
export const revalidate = 30

interface MarketPageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    sort?: string
  }>
}

export default async function MarketsPage({ searchParams }: Readonly<MarketPageProps>) {
  // Await searchParams as it's now a Promise in Next.js 15
  const params = await searchParams
  const page = parseInt(params.page ?? '1', 10)
  const searchTerm = params.search ?? ''
  const sortBy = params.sort ?? 'market_cap_desc'

  try {
    // Fetch all data server-side in parallel
    const [globalData, trendingCoins, marketData] = await Promise.all([
      getGlobalMarketData(),
      getTrendingCoins(),
      getMarketListings(page, 20, searchTerm, sortBy),
    ])

    return (
      <main className="bg-gray-50 min-h-screen">
        <CryptoMarketsServer
          initialGlobalData={globalData}
          initialTrendingCoins={trendingCoins}
          initialMarketData={marketData}
          initialPage={page}
          initialSearchTerm={searchTerm}
          initialSortBy={sortBy}
        />
      </main>
    )
  } catch (error) {
    console.error('Error loading market data:', error)

    // Use separate Client Component for error UI to avoid hydration issues
    return (
      <main className="bg-gray-50 min-h-screen">
        <ErrorFallback
          title="Market Data Unavailable"
          message="We're having trouble loading the market data. Please try again later."
        />
      </main>
    )
  }
}

import React from 'react'
import { Metadata } from 'next'
import { CryptoMarketsServer } from '@/components/markets/CryptoMarketsServer'
import { getGlobalMarketData, getTrendingCoins, getMarketListings } from '@/lib/market-data'
import { sharedMetadata } from '@/app/shared-metadata'
import siteConfig from '@/app/shared-metadata'

export const metadata: Metadata = {
  ...sharedMetadata,
  title: 'Markets | Dawan Africa - African Financial Markets & Analysis',
  description:
    'Track African financial markets, get real-time market data, expert analysis, and insights into African economies and business trends.',
  openGraph: {
    ...sharedMetadata.openGraph,
    title: 'Markets | Dawan Africa - African Financial Markets & Analysis',
    description:
      'Track African financial markets, get real-time market data, expert analysis, and insights into African economies and business trends.',
    url: new URL('/markets', siteConfig.url).toString(),
    type: 'website',
  },
  twitter: {
    ...sharedMetadata.twitter,
    title: 'Markets | Dawan Africa - African Financial Markets & Analysis',
    description:
      'Track African financial markets, get real-time market data, expert analysis, and insights into African economies and business trends.',
  },
  alternates: {
    canonical: new URL('/markets', siteConfig.url).toString(),
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

    // Fallback UI in case of server-side errors
    return (
      <main className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Market Data Unavailable</h1>
            <p className="text-gray-600 mb-4">
              We&apos;re having trouble loading the market data. Please try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    )
  }
}

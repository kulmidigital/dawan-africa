import React from 'react'
import { MarketStatsServer } from './MarketStatsServer'
import { TrendingCoinsServer } from './TrendingCoinsServer'
import { MarketTableServer } from './MarketTableServer'
import { CryptoMarketsClient } from './CryptoMarketsClient'
import type { GlobalMarketData, TrendingCoin, MarketDataResult } from '@/lib/market-data'

interface CryptoMarketsServerProps {
  initialGlobalData: GlobalMarketData
  initialTrendingCoins: TrendingCoin[]
  initialMarketData: MarketDataResult
  initialPage: number
  initialSearchTerm: string
  initialSortBy: string
}

export const CryptoMarketsServer: React.FC<CryptoMarketsServerProps> = ({
  initialGlobalData,
  initialTrendingCoins,
  initialMarketData,
  initialPage,
  initialSearchTerm,
  initialSortBy,
}) => {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
      {/* Header */}
      <div className="mb-6 sm:mb-8 md:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Cryptocurrency Markets
        </h1>
        <p className="text-gray-600 text-lg">
          Track real-time prices and market data for the top cryptocurrencies
        </p>
      </div>

      {/* Market Stats - Server Component */}
      <MarketStatsServer globalData={initialGlobalData} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
        {/* Trending Coins - Takes up 1/4 of the space on large screens, appears first on mobile */}
        <div className="lg:col-span-1">
          <TrendingCoinsServer initialTrendingCoins={initialTrendingCoins} />
        </div>

        {/* Market Table - Takes up 3/4 of the space on large screens, appears second on mobile */}
        <div className="lg:col-span-3">
          <MarketTableServer
            initialData={initialMarketData}
            initialPage={initialPage}
            initialSearchTerm={initialSearchTerm}
            initialSortBy={initialSortBy}
          />
        </div>
      </div>

      {/* Client Component for Real-time Updates */}
      <CryptoMarketsClient />
    </div>
  )
}

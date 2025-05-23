import { unstable_cache } from 'next/cache'

export interface CryptoCurrency {
  id: number
  name: string
  symbol: string
  price: number
  marketCap: number
  volume24h: number
  circulatingSupply: number
  percentChange24h: number
  percentChange7d: number
  rank: number
  logoUrl: string
}

export interface GlobalMarketData {
  totalMarketCap: number
  totalVolume: number
  btcDominance: number
  ethDominance?: number
  marketCapChange: number
  activeCryptocurrencies?: number
}

export interface TrendingCoin {
  id: number
  name: string
  symbol: string
  price: number
  percentChange24h: number
  logoUrl: string
}

export interface MarketDataResult {
  data: CryptoCurrency[]
  totalCount: number
}

// Server-side data fetching functions with caching
export const getGlobalMarketData = unstable_cache(
  async (): Promise<GlobalMarketData> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/crypto/global`,
      {
        headers: {
          'Cache-Control': 'no-cache',
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch global market data: ${response.status}`)
    }

    return response.json()
  },
  ['global-market-data'],
  {
    revalidate: 60, // Cache for 1 minute
    tags: ['crypto-global'],
  },
)

export const getTrendingCoins = unstable_cache(
  async (): Promise<TrendingCoin[]> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/crypto/trending`,
      {
        headers: {
          'Cache-Control': 'no-cache',
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch trending coins: ${response.status}`)
    }

    return response.json()
  },
  ['trending-coins'],
  {
    revalidate: 120, // Cache for 2 minutes
    tags: ['crypto-trending'],
  },
)

export const getMarketListings = unstable_cache(
  async (
    page: number = 1,
    limit: number = 20,
    searchTerm: string = '',
    sortBy: string = 'market_cap_desc',
  ): Promise<MarketDataResult> => {
    const start = (page - 1) * limit + 1

    const params = new URLSearchParams({
      limit: String(limit),
      start: String(start),
      sort: sortBy,
    })

    if (searchTerm) {
      params.append('search', searchTerm)
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/api/crypto/listings?${params.toString()}`,
      {
        headers: {
          'Cache-Control': 'no-cache',
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch market listings: ${response.status}`)
    }

    const data = await response.json()
    return {
      data: data.data,
      totalCount: data.totalCount,
    }
  },
  ['market-listings'],
  {
    revalidate: 30, // Cache for 30 seconds
    tags: ['crypto-listings'],
  },
)

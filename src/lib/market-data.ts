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

const CMC_API_KEY = process.env.NEXT_PUBLIC_COIN_MARKET_CAP_API_KEY
const CMC_API_URL = 'https://pro-api.coinmarketcap.com/v1'

// Server-side data fetching functions with caching
export const getGlobalMarketData = unstable_cache(
  async (): Promise<GlobalMarketData> => {
    try {
      // Fetch global crypto market data directly from CoinMarketCap
      const globalDataResponse = await fetch(`${CMC_API_URL}/global-metrics/quotes/latest`, {
        headers: {
          'X-CMC_PRO_API_KEY': CMC_API_KEY as string,
          Accept: 'application/json',
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      })

      if (!globalDataResponse.ok) {
        throw new Error(`CoinMarketCap API error: ${globalDataResponse.status}`)
      }

      const globalData = await globalDataResponse.json()

      // Extract the data we need
      return {
        totalMarketCap: globalData.data.quote.USD.total_market_cap,
        totalVolume: globalData.data.quote.USD.total_volume_24h,
        btcDominance: globalData.data.btc_dominance,
        ethDominance: globalData.data.eth_dominance,
        marketCapChange: globalData.data.quote.USD.total_market_cap_yesterday_percentage_change,
        activeCryptocurrencies: globalData.data.total_cryptocurrencies,
      }
    } catch (error: any) {
      console.error('Error fetching global market data:', error)
      throw new Error('Failed to fetch global market data')
    }
  },
  ['global-market-data'],
  {
    revalidate: 60, // Cache for 1 minute
    tags: ['crypto-global'],
  },
)

export const getTrendingCoins = unstable_cache(
  async (): Promise<TrendingCoin[]> => {
    try {
      // Fetch trending coins directly from CoinMarketCap
      const response = await fetch(
        `${CMC_API_URL}/cryptocurrency/listings/latest?limit=10&sort=percent_change_24h&sort_dir=desc&convert=USD`,
        {
          headers: {
            'X-CMC_PRO_API_KEY': CMC_API_KEY as string,
            Accept: 'application/json',
          },
          next: { revalidate: 300 }, // Cache for 5 minutes
        },
      )

      if (!response.ok) {
        throw new Error(`CoinMarketCap API error: ${response.status}`)
      }

      const data = await response.json()

      // Transform the data to our schema
      return data.data.map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        price: coin.quote.USD.price,
        percentChange24h: coin.quote.USD.percent_change_24h,
        logoUrl: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`,
      }))
    } catch (error: any) {
      console.error('Error fetching trending cryptocurrencies:', error)
      throw new Error('Failed to fetch trending cryptocurrencies')
    }
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
    try {
      const start = (page - 1) * limit + 1
      const sortDir = sortBy.includes('asc') ? 'asc' : 'desc'
      // Parse the base sort parameter without direction
      const sortParam = sortBy.replace('_asc', '').replace('_desc', '')

      // Map front-end sort options to CoinMarketCap API parameters
      const sortMapping: { [key: string]: string } = {
        market_cap: 'market_cap',
        volume: 'volume_24h',
        price: 'price',
        percent_change_24h: 'percent_change_24h',
      }

      const apiSort = sortMapping[sortParam] || 'market_cap'

      // Construct URL with query parameters
      const url = new URL(`${CMC_API_URL}/cryptocurrency/listings/latest`)
      url.searchParams.append('limit', String(limit))
      url.searchParams.append('start', String(start))
      url.searchParams.append('sort', apiSort)
      url.searchParams.append('sort_dir', sortDir)
      url.searchParams.append('convert', 'USD')

      const response = await fetch(url.toString(), {
        headers: {
          'X-CMC_PRO_API_KEY': CMC_API_KEY as string,
          Accept: 'application/json',
        },
        next: { revalidate: 60 }, // Cache for 1 minute
      })

      if (!response.ok) {
        throw new Error(`CoinMarketCap API error: ${response.status}`)
      }

      const data = await response.json()

      // Transform the data to our schema
      const cryptocurrencies: CryptoCurrency[] = data.data.map((coin: any) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        price: coin.quote.USD.price,
        marketCap: coin.quote.USD.market_cap,
        volume24h: coin.quote.USD.volume_24h,
        circulatingSupply: coin.circulating_supply,
        percentChange24h: coin.quote.USD.percent_change_24h,
        percentChange7d: coin.quote.USD.percent_change_7d,
        rank: coin.cmc_rank,
        logoUrl: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`,
      }))

      // Client-side search if searchTerm is provided
      let results = cryptocurrencies
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        results = cryptocurrencies.filter(
          (crypto: CryptoCurrency) =>
            crypto.name.toLowerCase().includes(term) || crypto.symbol.toLowerCase().includes(term),
        )
      }

      return {
        data: results,
        totalCount: data.status.total_count,
      }
    } catch (error: any) {
      console.error('Error fetching cryptocurrency listings:', error)
      throw new Error('Failed to fetch cryptocurrency listings')
    }
  },
  ['market-listings'],
  {
    revalidate: 30, // Cache for 30 seconds
    tags: ['crypto-listings'],
  },
)

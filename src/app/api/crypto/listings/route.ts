import { NextRequest, NextResponse } from 'next/server'

const CMC_API_KEY = process.env.NEXT_PUBLIC_COIN_MARKET_CAP_API_KEY
const CMC_API_URL = 'https://pro-api.coinmarketcap.com/v1'

interface Cryptocurrency {
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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = Number(searchParams.get('limit') || '100')
    const start = Number(searchParams.get('start') || '1')
    const sort = searchParams.get('sort') || 'market_cap'
    const sortDir = sort.includes('asc') ? 'asc' : 'desc'
    // Parse the base sort parameter without direction
    const sortParam = sort.replace('_asc', '').replace('_desc', '')

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

    // Add search filter if provided
    const searchTerm = searchParams.get('search')?.trim()
    if (searchTerm) {
      // Note: The actual API doesn't support text search in this endpoint
      // We'll filter results client-side for search functionality
    }

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
    const cryptocurrencies: Cryptocurrency[] = data.data.map((coin: any) => ({
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
        (crypto: Cryptocurrency) =>
          crypto.name.toLowerCase().includes(term) || crypto.symbol.toLowerCase().includes(term),
      )
    }

    return NextResponse.json({
      data: results,
      totalCount: data.status.total_count,
    })
  } catch (error: any) {
    console.error('Error fetching cryptocurrency listings:', error)
    return NextResponse.json({ error: 'Failed to fetch cryptocurrency listings' }, { status: 500 })
  }
}

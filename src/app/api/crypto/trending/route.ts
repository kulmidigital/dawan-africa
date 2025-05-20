import { NextResponse } from 'next/server'

const CMC_API_KEY = process.env.NEXT_PUBLIC_COIN_MARKET_CAP_API_KEY
const CMC_API_URL = 'https://pro-api.coinmarketcap.com/v1'

interface TrendingCoin {
  id: number
  name: string
  symbol: string
  price: number
  percentChange24h: number
  logoUrl: string
}

export async function GET() {
  try {
    // There is a specific trending endpoint in the API (/cryptocurrency/trending/gainers-losers),
    // but it's not available in the Basic plan. As an alternative, we'll use the latest listings
    // and sort by 24h percentage change to simulate trending coins.

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
    const trendingCoins: TrendingCoin[] = data.data.map((coin: any) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      price: coin.quote.USD.price,
      percentChange24h: coin.quote.USD.percent_change_24h,
      logoUrl: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`,
    }))

    return NextResponse.json(trendingCoins)
  } catch (error: any) {
    console.error('Error fetching trending cryptocurrencies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending cryptocurrencies' },
      { status: 500 },
    )
  }
}

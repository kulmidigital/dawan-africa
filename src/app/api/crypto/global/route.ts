import { NextResponse } from 'next/server'

const CMC_API_KEY = process.env.NEXT_PUBLIC_COIN_MARKET_CAP_API_KEY
const CMC_API_URL = 'https://pro-api.coinmarketcap.com/v1'

export async function GET() {
  try {
    // Fetch global crypto market data
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
    const data = {
      totalMarketCap: globalData.data.quote.USD.total_market_cap,
      totalVolume: globalData.data.quote.USD.total_volume_24h,
      btcDominance: globalData.data.btc_dominance,
      ethDominance: globalData.data.eth_dominance,
      marketCapChange: globalData.data.quote.USD.total_market_cap_yesterday_percentage_change,
      activeCryptocurrencies: globalData.data.total_cryptocurrencies,
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching global market data:', error)
    return NextResponse.json({ error: 'Failed to fetch global market data' }, { status: 500 })
  }
}

'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpIcon, ArrowDownIcon, TrendingUp } from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/utils/formatters'

interface TrendingCoin {
  id: number
  name: string
  symbol: string
  price: number
  percentChange24h: number
  logoUrl: string
}

export const TrendingCoins: React.FC = () => {
  const [trendingCoins, setTrendingCoins] = useState<{
    data: TrendingCoin[]
    isLoading: boolean
    error: string | null
  }>({
    data: [],
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    const fetchTrendingCoins = async () => {
      try {
        // Make a real API call to our backend endpoint
        const response = await fetch('/api/crypto/trending')

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()

        setTrendingCoins({
          data: data,
          isLoading: false,
          error: null,
        })
      } catch (error) {
        console.error('Error fetching trending coins:', error)
        setTrendingCoins((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load trending coins',
        }))
      }
    }

    fetchTrendingCoins()
  }, [])

  if (trendingCoins.isLoading) {
    return (
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-sm flex items-center">
            <TrendingUp className="h-3.5 w-3.5 mr-1.5" /> Trending
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="animate-pulse">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 px-3 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-gray-200 mr-2"></div>
                  <div className="w-16 h-3.5 bg-gray-200 rounded"></div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="w-14 h-3.5 bg-gray-200 rounded mb-1"></div>
                  <div className="w-10 h-2.5 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (trendingCoins.error) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-sm flex items-center">
            <TrendingUp className="h-3.5 w-3.5 mr-1.5" /> Trending
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <p className="text-red-500 text-center text-xs">{trendingCoins.error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm overflow-hidden">
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-sm flex items-center">
          <TrendingUp className="h-3.5 w-3.5 mr-1.5" /> Trending
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
          {trendingCoins.data.map((coin) => (
            <div
              key={coin.id}
              className="flex justify-between items-center py-2 px-3 border-b border-gray-100 last:border-0 hover:bg-gray-50"
            >
              <div className="flex items-center">
                <img src={coin.logoUrl} alt={coin.name} className="w-5 h-5 mr-2" />
                <div>
                  <div className="font-medium text-xs">{coin.name}</div>
                  <div className="text-[10px] text-gray-500">{coin.symbol}</div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="font-medium text-xs">{formatCurrency(coin.price)}</div>
                <div
                  className={`text-[10px] flex items-center ${coin.percentChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {coin.percentChange24h >= 0 ? (
                    <ArrowUpIcon className="w-2.5 h-2.5 mr-0.5" />
                  ) : (
                    <ArrowDownIcon className="w-2.5 h-2.5 mr-0.5" />
                  )}
                  {formatPercentage(Math.abs(coin.percentChange24h))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

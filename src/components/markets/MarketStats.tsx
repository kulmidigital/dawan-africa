'use client'

import React, { useEffect, useState } from 'react'
import { ArrowUpIcon, ArrowDownIcon, TrendingUp, Activity, DollarSign, Bitcoin } from 'lucide-react'
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/formatters'
import { Skeleton } from '@/components/ui/skeleton'

interface MarketStatsProps {
  className?: string
}

interface GlobalData {
  totalMarketCap: number
  totalVolume: number
  btcDominance: number
  ethDominance?: number
  marketCapChange: number
  activeCryptocurrencies?: number
  isLoading: boolean
  error?: string
}

export const MarketStats: React.FC<MarketStatsProps> = ({ className }) => {
  const [globalData, setGlobalData] = useState<GlobalData>({
    totalMarketCap: 0,
    totalVolume: 0,
    btcDominance: 0,
    marketCapChange: 0,
    isLoading: true,
  })

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        // Make a real API call to our backend API route
        const response = await fetch('/api/crypto/global')

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const data = await response.json()

        setGlobalData({
          ...data,
          isLoading: false,
        })
      } catch (error) {
        console.error('Error fetching global market data:', error)
        setGlobalData((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load market data',
        }))
      }
    }

    fetchGlobalData()
  }, [])

  const stats = [
    {
      title: 'Market Cap',
      value: formatCurrency(globalData.totalMarketCap, 0),
      change: globalData.marketCapChange,
      icon: <Activity className="h-3.5 w-3.5 text-gray-500" />,
      isLoading: globalData.isLoading,
    },
    {
      title: '24h Vol',
      value: formatCurrency(globalData.totalVolume, 0),
      icon: <DollarSign className="h-3.5 w-3.5 text-gray-500" />,
      isLoading: globalData.isLoading,
    },
    {
      title: 'BTC Dom',
      value: formatPercentage(globalData.btcDominance),
      icon: <Bitcoin className="h-3.5 w-3.5 text-gray-500" />,
      isLoading: globalData.isLoading,
    },
    {
      title: 'Cryptos',
      value: formatNumber(globalData.activeCryptocurrencies ?? 0),
      icon: <TrendingUp className="h-3.5 w-3.5 text-gray-500" />,
      isLoading: globalData.isLoading,
    },
  ]

  if (globalData.error) {
    return (
      <div className={`text-red-500 text-xs ${className}`}>
        Failed to load market data. Please try again later.
      </div>
    )
  }

  return (
    <div className={`border rounded-md bg-white shadow-sm py-1.5 px-2 text-xs ${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-2 gap-y-1.5">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center">
            {stat.icon}
            <span className="ml-1 text-gray-500">{stat.title}:</span>
            {stat.isLoading ? (
              <Skeleton className="h-3 w-16 ml-1" />
            ) : (
              <span className="ml-1 font-medium">{stat.value}</span>
            )}
            {stat.change !== undefined && !stat.isLoading && (
              <span
                className={`flex items-center ml-1 ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {stat.change >= 0 ? (
                  <ArrowUpIcon className="w-2.5 h-2.5" />
                ) : (
                  <ArrowDownIcon className="w-2.5 h-2.5" />
                )}
                <span className="text-[10px]">{formatPercentage(Math.abs(stat.change))}</span>
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

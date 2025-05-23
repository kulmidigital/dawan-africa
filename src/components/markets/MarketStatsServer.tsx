import React from 'react'
import { ArrowUpIcon, ArrowDownIcon, TrendingUp, Activity, DollarSign, Bitcoin } from 'lucide-react'
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/formatters'
import type { GlobalMarketData } from '@/lib/market-data'

interface MarketStatsServerProps {
  globalData: GlobalMarketData
  className?: string
}

export const MarketStatsServer: React.FC<MarketStatsServerProps> = ({ globalData, className }) => {
  const stats = [
    {
      title: 'Market Cap',
      value: formatCurrency(globalData.totalMarketCap, 0),
      change: globalData.marketCapChange,
      icon: <Activity className="h-3.5 w-3.5 text-gray-500" />,
    },
    {
      title: '24h Vol',
      value: formatCurrency(globalData.totalVolume, 0),
      icon: <DollarSign className="h-3.5 w-3.5 text-gray-500" />,
    },
    {
      title: 'BTC Dom',
      value: formatPercentage(globalData.btcDominance),
      icon: <Bitcoin className="h-3.5 w-3.5 text-gray-500" />,
    },
    {
      title: 'Cryptos',
      value: formatNumber(globalData.activeCryptocurrencies || 0),
      icon: <TrendingUp className="h-3.5 w-3.5 text-gray-500" />,
    },
  ]

  return (
    <div className={`border rounded-md bg-white shadow-sm py-1.5 px-2 text-xs mb-6 ${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-2 gap-y-1.5">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center">
            {stat.icon}
            <span className="ml-1 text-gray-500">{stat.title}:</span>
            <span className="ml-1 font-medium">{stat.value}</span>
            {stat.change !== undefined && (
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

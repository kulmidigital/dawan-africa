import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpIcon, ArrowDownIcon, TrendingUp } from 'lucide-react'
import { formatCurrency, formatPercentage } from '@/utils/formatters'
import type { TrendingCoin } from '@/lib/market-data'

interface TrendingCoinsServerProps {
  initialTrendingCoins: TrendingCoin[]
}

export const TrendingCoinsServer: React.FC<TrendingCoinsServerProps> = ({
  initialTrendingCoins,
}) => {
  if (!initialTrendingCoins || initialTrendingCoins.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-sm flex items-center">
            <TrendingUp className="h-3.5 w-3.5 mr-1.5" /> Trending
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <p className="text-gray-500 text-center text-xs">No trending data available</p>
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
          {initialTrendingCoins.map((coin) => (
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

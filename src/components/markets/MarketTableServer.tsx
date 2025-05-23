import React from 'react'
import { MarketTableClient } from './MarketTableClient'
import type { MarketDataResult } from '@/lib/market-data'

interface MarketTableServerProps {
  initialData: MarketDataResult
  initialPage: number
  initialSearchTerm: string
  initialSortBy: string
}

export const MarketTableServer: React.FC<MarketTableServerProps> = ({
  initialData,
  initialPage,
  initialSearchTerm,
  initialSortBy,
}) => {
  return (
    <MarketTableClient
      initialData={initialData}
      initialPage={initialPage}
      initialSearchTerm={initialSearchTerm}
      initialSortBy={initialSortBy}
    />
  )
}

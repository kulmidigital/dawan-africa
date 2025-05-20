import React, { Suspense } from 'react'
import { Metadata } from 'next'
import { CryptoMarkets } from '@/components/markets/CryptoMarkets'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
  title: 'Cryptocurrency Markets | Dawan Africa',
  description:
    'Explore real-time cryptocurrency prices, market caps, and trading volumes on Dawan Africa.',
}

// Define a skeleton component for the fallback
const MarketsPageSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
      {/* Skeleton for Header */}
      <div className="mb-6 sm:mb-8 md:mb-10">
        <Skeleton className="h-8 w-48 mb-2 rounded" /> {/* Title */}
        <Skeleton className="h-5 w-72 rounded" /> {/* Subtitle */}
      </div>

      {/* Skeleton for Market Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>

      {/* Skeleton for Market Table */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
        <Skeleton className="h-10 w-full mb-4 rounded" /> {/* Table header */}
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full mb-2 rounded" />
        ))}
      </div>
    </div>
  )
}

export default function MarketsPage() {
  return (
    <main className="bg-gray-50 min-h-screen">
      <Suspense fallback={<MarketsPageSkeleton />}>
        <CryptoMarkets />
      </Suspense>
    </main>
  )
}

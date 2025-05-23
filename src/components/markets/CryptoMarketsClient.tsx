'use client'

import React, { useEffect, useState } from 'react'
import { RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { revalidateMarketData } from '@/lib/market-actions'
import { useRouter } from 'next/navigation'

export const CryptoMarketsClient: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  // Track when component has mounted to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !isOnline) return

    const interval = setInterval(async () => {
      await handleRefresh(false) // Silent refresh
    }, 60000) // Refresh every minute

    return () => clearInterval(interval)
  }, [autoRefresh, isOnline])

  // Manual refresh handler
  const handleRefresh = async (manual: boolean = true) => {
    if (manual) setIsRefreshing(true)

    try {
      // Revalidate server-side cache
      await revalidateMarketData()

      // Refresh the page to get updated data
      router.refresh()

      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error refreshing market data:', error)
    } finally {
      if (manual) setIsRefreshing(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border p-3 min-w-[200px]">
        {/* Status indicator */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-xs text-gray-600">{isOnline ? 'Live' : 'Offline'}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`text-xs h-6 px-2 ${autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
          >
            Auto
          </Button>
        </div>

        {/* Last update time - Two-pass rendering to avoid hydration mismatch */}
        <div className="text-xs text-gray-500 mb-2">
          Updated: {isMounted ? lastUpdate.toLocaleTimeString() : '--:--:--'}
        </div>

        {/* Refresh button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleRefresh()}
          disabled={isRefreshing || !isOnline}
          className="w-full h-8 text-xs"
        >
          {isRefreshing ? (
            <>
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { BiWifi, BiWifiOff } from 'react-icons/bi'

export const ConnectionStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true)
  const [showStatus, setShowStatus] = useState(false)

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setShowStatus(true)
      // Hide status after 3 seconds
      setTimeout(() => setShowStatus(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowStatus(true)
      // Keep showing offline status until back online
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showStatus) {
    return null
  }

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
        isOnline
          ? 'bg-green-100 border border-green-200 text-green-800'
          : 'bg-red-100 border border-red-200 text-red-800'
      }`}
    >
      <div className="flex items-center gap-2">
        {isOnline ? <BiWifi className="w-4 h-4" /> : <BiWifiOff className="w-4 h-4" />}
        <span className="text-sm font-medium">{isOnline ? 'Back online' : 'You are offline'}</span>
      </div>
    </div>
  )
}

export default ConnectionStatus

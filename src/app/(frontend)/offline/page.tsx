import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { BiWifi, BiRefresh, BiHome, BiNews } from 'react-icons/bi'

export const metadata: Metadata = {
  title: 'Offline - Dawan Africa',
  description: 'You are currently offline. Please check your internet connection.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Offline Icon */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <BiWifi className="w-10 h-10 text-gray-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">You're Offline</h1>

        {/* Description */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          It looks like you're not connected to the internet. Some content may not be available
          right now.
        </p>

        {/* Status */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <p className="text-orange-800 text-sm">
            <strong>No internet connection</strong>
            <br />
            Please check your network settings and try again.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Retry Button */}
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-[#2aaac6] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1a7a8a] transition-colors flex items-center justify-center gap-2"
          >
            <BiRefresh className="w-5 h-5" />
            Try Again
          </button>

          {/* Go to Homepage */}
          <Link
            href="/"
            className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <BiHome className="w-5 h-5" />
            Go to Homepage
          </Link>

          {/* Browse Cached Content */}
          <Link
            href="/news"
            className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <BiNews className="w-5 h-5" />
            Browse Cached News
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            When you're back online, you'll have access to the latest news and updates from Dawan
            Africa.
          </p>
        </div>

        {/* PWA Info */}
        <div className="mt-4">
          <p className="text-xs text-gray-400">This app works offline with cached content</p>
        </div>
      </div>
    </div>
  )
}

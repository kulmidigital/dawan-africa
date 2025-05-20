'use client'

import React, { useState } from 'react'
import { MarketStats } from './MarketStats'
import { MarketTable } from './MarketTable'
import { TrendingCoins } from './TrendingCoins'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ListFilter, Search } from 'lucide-react'

export const CryptoMarkets: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [sortBy, setSortBy] = useState('market_cap_desc')

  const handleSearch = () => {
    setSearchTerm(inputValue.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Header - Made more compact */}
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
          Cryptocurrency Markets
        </h1>
        <p className="text-gray-600 text-xs sm:text-sm">
          Real-time prices and data for the top cryptocurrencies by market cap
        </p>
      </div>

      {/* Market Stats - Reduced vertical margin */}
      <MarketStats className="mb-4" />

      {/* Search and Filters - Optimized for mobile */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div className="w-full sm:w-auto relative">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search cryptocurrency..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-8 h-9 bg-white shadow-sm text-sm w-full sm:w-64 pr-9"
            />
            <Button
              type="button"
              onClick={handleSearch}
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 rounded-full bg-[#2aaac6] hover:bg-[#238ca3]"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="h-9 w-full sm:w-44 bg-white shadow-sm text-xs">
            <ListFilter className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="market_cap_desc">Market Cap (High to Low)</SelectItem>
            <SelectItem value="market_cap_asc">Market Cap (Low to High)</SelectItem>
            <SelectItem value="volume_desc">Volume (High to Low)</SelectItem>
            <SelectItem value="volume_asc">Volume (Low to High)</SelectItem>
            <SelectItem value="price_desc">Price (High to Low)</SelectItem>
            <SelectItem value="price_asc">Price (Low to High)</SelectItem>
            <SelectItem value="percent_change_24h_desc">24h Change (High to Low)</SelectItem>
            <SelectItem value="percent_change_24h_asc">24h Change (Low to High)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main content - Reduced gap, better mobile layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <MarketTable searchTerm={searchTerm} sortBy={sortBy} />
        </div>
        <div className="order-first lg:order-last mb-4 lg:mb-0 lg:col-span-1">
          <TrendingCoins />
        </div>
      </div>
    </div>
  )
}

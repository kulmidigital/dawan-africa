'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { ArrowUpIcon, ArrowDownIcon, Star, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/formatters'
import type { MarketDataResult } from '@/lib/market-data'

interface MarketTableClientProps {
  initialData: MarketDataResult
  initialPage: number
  initialSearchTerm: string
  initialSortBy: string
}

export const MarketTableClient: React.FC<MarketTableClientProps> = ({
  initialData,
  initialPage,
  initialSearchTerm,
  initialSortBy,
}) => {
  const [data, setData] = useState<MarketDataResult>(initialData)
  const [page, setPage] = useState(initialPage)
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [sortBy, setSortBy] = useState(initialSortBy)
  const [favorites, setFavorites] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const router = useRouter()
  const itemsPerPage = 20

  // Update URL when filters change
  const updateURL = (newPage: number, newSearch: string, newSort: string) => {
    const params = new URLSearchParams()
    if (newPage > 1) params.set('page', newPage.toString())
    if (newSearch) params.set('search', newSearch)
    if (newSort !== 'market_cap_desc') params.set('sort', newSort)

    const queryString = params.toString()
    const newPath = queryString ? `/blockchain?${queryString}` : '/blockchain'

    startTransition(() => {
      router.push(newPath)
    })
  }

  // Fetch new data when filters change
  const fetchData = async (newPage: number, newSearch: string, newSort: string) => {
    setIsLoading(true)
    try {
      const start = (newPage - 1) * itemsPerPage + 1
      const params = new URLSearchParams({
        limit: String(itemsPerPage),
        start: String(start),
        sort: newSort,
      })

      if (newSearch) {
        params.append('search', newSearch)
      }

      const response = await fetch(`/api/crypto/listings?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`)
      }

      const result = await response.json()
      setData({
        data: result.data,
        totalCount: result.totalCount,
      })
    } catch (error) {
      console.error('Error fetching market data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle search
  const handleSearch = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm)
    setPage(1)
    updateURL(1, newSearchTerm, sortBy)
    fetchData(1, newSearchTerm, sortBy)
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    updateURL(newPage, searchTerm, sortBy)
    fetchData(newPage, searchTerm, sortBy)
  }

  const toggleFavorite = (id: number) => {
    setFavorites((prevFavorites) =>
      prevFavorites.includes(id)
        ? prevFavorites.filter((favId) => favId !== id)
        : [...prevFavorites, id],
    )
  }

  const totalPages = Math.ceil(data.totalCount / itemsPerPage)

  // Create array for pagination
  const pageNumbers = []
  for (let i = 1; i <= Math.min(5, totalPages); i++) {
    pageNumbers.push(i)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-16 bg-gray-100 rounded mb-2"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Search Bar */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search cryptocurrencies..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">24h %</TableHead>
              <TableHead className="text-right md:table-cell hidden">7d %</TableHead>
              <TableHead className="text-right lg:table-cell hidden">Market Cap</TableHead>
              <TableHead className="text-right xl:table-cell hidden">Volume (24h)</TableHead>
              <TableHead className="text-right xl:table-cell hidden">Circulating Supply</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((crypto) => (
              <TableRow key={crypto.id} className="hover:bg-gray-50">
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => toggleFavorite(crypto.id)}
                  >
                    <Star
                      className={`h-4 w-4 ${favorites.includes(crypto.id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  </Button>
                </TableCell>
                <TableCell>{crypto.rank}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <img src={crypto.logoUrl} alt={crypto.name} className="w-6 h-6 mr-2" />
                    <div>
                      <span className="font-medium">{crypto.name}</span>
                      <span className="text-gray-500 text-xs ml-2">{crypto.symbol}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(crypto.price)}</TableCell>
                <TableCell className="text-right">
                  <div
                    className={`inline-flex items-center ${crypto.percentChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {crypto.percentChange24h >= 0 ? (
                      <ArrowUpIcon className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3 mr-1" />
                    )}
                    {formatPercentage(Math.abs(crypto.percentChange24h))}
                  </div>
                </TableCell>
                <TableCell className="text-right md:table-cell hidden">
                  <div
                    className={`inline-flex items-center ${crypto.percentChange7d >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {crypto.percentChange7d >= 0 ? (
                      <ArrowUpIcon className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3 mr-1" />
                    )}
                    {formatPercentage(Math.abs(crypto.percentChange7d))}
                  </div>
                </TableCell>
                <TableCell className="text-right lg:table-cell hidden">
                  {formatCurrency(crypto.marketCap, 0)}
                </TableCell>
                <TableCell className="text-right xl:table-cell hidden">
                  {formatCurrency(crypto.volume24h, 0)}
                </TableCell>
                <TableCell className="text-right xl:table-cell hidden">
                  {formatNumber(crypto.circulatingSupply)}{' '}
                  <span className="text-gray-500">{crypto.symbol}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="py-4 px-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (page > 1) handlePageChange(page - 1)
                  }}
                  className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>

              {pageNumbers.map((number) => (
                <PaginationItem key={number} className="hidden sm:inline-block">
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      handlePageChange(number)
                    }}
                    isActive={page === number}
                  >
                    {number}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {totalPages > 5 && (
                <PaginationItem className="hidden sm:inline-block">
                  <span className="flex h-9 w-9 items-center justify-center">...</span>
                </PaginationItem>
              )}

              <PaginationItem className="sm:hidden">
                <span className="flex h-9 items-center justify-center px-2 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (page < totalPages) handlePageChange(page + 1)
                  }}
                  className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}

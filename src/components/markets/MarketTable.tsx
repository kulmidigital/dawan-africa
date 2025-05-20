'use client'

import React, { useState } from 'react'
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
import { ArrowUpIcon, ArrowDownIcon, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/formatters'
import { useMarketData } from '@/hooks/useMarketData'

interface MarketTableProps {
  searchTerm: string
  sortBy: string
}

export const MarketTable: React.FC<MarketTableProps> = ({ searchTerm, sortBy }) => {
  const [page, setPage] = useState(1)
  const [favorites, setFavorites] = useState<number[]>([])
  const itemsPerPage = 20

  // Use our custom hook that fetches data from our API endpoints
  const {
    data: cryptoData,
    totalCount,
    isLoading,
    error,
  } = useMarketData(page, itemsPerPage, searchTerm, sortBy)

  const toggleFavorite = (id: number) => {
    setFavorites((prevFavorites) =>
      prevFavorites.includes(id)
        ? prevFavorites.filter((favId) => favId !== id)
        : [...prevFavorites, id],
    )
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)

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

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 text-center">
        <p className="text-red-500">Error loading market data: {error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
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
            {cryptoData.map((crypto) => (
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
                    if (page > 1) setPage(page - 1)
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
                      setPage(number)
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
                    if (page < totalPages) setPage(page + 1)
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

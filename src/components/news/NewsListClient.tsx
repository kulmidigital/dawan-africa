'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SearchInput } from '@/components/common/SearchInput'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis,
} from '@/components/ui/pagination'
import { ListFilter } from 'lucide-react'

interface NewsListClientProps {
  initialSearchTerm: string
  initialSortBy: string
  currentPage: number
  totalPages: number
}

export const NewsListClient: React.FC<NewsListClientProps> = ({
  initialSearchTerm,
  initialSortBy,
  currentPage,
  totalPages,
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const current = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        current.delete(key)
      } else {
        current.set(key, value)
      }
    })

    const search = current.toString()
    const query = search ? `?${search}` : ''
    router.push(`/news${query}`)
  }

  const handleSortChange = (value: string) => {
    updateSearchParams({
      sort: value === '-createdAt' ? null : value,
      page: null, // Reset to page 1
    })
  }

  const goToPage = (page: number) => {
    updateSearchParams({
      page: page === 1 ? null : String(page),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Generate page numbers to show
  const getVisiblePageNumbers = () => {
    const delta = 2 // Pages to show on each side of current page
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  return (
    <>
      {/* Header and Filters */}
      <div className="mb-6 sm:mb-8 md:mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-sans font-bold text-gray-900 mb-1 sm:mb-2">
            Latest News
          </h1>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg">
            Stay updated with our most recent articles and insights.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full md:w-auto">
          <SearchInput
            inputClassName="h-9 sm:h-10 w-full bg-white shadow-sm text-sm"
            className="w-full sm:flex-grow"
            redirectPath="/news"
          />
          <Select value={initialSortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="h-9 sm:h-10 w-full sm:w-40 md:w-48 bg-white shadow-sm text-xs sm:text-sm">
              <ListFilter className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-gray-500" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-createdAt">Newest First</SelectItem>
              <SelectItem value="createdAt">Oldest First</SelectItem>
              <SelectItem value="name">Alphabetical (A-Z)</SelectItem>
              <SelectItem value="-name">Alphabetical (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  )
}

interface PaginationClientProps {
  currentPage: number
  totalPages: number
}

export const PaginationClient: React.FC<PaginationClientProps> = ({ currentPage, totalPages }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const current = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        current.delete(key)
      } else {
        current.set(key, value)
      }
    })

    const search = current.toString()
    const query = search ? `?${search}` : ''
    router.push(`/news${query}`)
  }

  const goToPage = (page: number) => {
    updateSearchParams({
      page: page === 1 ? null : String(page),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Generate page numbers to show
  const getVisiblePageNumbers = () => {
    const delta = 2 // Pages to show on each side of current page
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  if (totalPages <= 1) return null

  return (
    <Pagination className="mt-8 sm:mt-10 md:mt-12">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (currentPage > 1) goToPage(currentPage - 1)
            }}
            className={
              currentPage === 1
                ? 'pointer-events-none opacity-50'
                : 'hover:bg-[#2aaac6]/10 hover:text-[#2aaac6]'
            }
          />
        </PaginationItem>

        {getVisiblePageNumbers().map((page, index) => (
          <PaginationItem key={index}>
            {page === '...' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  goToPage(page as number)
                }}
                isActive={currentPage === page}
                className={
                  currentPage === page
                    ? 'bg-[#2aaac6] text-white'
                    : 'hover:bg-[#2aaac6]/10 hover:text-[#2aaac6]'
                }
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (currentPage < totalPages) goToPage(currentPage + 1)
            }}
            className={
              currentPage === totalPages
                ? 'pointer-events-none opacity-50'
                : 'hover:bg-[#2aaac6]/10 hover:text-[#2aaac6]'
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

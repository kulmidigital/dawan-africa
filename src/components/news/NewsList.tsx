'use client'

import React, { useEffect, useState } from 'react'
import { BlogPost } from '@/payload-types'
import { NewsCard } from './NewsCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, ListFilter, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const POSTS_PER_PAGE = 100

export const NewsList: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('-createdAt')
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true)
      try {
        const whereConditions: Array<Record<string, any>> = []

        if (searchTerm) {
          whereConditions.push({ name: { like: searchTerm } })
        }

        const queryParams = new URLSearchParams({
          limit: String(POSTS_PER_PAGE),
          page: String(currentPage),
          sort: sortBy,
          depth: '1',
        })

        if (whereConditions.length > 0) {
          queryParams.set('where', JSON.stringify({ and: whereConditions }))
        }

        const response = await fetch(`/api/blogPosts?${queryParams.toString()}`)
        if (!response.ok) throw new Error('Failed to fetch posts')

        const data = await response.json()
        if (data.docs && Array.isArray(data.docs)) {
          setPosts(data.docs)
          setTotalPages(data.totalPages || 1)
        }
      } catch (error) {
        // Error handling without console.log
        setPosts([])
        setTotalPages(1)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [currentPage, searchTerm, sortBy])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    setCurrentPage(1) // Reset to first page on new search
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setCurrentPage(1) // Reset to first page on new sort
  }

  const goToPreviousPage = () => {
    setIsLoading(true) // Set loading immediately
    setCurrentPage((prev) => Math.max(1, prev - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToNextPage = () => {
    setIsLoading(true) // Set loading immediately
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
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
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-9 sm:pl-10 h-9 sm:h-10 w-full sm:w-52 md:w-64 bg-white shadow-sm text-sm"
            />
          </div>
          <Select value={sortBy} onValueChange={handleSortChange}>
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

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {Array.from({ length: POSTS_PER_PAGE }).map((_, i) => (
            <Skeleton key={i} className="aspect-[16/9] rounded-lg sm:rounded-xl mb-4" />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {posts.map((post) => (
            <NewsCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 sm:py-8 md:py-10">
          <p className="text-lg sm:text-xl text-gray-500">No articles found.</p>
          {searchTerm && (
            <p className="text-sm text-gray-400 mt-2">
              Try adjusting your search or filter criteria.
            </p>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !isLoading && (
        <div className="mt-8 sm:mt-10 md:mt-12 flex justify-center items-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-[#2aaac6]/10 hover:text-[#2aaac6]"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <span className="text-xs sm:text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-[#2aaac6]/10 hover:text-[#2aaac6]"
          >
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      )}
    </div>
  )
}

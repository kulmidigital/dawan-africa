'use client'

import React from 'react'
import { Podcast, BlogCategory } from '@/payload-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Filter, X, SlidersHorizontal } from 'lucide-react'
import { getUniqueSeriesNames } from '@/utils/podcastUtils'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface PodcastFiltersSheetProps {
  podcasts: Podcast[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  selectedSeries: string
  setSelectedSeries: (series: string) => void
  sortBy: 'newest' | 'oldest' | 'duration' | 'popularity'
  setSortBy: (sort: 'newest' | 'oldest' | 'duration' | 'popularity') => void
  clearFilters: () => void
  hasActiveFilters: boolean
}

export const PodcastFiltersSheet: React.FC<PodcastFiltersSheetProps> = ({
  podcasts,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedSeries,
  setSelectedSeries,
  sortBy,
  setSortBy,
  clearFilters,
  hasActiveFilters,
}) => {
  // Get unique categories and series for filters
  const categories = Array.from(
    new Set(
      podcasts
        .flatMap((podcast) => podcast.categories || [])
        .filter((cat): cat is BlogCategory => typeof cat === 'object' && cat !== null)
        .map((cat) => ({ id: cat.id, name: cat.name })),
    ),
  )

  const seriesNames = getUniqueSeriesNames(podcasts)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-6 left-6 h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-[#2aaac6] via-[#2aaac6]/90 to-[#2aaac6]/80 hover:from-[#2aaac6]/90 hover:via-[#2aaac6]/80 hover:to-[#2aaac6]/70 text-white z-50 transition-all duration-500 hover:scale-110 hover:shadow-[#2aaac6]/30"
          size="icon"
        >
          <SlidersHorizontal className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[95vw] min-w-[95vw] sm:w-[400px] sm:min-w-[400px] p-0 bg-white"
      >
        <SheetHeader>
          <VisuallyHidden>
            <SheetTitle>Filter Podcasts</SheetTitle>
          </VisuallyHidden>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Simple Header */}
          <div className="bg-[#2aaac6] p-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-white" />
              <h2 className="text-lg font-semibold text-white">Filters</h2>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 bg-white overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Series Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Series</label>
                <Select value={selectedSeries} onValueChange={setSelectedSeries}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="All series" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All series</SelectItem>
                    {seriesNames.map((series) => (
                      <SelectItem key={series.id} value={series.id}>
                        {series.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Sort by</label>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                    <SelectItem value="duration">Longest first</SelectItem>
                    <SelectItem value="popularity">Most popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="space-y-2 pt-4 border-t border-slate-200">
                  <label className="text-sm font-medium text-slate-700">Active Filters</label>
                  <div className="flex flex-wrap gap-2">
                    {searchTerm && (
                      <Badge variant="secondary" className="text-xs">
                        Search: &quot;{searchTerm}&quot;
                        <button
                          onClick={() => setSearchTerm('')}
                          className="ml-1 hover:text-slate-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedCategory !== 'all' && (
                      <Badge variant="secondary" className="text-xs">
                        {categories.find((c) => c.id === selectedCategory)?.name}
                        <button
                          onClick={() => setSelectedCategory('all')}
                          className="ml-1 hover:text-slate-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedSeries !== 'all' && (
                      <Badge variant="secondary" className="text-xs">
                        {seriesNames.find((s) => s.id === selectedSeries)?.name}
                        <button
                          onClick={() => setSelectedSeries('all')}
                          className="ml-1 hover:text-slate-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    )}
                  </div>

                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

'use client'

import React, { useState, FormEvent, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface CategorySearchProps {
  placeholder?: string
  className?: string
  inputClassName?: string
  buttonClassName?: string
  categorySlug: string
  onSearchChange?: (searchTerm: string) => void
}

export const CategorySearch: React.FC<CategorySearchProps> = ({
  placeholder = 'Search articles in this category...',
  className = '',
  inputClassName = '',
  buttonClassName = '',
  categorySlug,
  onSearchChange,
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)

  // Local state for the input value
  const [inputValue, setInputValue] = useState('')

  // Initialize from URL params on mount
  useEffect(() => {
    const urlSearch = searchParams.get('search') || ''
    setInputValue(urlSearch)
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleClearSearch = () => {
    setInputValue('')
    if (inputRef.current) {
      inputRef.current.focus()
    }
    // Clear search immediately
    performSearch('')
  }

  const performSearch = (searchTerm?: string) => {
    const term = searchTerm !== undefined ? searchTerm : inputValue.trim()

    // Update URL parameters
    const params = new URLSearchParams(searchParams.toString())

    if (term) {
      params.set('search', term)
    } else {
      params.delete('search')
    }

    // Reset to first page when search changes
    params.delete('page')

    // Update URL
    const url = `/categories/${categorySlug}?${params.toString()}`
    router.push(url)

    // Call the callback if provided
    if (onSearchChange) {
      onSearchChange(term)
    }
  }

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    performSearch()
  }

  return (
    <form onSubmit={handleFormSubmit} className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
        <Input
          ref={inputRef}
          name="search"
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          className={`pl-9 sm:pl-10 pr-9 ${inputClassName}`}
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button
        type="submit"
        size="default"
        className={`bg-[#2aaac6] hover:bg-[#238ca3] ${buttonClassName}`}
      >
        <Search className="h-5 w-5" />
        <span className="sr-only">Search</span>
      </Button>
    </form>
  )
}

'use client'

import React, { useEffect, useState, FormEvent, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useSearchStore } from '@/store/searchStore'

interface SearchInputProps {
  placeholder?: string
  className?: string
  inputClassName?: string
  buttonClassName?: string
  redirectPath?: string
  autoFocus?: boolean
  isHeaderSearch?: boolean
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search article titles...',
  className = '',
  inputClassName = '',
  buttonClassName = '',
  redirectPath = '/news',
  autoFocus = false,
  isHeaderSearch = false,
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)

  // Reference to track if we're currently editing
  const isEditingRef = useRef(false)

  // Global search state from Zustand
  const { searchTerm, searchField, setSearchTerm } = useSearchStore()

  // Local state for just this input field - initialize from global state on mount only
  const [inputValue, setInputValue] = useState('')

  // Initialize input from global state or URL params only once on mount
  useEffect(() => {
    const urlSearch = searchParams.get('search') || ''
    setInputValue(urlSearch || searchTerm || '')
  }, []) // Empty dependency array, only runs once on mount

  // Only update FROM URL when we're not editing and URL changes
  const prevSearchParamRef = useRef(searchParams.get('search') || '')
  useEffect(() => {
    const currentUrlSearch = searchParams.get('search') || ''

    // If URL changed AND we're not actively editing, update the input
    if (currentUrlSearch !== prevSearchParamRef.current && !isEditingRef.current) {
      setInputValue(currentUrlSearch)
    }

    prevSearchParamRef.current = currentUrlSearch
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Flag that we're editing to prevent external updates
    isEditingRef.current = true
    setInputValue(e.target.value)
  }

  const handleClearSearch = () => {
    setInputValue('')

    // Use the ref to focus this specific input
    if (inputRef.current) {
      inputRef.current.focus()
    }

    // Set editing flag
    isEditingRef.current = true
  }

  const performSearch = () => {
    // No longer editing - allow external updates
    isEditingRef.current = false

    // Don't search if the term is the same as already in global state
    if (inputValue.trim() === searchTerm) {
      return
    }

    // Update global state
    setSearchTerm(inputValue.trim())

    // Update URL
    const params = new URLSearchParams(searchParams.toString())

    if (inputValue && inputValue.trim()) {
      params.set('search', inputValue.trim())
      params.set('searchField', searchField)
    } else {
      params.delete('search')
      params.delete('searchField')
    }

    // Use router.push with proper query parameters
    const url = `${redirectPath}?${params.toString()}`
    router.push(url)
  }

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    performSearch()
  }

  // Reset editing flag when input loses focus (unless it's a form submission)
  const handleInputBlur = () => {
    setTimeout(() => {
      // Short delay to avoid race conditions with form submission
      if (document.activeElement?.tagName !== 'BUTTON') {
        isEditingRef.current = false
      }
    }, 100)
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
          onBlur={handleInputBlur}
          onFocus={() => {
            isEditingRef.current = true
          }}
          className={`pl-9 sm:pl-10 pr-9 ${inputClassName}`}
          autoFocus={autoFocus}
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
        size={isHeaderSearch ? 'sm' : 'default'}
        className={`${buttonClassName} ${isHeaderSearch ? 'rounded-full bg-[#2aaac6] hover:bg-[#238ca3]' : 'bg-[#2aaac6] hover:bg-[#238ca3]'}`}
      >
        <Search className={`${isHeaderSearch ? 'h-4 w-4' : 'h-5 w-5'}`} />
        <span className="sr-only">Search</span>
      </Button>
    </form>
  )
}

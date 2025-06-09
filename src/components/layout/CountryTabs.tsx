'use client'

import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSearchStore } from '@/store/searchStore'
import { BiLoaderAlt } from 'react-icons/bi'

interface CountryTabsProps {
  countries: string[]
  onCountrySelect: (country: string) => void
  isMobile?: boolean
}

const CountryTabs: React.FC<CountryTabsProps> = ({
  countries,
  onCountrySelect,
  isMobile = false,
}) => {
  const { searchTerm, searchField } = useSearchStore()
  const [loadingCountry, setLoadingCountry] = useState<string | null>(null)

  if (countries.length === 0) {
    return null
  }

  const handleCountryClick = async (country: string) => {
    setLoadingCountry(country)
    onCountrySelect(country)

    // Clear loading state after a short delay to allow navigation
    setTimeout(() => {
      setLoadingCountry(null)
    }, 1000)
  }

  const isCountryActive = (country: string) => {
    return searchField === 'name' && searchTerm === country
  }

  const isCountryLoading = (country: string) => {
    return loadingCountry === country
  }

  if (isMobile) {
    return (
      <div className="border-t border-gray-100 bg-white lg:hidden">
        <div className="container mx-auto px-4 py-1">
          <ScrollArea className="w-full" type="scroll">
            <div className="flex justify-center space-x-3">
              {countries.map((country) => {
                const isActive = isCountryActive(country)
                const isLoading = isCountryLoading(country)
                return (
                  <Badge
                    key={country}
                    variant="outline"
                    onClick={() => handleCountryClick(country)}
                    className={`flex-shrink-0 px-2 py-1 text-sm whitespace-nowrap transition-colors ${
                      isLoading ? 'cursor-wait' : 'cursor-pointer'
                    } ${
                      isActive
                        ? 'bg-[#2aaac6] text-white border-[#2aaac6] hover:bg-[#2aaac6]/90'
                        : isLoading
                          ? 'bg-gray-100 text-gray-400 border-gray-200'
                          : 'text-gray-600 hover:text-[#2aaac6]'
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <BiLoaderAlt className="animate-spin -ml-1 mr-1 h-3 w-3" />
                        {country}
                      </span>
                    ) : (
                      country
                    )}
                  </Badge>
                )
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-gray-100 bg-white hidden lg:block">
      <div className="container mx-auto px-4 py-1">
        <ScrollArea className="w-full" type="scroll">
          <div className="flex justify-center space-x-3">
            {countries.map((country) => {
              const isActive = isCountryActive(country)
              const isLoading = isCountryLoading(country)
              return (
                <Badge
                  key={country}
                  variant="outline"
                  onClick={() => handleCountryClick(country)}
                  className={`flex-shrink-0 px-2 py-1 text-[15px] whitespace-nowrap transition-colors ${
                    isLoading ? 'cursor-wait' : 'cursor-pointer'
                  } ${
                    isActive
                      ? 'bg-[#2aaac6] text-white border-[#2aaac6] hover:bg-[#2aaac6]/90'
                      : isLoading
                        ? 'bg-gray-100 text-gray-400 border-gray-200'
                        : 'text-gray-600 hover:text-[#2aaac6]'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <BiLoaderAlt className="animate-spin -ml-1 mr-1 h-3 w-3" />
                      {country}
                    </span>
                  ) : (
                    country
                  )}
                </Badge>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export default CountryTabs

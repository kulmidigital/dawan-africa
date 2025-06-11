'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { BlogCategory } from '@/payload-types'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { SearchInput } from '@/components/common/SearchInput'
import { useSearchStore } from '@/store/searchStore'
import CategoryLinks from './CategoryLinks'

interface DesktopNavProps {
  categories: BlogCategory[]
  countries: string[]
}

const DesktopNav: React.FC<DesktopNavProps> = ({ categories, countries }) => {
  const router = useRouter()
  const { setSearchTerm, setSearchField } = useSearchStore()

  const handleCountrySearch = (country: string) => {
    setSearchTerm(country)
    setSearchField('name')
    const params = new URLSearchParams()
    params.set('search', country)
    params.set('searchField', 'name')
    router.push(`/news?${params.toString()}`)
  }

  return (
    <div className="py-2 border-b border-gray-100 hidden lg:block">
      <div className="container mx-auto px-2">
        <div className="grid grid-cols-12 gap-2 items-center">
          <div className="col-span-3 relative z-20 bg-white">
            <SearchInput
              isHeaderSearch={true}
              inputClassName="h-9 rounded-full text-sm border-gray-200 focus-visible:ring-[#2aaac6] bg-white"
              buttonClassName="h-9 px-3"
              redirectPath="/news"
              placeholder="Search articles..."
            />
          </div>
          <div className="col-span-9 relative z-10">
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent z-30 pointer-events-none" />
            <ScrollArea className="w-full bg-white" type="scroll">
              <CategoryLinks
                categories={categories}
                countries={countries}
                onCountrySelect={handleCountrySearch}
              />
              <ScrollBar orientation="horizontal" className="h-2" />
            </ScrollArea>
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent z-30 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DesktopNav

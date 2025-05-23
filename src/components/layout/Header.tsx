'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { useSearchParams } from 'next/navigation'

// Replace Lucide icons with React Icons
import { BiCalendar, BiSearch, BiMenu, BiX } from 'react-icons/bi'

import { BlogCategory, User as AuthUser } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useSearchStore } from '@/store/searchStore'
import SocialIcons from './SocialIcons'
import WeatherDisplay from './WeatherDisplay'
import UserAuth from './UserAuth'
import DesktopNav from './DesktopNav'
import MobileSearch from './MobileSearch'
import MobileMenu from './MobileMenu'

// Weather data type
interface WeatherData {
  temperature: number
  condition: string
  location: string
  icon?: string
}

// Header props interface
interface HeaderProps {
  initialCategories?: BlogCategory[]
  initialWeather?: WeatherData | null
}

// List of countries we want to feature
const countries = ['Somalia', 'Kenya', 'Djibouti', 'Ethiopia', 'Eritrea']

// Helper to get initials from name or email
const getInitials = (name?: string | null, email?: string | null): string => {
  if (name) {
    const parts = name.split(' ')
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }
  if (email) {
    return email.substring(0, 2).toUpperCase()
  }
  return 'U' // Default fallback
}

const Header: React.FC<HeaderProps> = ({ initialCategories = [], initialWeather = null }) => {
  const { user, isLoading: authLoading, logout: authLogout } = useAuth()
  const searchParams = useSearchParams()

  // Get searchTerm from store
  const { setSearchTerm, setSearchField } = useSearchStore()

  // Initialize search store from URL on mount
  useEffect(() => {
    const urlSearch = searchParams.get('search') ?? ''
    const urlSearchField = searchParams.get('searchField') ?? 'name'

    if (urlSearch) {
      setSearchTerm(urlSearch)
      setSearchField(urlSearchField)
    }
  }, [searchParams, setSearchTerm, setSearchField])

  // Use the server-provided data instead of fetching client-side
  const [categories] = useState<BlogCategory[]>(initialCategories)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Navigate to search by country
  const navigateToCountrySearch = (country: string) => {
    setSearchTerm(country)
    setSearchField('name')
    setIsMenuOpen(false) // Close mobile menu
  }

  const today = new Date()
  const formattedDate = format(today, 'EEEE, MMMM d, yyyy')

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Row 1: Combined logo and top bar - Logo, Social, Date, Weather, Account */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2">
            {/* Mobile menu button (left) */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-[#2aaac6] -ml-2"
                aria-label="Open main menu"
              >
                {isMenuOpen ? <BiX className="h-5 w-5" /> : <BiMenu className="h-5 w-5" />}
              </Button>
            </div>

            {/* Left - Logo (desktop) */}
            <div className="hidden lg:block">
              <Link href="/">
                <Image
                  src="/logo.png"
                  alt="Dawan Africa"
                  width={200}
                  height={45}
                  className="h-[45px] w-auto"
                />
              </Link>
            </div>

            {/* Center - Logo (mobile/tablet), Social/Date (desktop) */}
            <div className="flex items-center justify-center space-x-6">
              {/* Logo (mobile/tablet only) */}
              <div className="lg:hidden">
                <Link href="/">
                  <Image
                    src="/logo.png"
                    alt="Dawan Africa"
                    width={140}
                    height={32}
                    className="h-[32px] w-auto"
                  />
                </Link>
              </div>

              {/* Social Media (tablet and up) */}
              <SocialIcons />

              {/* Date (tablet and up) */}
              <div className="hidden md:flex items-center text-xs text-gray-500">
                <BiCalendar className="mr-1.5 h-3.5 w-3.5" />
                <span>{formattedDate}</span>
              </div>
            </div>

            {/* Right - Weather & Account & Search */}
            <div className="flex items-center space-x-4">
              {/* Weather (tablet and up) */}
              <WeatherDisplay initialWeather={initialWeather} />

              {/* Account/Login/Register Links */}
              <UserAuth />

              {/* Mobile search button */}
              <div className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="text-gray-600 hover:text-[#2aaac6] -mr-2"
                  aria-label="Search"
                >
                  <BiSearch className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Search and Categories (desktop) */}
      <DesktopNav categories={categories} countries={countries} />

      {/* Mobile search input */}
      <MobileSearch searchOpen={searchOpen} />

      <MobileMenu
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        categories={categories}
        countries={countries}
        navigateToCountrySearch={navigateToCountrySearch}
        user={user as AuthUser | null | undefined}
        authLoading={authLoading}
        authLogout={authLogout}
        getInitials={getInitials}
      />
    </header>
  )
}

export default Header

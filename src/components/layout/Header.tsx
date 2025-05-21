'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { useRouter, useSearchParams } from 'next/navigation'

// Replace Lucide icons with React Icons
import {
  BiLogoTwitter,
  BiLogoFacebook,
  BiLogoYoutube,
  BiLogoInstagram,
  BiCalendar,
  BiCloud,
  BiCloudDrizzle,
  BiCloudLightning,
  BiCloudRain,
  BiCloudSnow,
  BiWind,
  BiMapPin,
  BiSearch,
  BiMenu,
  BiX,
  BiUser,
  BiUserPlus,
  BiLogOut,
  BiCoin,
  BiGlobe,
  BiChevronDown,
  BiSun,
  BiLogoTiktok,
} from 'react-icons/bi'

import { BlogCategory } from '@/payload-types'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import FootballSheet from '@/components/football/FootballSheet'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { SearchInput } from '@/components/common/SearchInput'
import { useSearchStore } from '@/store/searchStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// List of countries we want to feature
const countries = ['Somalia', 'Kenya', 'Djibouti', 'Ethiopia', 'Eritrea']

interface WeatherData {
  temperature: number
  windSpeed: number
  weatherCode: number
  location: string
  loading: boolean
  error: boolean
}

interface Coordinates {
  latitude: number
  longitude: number
}

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

const Header: React.FC = () => {
  const { user, isLoading: authLoading, logout: authLogout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get searchTerm from store
  const { setSearchTerm, setSearchField } = useSearchStore()

  // Initialize search store from URL on mount
  useEffect(() => {
    const urlSearch = searchParams.get('search') || ''
    const urlSearchField = searchParams.get('searchField') ?? 'name'

    if (urlSearch) {
      setSearchTerm(urlSearch)
      setSearchField(urlSearchField)
    }
  }, [searchParams, setSearchTerm, setSearchField])

  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 0,
    windSpeed: 0,
    weatherCode: 0,
    location: '',
    loading: true,
    error: false,
  })

  // Navigate to search by country
  const navigateToCountrySearch = (country: string) => {
    setSearchTerm(country)
    const params = new URLSearchParams()
    params.set('search', country)
    params.set('searchField', 'name')
    router.push(`/news?${params.toString()}`)
    setIsMenuOpen(false) // Close mobile menu if open
  }

  // Get user's geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          // Fallback to Nairobi coordinates if geolocation fails
          setCoordinates({
            latitude: -1.2921,
            longitude: 36.8219,
          })
        },
      )
    } else {
      // Fallback to Nairobi coordinates if geolocation not supported
      setCoordinates({
        latitude: -1.2921,
        longitude: 36.8219,
      })
    }
  }, [])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/blogCategories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.docs || [])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()
  }, [])

  // Get location name from coordinates using reverse geocoding
  useEffect(() => {
    if (!coordinates) return

    const getLocationName = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.latitude}&lon=${coordinates.longitude}&zoom=10`,
        )

        if (!response.ok) throw new Error('Geocoding failed')

        const data = await response.json()

        // Extract city or town name from address
        const locationName =
          data.address?.city ??
          data.address?.town ??
          data.address?.state ??
          data.address?.country ??
          'Unknown'

        setWeather((prev) => ({
          ...prev,
          location: locationName,
        }))
      } catch (error) {
        console.error('Error getting location name:', error)
      }
    }

    getLocationName()
  }, [coordinates])

  // Fetch weather data from Open-Meteo API
  useEffect(() => {
    if (!coordinates) return

    const fetchWeatherData = async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&current=temperature_2m,weather_code,wind_speed_10m`,
        )

        if (!response.ok) {
          throw new Error('Weather data fetch failed')
        }

        const data = await response.json()

        setWeather((prev) => ({
          ...prev,
          temperature: data.current.temperature_2m,
          windSpeed: data.current.wind_speed_10m,
          weatherCode: data.current.weather_code,
          loading: false,
          error: false,
        }))
      } catch (error) {
        console.error('Error fetching weather data:', error)
        setWeather((prev) => ({
          ...prev,
          loading: false,
          error: true,
        }))
      }
    }

    fetchWeatherData()
  }, [coordinates])

  // Get weather icon based on weather code
  const getWeatherIcon = (code: number) => {
    // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
    if (code === 0) return <BiSun className="mr-1.5 h-3.5 w-3.5 text-amber-500" /> // Clear sky
    if (code >= 1 && code <= 3) return <BiCloud className="mr-1.5 h-3.5 w-3.5 text-gray-400" /> // Partly cloudy
    if (code >= 45 && code <= 48) return <BiCloud className="mr-1.5 h-3.5 w-3.5 text-gray-400" /> // Fog
    if ((code >= 51 && code <= 55) || (code >= 61 && code <= 65))
      return <BiCloudRain className="mr-1.5 h-3.5 w-3.5 text-blue-400" /> // Rain
    if (code >= 56 && code <= 57)
      return <BiCloudDrizzle className="mr-1.5 h-3.5 w-3.5 text-blue-300" /> // Drizzle
    if (code >= 71 && code <= 77)
      return <BiCloudSnow className="mr-1.5 h-3.5 w-3.5 text-blue-100" /> // Snow
    if (code >= 80 && code <= 82)
      return <BiCloudRain className="mr-1.5 h-3.5 w-3.5 text-blue-500" /> // Rain showers
    if (code >= 85 && code <= 86)
      return <BiCloudSnow className="mr-1.5 h-3.5 w-3.5 text-blue-200" /> // Snow showers
    if (code >= 95 && code <= 99)
      return <BiCloudLightning className="mr-1.5 h-3.5 w-3.5 text-yellow-500" /> // Thunderstorm

    return <BiCloud className="mr-1.5 h-3.5 w-3.5" /> // Default
  }

  // Get weather condition text based on weather code
  const getWeatherCondition = (code: number) => {
    if (code === 0) return 'Clear'
    if (code === 1) return 'Mostly clear'
    if (code === 2) return 'Partly cloudy'
    if (code === 3) return 'Cloudy'
    if (code >= 45 && code <= 48) return 'Foggy'
    if (code >= 51 && code <= 55) return 'Drizzle'
    if (code >= 56 && code <= 57) return 'Freezing drizzle'
    if (code >= 61 && code <= 65) return 'Rain'
    if (code >= 66 && code <= 67) return 'Freezing rain'
    if (code >= 71 && code <= 77) return 'Snow'
    if (code >= 80 && code <= 82) return 'Rain showers'
    if (code >= 85 && code <= 86) return 'Snow showers'
    if (code >= 95 && code <= 99) return 'Thunderstorm'

    return 'Unknown'
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
              <div className="hidden md:flex items-center space-x-4">
                <a
                  href="https://youtube.com/@dawanafrica?si=MeDNmWJDGkFWiF45"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-[#2aaac6] transition-colors"
                >
                  <BiLogoYoutube size={16} />
                </a>
                <a
                  href="https://x.com/dawanafrica?s=11&t=cGgYbc_v8C1zcdmiZHSiRg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-[#2aaac6] transition-colors"
                >
                  <BiLogoTwitter size={16} />
                </a>
                <a
                  href="https://www.facebook.com/share/1DLeMnVa2e/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-[#2aaac6] transition-colors"
                >
                  <BiLogoFacebook size={16} />
                </a>
                <a
                  href="https://www.tiktok.com/@dawanafrica?_t=ZS-8wXUI4l8QKX&_r=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-[#2aaac6] transition-colors"
                >
                  <BiLogoTiktok size={16} />
                </a>
              </div>

              {/* Date (tablet and up) */}
              <div className="hidden md:flex items-center text-xs text-gray-500">
                <BiCalendar className="mr-1.5 h-3.5 w-3.5" />
                <span>{formattedDate}</span>
              </div>
            </div>

            {/* Right - Weather & Account & Search */}
            <div className="flex items-center space-x-4">
              {/* Weather (tablet and up) */}
              <div className="hidden md:flex items-center text-xs text-gray-500">
                {weather.loading ? (
                  <div className="flex items-center">
                    <Skeleton className="h-3.5 w-3.5 mr-1.5 rounded-full" />
                    <Skeleton className="h-3.5 w-20" />
                  </div>
                ) : weather.error ? (
                  <span className="flex items-center">
                    <BiCloud className="mr-1.5 h-3.5 w-3.5" />
                    Weather unavailable
                  </span>
                ) : (
                  <div className="flex items-center">
                    {getWeatherIcon(weather.weatherCode)}
                    <span>{Math.round(weather.temperature)}°C</span>
                    <span className="mx-1 text-gray-400">•</span>
                    <span className="hidden md:inline">
                      {getWeatherCondition(weather.weatherCode)}
                    </span>
                    <BiWind className="mx-1.5 h-3.5 w-3.5 text-gray-400 hidden md:inline-block" />
                    <span className="hidden md:inline">{Math.round(weather.windSpeed)} km/h</span>
                    {weather.location && (
                      <>
                        <BiMapPin className="mx-1.5 h-3 w-3 text-gray-400 hidden md:inline-block" />
                        <span className="hidden md:inline">{weather.location}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Account/Login/Register Links */}
              {authLoading ? (
                <Skeleton className="h-5 w-20" />
              ) : user ? (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/account"
                    className="flex items-center text-xs text-gray-500 hover:text-[#2aaac6] transition-colors"
                  >
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-1.5 border border-slate-200">
                        <AvatarImage
                          src={
                            user.profilePicture &&
                            typeof user.profilePicture === 'object' &&
                            user.profilePicture.url
                              ? user.profilePicture.url
                              : undefined
                          }
                          alt={user.name ?? 'User'}
                        />
                        <AvatarFallback className="text-[10px] font-medium bg-slate-100 text-slate-500">
                          {getInitials(user.name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline max-w-[100px] truncate">
                        {user.name || user.email?.split('@')[0]}
                      </span>
                    </div>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      await authLogout()
                    }}
                    className="text-gray-600 hover:text-red-500 -mr-2"
                    aria-label="Logout"
                  >
                    <BiLogOut className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center text-xs text-gray-500 hover:text-[#2aaac6] transition-colors"
                  >
                    <BiUser size={16} className="mr-1" />
                    <span className="hidden sm:inline">Login</span>
                  </Link>
                  <Link
                    href="/register"
                    className="hidden sm:flex items-center text-xs text-gray-500 hover:text-[#2aaac6] transition-colors"
                  >
                    <BiUserPlus size={16} className="mr-1" />
                    <span className="hidden sm:inline">Register</span>
                  </Link>
                </>
              )}

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
      <div className="py-2 border-b border-gray-100 hidden lg:block">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-12 gap-4 items-center">
            {/* Search - updated to use SearchInput */}
            <div className="col-span-3">
              <SearchInput
                isHeaderSearch={true}
                inputClassName="h-9 rounded-full text-sm border-gray-200 focus-visible:ring-[#2aaac6]"
                buttonClassName="h-9 px-3"
                redirectPath="/news"
                placeholder="Search articles..."
              />
            </div>

            {/* Categories */}
            <div className="col-span-9">
              <ScrollArea className="w-full whitespace-nowrap" type="scroll">
                <div className="flex space-x-1 px-1">
                  <Button
                    variant="ghost"
                    asChild
                    className="text-gray-700 hover:text-[#2aaac6] hover:bg-transparent rounded-md"
                  >
                    <Link href="/">Home</Link>
                  </Button>

                  <Button
                    variant="ghost"
                    asChild
                    className="text-gray-700 hover:text-[#2aaac6] hover:bg-transparent rounded-md"
                  >
                    <Link href="/news">All News</Link>
                  </Button>

                  <Button
                    variant="ghost"
                    asChild
                    className="text-gray-700 hover:text-[#2aaac6] hover:bg-transparent rounded-md"
                  >
                    <Link href="/markets">
                      <span className="flex items-center">
                        <BiCoin className="w-4 h-4 mr-1" />
                        Markets
                      </span>
                    </Link>
                  </Button>

                  {/* Countries dropdown using DropdownMenu component */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-gray-700 hover:text-[#2aaac6] hover:bg-transparent rounded-md flex items-center gap-1"
                      >
                        <BiGlobe className="w-4 h-4 mr-1" />
                        Countries
                        <BiChevronDown className="h-4 w-4 ml-1 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-[180px]">
                      <DropdownMenuLabel>Select Country</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {countries.map((country) => (
                        <DropdownMenuItem
                          key={country}
                          onClick={() => navigateToCountrySearch(country)}
                          className="cursor-pointer"
                        >
                          {country}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Add Football button in desktop navigation */}
                  <FootballSheet>
                    <Button
                      variant="ghost"
                      className="text-gray-700 hover:text-[#2aaac6] hover:bg-transparent rounded-md"
                    >
                      Football
                    </Button>
                  </FootballSheet>

                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant="ghost"
                      asChild
                      className="text-gray-700 hover:text-[#2aaac6] hover:bg-transparent rounded-md"
                    >
                      <Link href={`/categories/${category.id}`}>{category.name}</Link>
                    </Button>
                  ))}

                  {categories.length === 0 &&
                    Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-9 w-20 rounded-md" />
                    ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search input */}
      {searchOpen && (
        <div className="py-2 border-t border-gray-100 lg:hidden">
          <div className="container mx-auto px-4">
            <SearchInput
              isHeaderSearch={true}
              inputClassName="h-10 rounded-full text-sm border-gray-200 focus-visible:ring-[#2aaac6]"
              buttonClassName="h-10 px-4"
              redirectPath="/news"
              autoFocus={true}
              placeholder="Search articles..."
            />
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white fixed top-[55px] left-0 right-0 bottom-0 z-50 overflow-y-auto">
          <div className="container mx-auto px-4 py-4 pb-20">
            {/* Mobile menu header with social/date/weather/football */}
            <div className="mb-4 hidden pb-4 border-b border-gray-100">
              {/* Social Media */}
              <div className="hidden flex space-x-4 mb-3">
                <a
                  href="https://twitter.com/dawanafrica"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-[#2aaac6] transition-colors"
                >
                  <BiLogoTwitter size={16} />
                </a>
                <a
                  href="https://facebook.com/dawanafrica"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-[#2aaac6] transition-colors"
                >
                  <BiLogoFacebook size={16} />
                </a>
                <a
                  href="https://instagram.com/dawanafrica"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-[#2aaac6] transition-colors"
                >
                  <BiLogoInstagram size={16} />
                </a>
              </div>

              {/* Date (mobile only) */}
              <div className="hidden flex items-center text-xs text-gray-500 mb-3">
                <BiCalendar className="mr-1.5 h-3.5 w-3.5" />
                <span>{formattedDate}</span>
              </div>

              {/* Weather (mobile only) */}
              <div className="hidden flex items-center text-xs text-gray-500">
                {weather.loading ? (
                  <div className="flex items-center">
                    <Skeleton className="h-3.5 w-3.5 mr-1.5 rounded-full" />
                    <Skeleton className="h-3.5 w-20" />
                  </div>
                ) : weather.error ? (
                  <span className="flex items-center">
                    <BiCloud className="mr-1.5 h-3.5 w-3.5" />
                    Weather unavailable
                  </span>
                ) : (
                  <div className="flex items-center flex-wrap">
                    {getWeatherIcon(weather.weatherCode)}
                    <span>{Math.round(weather.temperature)}°C</span>
                    <span className="mx-1 text-gray-400">•</span>
                    <span>{getWeatherCondition(weather.weatherCode)}</span>
                    <div className="w-full h-1"></div>
                    <BiWind className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
                    <span>{Math.round(weather.windSpeed)} km/h</span>
                    {weather.location && (
                      <>
                        <span className="mx-1 text-gray-400">•</span>
                        <BiMapPin className="mr-1 h-3 w-3 text-gray-400" />
                        <span className="truncate">{weather.location}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col space-y-2">
              <Link
                href="/news"
                className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-[#2aaac6]"
                onClick={() => setIsMenuOpen(false)}
              >
                All News
              </Link>

              <Link
                href="/markets"
                className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-[#2aaac6] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                <BiCoin className="h-4 w-4 mr-2" />
                Markets
              </Link>

              {/* Add Football button in mobile navigation */}
              <FootballSheet>
                <button className="text-left px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-[#2aaac6] w-full">
                  Football
                </button>
              </FootballSheet>

              {/* Auth links in mobile menu */}
              <div className="pt-2 pb-1 border-t mt-2">
                {authLoading ? (
                  <Skeleton className="h-10 w-full rounded-md mt-1" />
                ) : user ? (
                  <>
                    <Link
                      href="/account"
                      className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-[#2aaac6]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Avatar className="h-6 w-6 mr-2 border border-slate-200">
                        <AvatarImage
                          src={
                            user.profilePicture &&
                            typeof user.profilePicture === 'object' &&
                            user.profilePicture.url
                              ? user.profilePicture.url
                              : undefined
                          }
                          alt={user.name ?? 'User'}
                        />
                        <AvatarFallback className="text-[10px] font-medium bg-slate-100 text-slate-500">
                          {getInitials(user.name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate max-w-[200px]">
                        {user.name || user.email?.split('@')[0]}
                      </span>
                    </Link>
                    <button
                      className="text-left flex w-full px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-red-500"
                      onClick={async () => {
                        await authLogout()
                        setIsMenuOpen(false)
                      }}
                    >
                      <BiLogOut className="h-5 w-5 mr-2" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-[#2aaac6]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-[#2aaac6]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>

              {/* Countries section in mobile navigation */}
              <div className="pt-2 pb-1 border-t mt-2">
                <Badge
                  variant="outline"
                  className="text-xs font-normal text-gray-500 bg-transparent"
                >
                  Countries
                </Badge>
              </div>

              <div className="flex flex-col space-y-1">
                {countries.map((country) => (
                  <button
                    key={country}
                    onClick={() => navigateToCountrySearch(country)}
                    className="text-left px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-[#2aaac6]"
                  >
                    {country}
                  </button>
                ))}
              </div>

              <div className="pt-2 pb-1 border-t mt-2">
                <Badge
                  variant="outline"
                  className="text-xs font-normal text-gray-500 bg-transparent"
                >
                  Categories
                </Badge>
              </div>

              <div className="flex flex-col space-y-1">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.id}`}
                    className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-[#2aaac6]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}

                {categories.length === 0 &&
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-md" />
                  ))}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header

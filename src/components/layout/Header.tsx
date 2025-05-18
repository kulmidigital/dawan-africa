'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'

import {
  Calendar,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Facebook,
  Instagram,
  MapPin,
  Menu,
  Search,
  Sun,
  Twitter,
  User,
  Wind,
  X,
} from 'lucide-react'

import { BlogCategory } from '@/payload-types'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import FootballSheet from '@/components/football/FootballSheet'

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

const Header: React.FC = () => {
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
          console.error('Geolocation error:', error)
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
          data.address?.city ||
          data.address?.town ||
          data.address?.state ||
          data.address?.country ||
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
    if (code === 0) return <Sun className="mr-1.5 h-3.5 w-3.5 text-amber-500" /> // Clear sky
    if (code >= 1 && code <= 3) return <Cloud className="mr-1.5 h-3.5 w-3.5 text-gray-400" /> // Partly cloudy
    if (code >= 45 && code <= 48) return <CloudFog className="mr-1.5 h-3.5 w-3.5 text-gray-400" /> // Fog
    if ((code >= 51 && code <= 55) || (code >= 61 && code <= 65))
      return <CloudRain className="mr-1.5 h-3.5 w-3.5 text-blue-400" /> // Rain
    if (code >= 56 && code <= 57)
      return <CloudDrizzle className="mr-1.5 h-3.5 w-3.5 text-blue-300" /> // Drizzle
    if (code >= 71 && code <= 77) return <CloudSnow className="mr-1.5 h-3.5 w-3.5 text-blue-100" /> // Snow
    if (code >= 80 && code <= 82) return <CloudRain className="mr-1.5 h-3.5 w-3.5 text-blue-500" /> // Rain showers
    if (code >= 85 && code <= 86) return <CloudSnow className="mr-1.5 h-3.5 w-3.5 text-blue-200" /> // Snow showers
    if (code >= 95 && code <= 99)
      return <CloudLightning className="mr-1.5 h-3.5 w-3.5 text-yellow-500" /> // Thunderstorm

    return <Cloud className="mr-1.5 h-3.5 w-3.5" /> // Default
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
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
              <div className="hidden sm:flex items-center space-x-4">
                <a
                  href="https://twitter.com/dawanafrica"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-[#2aaac6] transition-colors"
                >
                  <Twitter size={16} />
                </a>
                <a
                  href="https://facebook.com/dawanafrica"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-[#2aaac6] transition-colors"
                >
                  <Facebook size={16} />
                </a>
                <a
                  href="https://instagram.com/dawanafrica"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-[#2aaac6] transition-colors"
                >
                  <Instagram size={16} />
                </a>
              </div>

              {/* Date (tablet and up) */}
              <div className="hidden sm:flex items-center text-xs text-gray-500">
                <Calendar className="mr-1.5 h-3.5 w-3.5" />
                <span>{formattedDate}</span>
              </div>
            </div>

            {/* Right - Weather & Account & Search */}
            <div className="flex items-center space-x-4">
              {/* Weather (tablet and up) */}
              <div className="hidden sm:flex items-center text-xs text-gray-500">
                {weather.loading ? (
                  <div className="flex items-center">
                    <Skeleton className="h-3.5 w-3.5 mr-1.5 rounded-full" />
                    <Skeleton className="h-3.5 w-20" />
                  </div>
                ) : weather.error ? (
                  <span className="flex items-center">
                    <Cloud className="mr-1.5 h-3.5 w-3.5" />
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
                    <Wind className="mx-1.5 h-3.5 w-3.5 text-gray-400 hidden md:inline-block" />
                    <span className="hidden md:inline">{Math.round(weather.windSpeed)} km/h</span>
                    {weather.location && (
                      <>
                        <MapPin className="mx-1.5 h-3 w-3 text-gray-400 hidden md:inline-block" />
                        <span className="hidden md:inline">{weather.location}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Account */}
              <Link
                href="/account"
                className="flex items-center text-xs text-gray-500 hover:text-[#2aaac6] transition-colors"
              >
                <User size={16} className="mr-1" />
                <span className="hidden sm:inline">Account</span>
              </Link>

              {/* Mobile search button */}
              <div className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="text-gray-600 hover:text-[#2aaac6] -mr-2"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
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
            {/* Search */}
            <div className="col-span-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search news..."
                  className="pl-10 h-9 rounded-full text-sm border-gray-200 focus-visible:ring-[#2aaac6]"
                />
              </div>
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="search"
                placeholder="Search news..."
                className="pl-10 w-full h-10 rounded-full text-sm border-gray-200 focus-visible:ring-[#2aaac6]"
                autoFocus
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-4">
            {/* Mobile menu header with social/date/weather/football */}
            <div className="mb-4 pb-4 border-b border-gray-100">
              {/* Social Media */}
              <div className="flex space-x-4 mb-3 sm:hidden">
                <a
                  href="https://twitter.com/dawanafrica"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-[#2aaac6] transition-colors"
                >
                  <Twitter size={16} />
                </a>
                <a
                  href="https://facebook.com/dawanafrica"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-[#2aaac6] transition-colors"
                >
                  <Facebook size={16} />
                </a>
                <a
                  href="https://instagram.com/dawanafrica"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-[#2aaac6] transition-colors"
                >
                  <Instagram size={16} />
                </a>
              </div>

              {/* Date (mobile only) */}
              <div className="sm:hidden flex items-center text-xs text-gray-500 mb-3">
                <Calendar className="mr-1.5 h-3.5 w-3.5" />
                <span>{formattedDate}</span>
              </div>

              {/* Weather (mobile only) */}
              <div className="sm:hidden flex items-center text-xs text-gray-500">
                {weather.loading ? (
                  <div className="flex items-center">
                    <Skeleton className="h-3.5 w-3.5 mr-1.5 rounded-full" />
                    <Skeleton className="h-3.5 w-20" />
                  </div>
                ) : weather.error ? (
                  <span className="flex items-center">
                    <Cloud className="mr-1.5 h-3.5 w-3.5" />
                    Weather unavailable
                  </span>
                ) : (
                  <div className="flex items-center flex-wrap">
                    {getWeatherIcon(weather.weatherCode)}
                    <span>{Math.round(weather.temperature)}°C</span>
                    <span className="mx-1 text-gray-400">•</span>
                    <span>{getWeatherCondition(weather.weatherCode)}</span>
                    <div className="w-full h-1"></div>
                    <Wind className="mr-1.5 h-3.5 w-3.5 text-gray-400" />
                    <span>{Math.round(weather.windSpeed)} km/h</span>
                    {weather.location && (
                      <>
                        <span className="mx-1 text-gray-400">•</span>
                        <MapPin className="mr-1 h-3 w-3 text-gray-400" />
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
                href="/"
                className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-[#2aaac6]"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/news"
                className="px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-[#2aaac6]"
                onClick={() => setIsMenuOpen(false)}
              >
                All News
              </Link>

              {/* Add Football button in mobile navigation */}
              <FootballSheet>
                <button
                  className="text-left px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 hover:text-[#2aaac6] w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Football
                </button>
              </FootballSheet>

              <div className="pt-2 pb-1">
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

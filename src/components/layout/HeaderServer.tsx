import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { BlogCategory } from '@/payload-types'
import Header from './Header'

// Weather data type
interface WeatherData {
  temperature: number
  condition: string
  location: string
  icon?: string
}

// Fetch weather data using Open-Meteo API (no API key required)
const fetchWeatherData = async (): Promise<WeatherData | null> => {
  try {
    // Using Mogadishu coordinates
    const latitude = 2.0469
    const longitude = 45.3182

    console.log('🌤️ Fetching weather data for Mogadishu...')

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m`,
      { next: { revalidate: 1800 } }, // Cache for 30 minutes
    )

    console.log('🌤️ Weather API response status:', response.status, response.ok)

    if (!response.ok) {
      console.warn('Weather API request failed with status:', response.status)
      return {
        temperature: 28,
        condition: 'partly cloudy',
        location: 'Mogadishu',
      }
    }

    const data = await response.json()
    console.log('🌤️ Weather API data:', data)

    // Convert weather code to condition description
    const getWeatherCondition = (code: number): string => {
      if (code === 0) return 'clear'
      if (code === 1) return 'mostly clear'
      if (code === 2) return 'partly cloudy'
      if (code === 3) return 'cloudy'
      if (code >= 45 && code <= 48) return 'foggy'
      if (code >= 51 && code <= 55) return 'drizzle'
      if (code >= 61 && code <= 65) return 'rain'
      if (code >= 71 && code <= 77) return 'snow'
      if (code >= 80 && code <= 82) return 'rain showers'
      if (code >= 95 && code <= 99) return 'thunderstorm'
      return 'partly cloudy'
    }

    const weatherData = {
      temperature: Math.round(data.current.temperature_2m),
      condition: getWeatherCondition(data.current.weather_code),
      location: 'Mogadishu',
    }

    console.log('🌤️ Processed weather data:', weatherData)
    return weatherData
  } catch (error) {
    console.error('❌ Error fetching weather:', error)
    // Return fallback weather data
    return {
      temperature: 28,
      condition: 'partly cloudy',
      location: 'Mogadishu',
    }
  }
}

// Fetch categories using Payload's local API
const fetchCategories = async (): Promise<BlogCategory[]> => {
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'blogCategories',
      limit: 50, // Adjust as needed
      sort: 'name',
    })

    return result.docs || []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

const HeaderServer: React.FC = async () => {
  // Fetch data in parallel
  const [categories, weather] = await Promise.all([
    fetchCategories(),
    // Temporarily disable server weather fetching to let client take over
    Promise.resolve(null), // fetchWeatherData(),
  ])

  return <Header initialCategories={categories} initialWeather={weather} />
}

export default HeaderServer

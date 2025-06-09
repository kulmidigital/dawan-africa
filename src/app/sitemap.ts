import { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import siteConfig from '@/app/shared-metadata'

// List of countries we want to feature
const countries = ['Somalia', 'Kenya', 'Djibouti', 'Ethiopia', 'Eritrea']

async function getAllPosts() {
  const payload = await getPayload({ config })
  const posts = await payload.find({
    collection: 'blogPosts',
    limit: 5000,
  })
  return posts.docs
}

async function getAllCategories() {
  const payload = await getPayload({ config })
  const categories = await payload.find({
    collection: 'blogCategories',
    limit: 10,
  })
  return categories.docs
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url

  // Main pages with high priority
  const mainPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ]

  // Country-specific news pages (high priority for regional focus)
  const countryPages = countries.map((country) => ({
    url: `${baseUrl}/news?search=${encodeURIComponent(country)}&searchField=name`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0, // High priority since country news is core to your brand
  }))

  // Category pages
  const categories = [
    'Politics',
    'Business',
    'Technology',
    'Sports',
    'Culture',
    'Health',
    'Environment',
    'Education',
  ]
  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}/category/${category.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Additional important pages
  const additionalPages = [
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ]

  return [...mainPages, ...countryPages, ...categoryPages, ...additionalPages]
}

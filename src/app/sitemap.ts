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
  try {
    const categories = await payload.find({
      collection: 'blogCategories',
      limit: 100,
    })
    return categories.docs
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  // Country-specific news pages
  const countryPages = countries.map((country) => ({
    url: `${baseUrl}/news?search=${encodeURIComponent(country)}&amp;searchField=name`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }))

  // Dynamic blog posts - fetch from CMS
  const posts = await getAllPosts()
  const postPages = posts.map((post) => ({
    url: `${baseUrl}/news/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Dynamic category pages - fetch from CMS
  const categories = await getAllCategories()
  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
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

  return [...mainPages, ...countryPages, ...postPages, ...categoryPages, ...additionalPages]
}

import { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { SITE_CONFIG } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })
  const baseUrl = SITE_CONFIG.url

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/markets`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
  ]

  try {
    // Fetch all blog posts
    const postsResponse = await payload.find({
      collection: 'blogPosts',
      limit: 1000, // Adjust based on your needs
      sort: '-updatedAt',
    })

    const postRoutes: MetadataRoute.Sitemap = postsResponse.docs.map((post) => ({
      url: `${baseUrl}/news/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // Fetch all categories
    const categoriesResponse = await payload.find({
      collection: 'blogCategories',
      limit: 100,
    })

    const categoryRoutes: MetadataRoute.Sitemap = categoriesResponse.docs.map((category) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: new Date(category.updatedAt || new Date()),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    }))

    return [...staticRoutes, ...postRoutes, ...categoryRoutes]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return at least static routes if dynamic content fails
    return staticRoutes
  }
}

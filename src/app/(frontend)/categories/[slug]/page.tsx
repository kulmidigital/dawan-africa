import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CategoryPostsList } from '@/components/categories/CategoryPostsList'
import { BlogCategory } from '@/payload-types'
import { FootballLeagueButtons } from '@/components/categories/FootballLeagueButtons'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { generateCategoryMetadata, SITE_CONFIG } from '@/lib/seo'

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

// Fetch category by slug using Payload's local API
async function getCategory(slug: string) {
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'blogCategories',
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
    })

    return result.docs?.[0] || null
  } catch (error) {
    console.error('Error fetching category:', error)
    return null
  }
}

// Get post count for a category
async function getCategoryPostCount(categoryId: string): Promise<number> {
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.count({
      collection: 'blogPosts',
      where: {
        categories: {
          in: [categoryId],
        },
      },
    })

    return result.totalDocs
  } catch (error) {
    console.error('Error fetching category post count:', error)
    return 0
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  // Get post count for better metadata
  const postCount = await getCategoryPostCount(category.id)
  const currentUrl = `${SITE_CONFIG.url}/categories/${category.slug}`

  return generateCategoryMetadata({
    category,
    currentUrl,
    postCount,
  })
}

export default async function CategoryPage({ params }: Readonly<CategoryPageProps>) {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    notFound()
  }

  // Check if this is the sports category
  const isSportsCategory = category.slug === 'sports' || category.name.toLowerCase() === 'sports'

  return (
    <main className="bg-gray-50 min-h-screen">
      {isSportsCategory && <FootballLeagueButtons />}
      <CategoryPostsList categorySlug={category.slug} categoryName={category.name} />
    </main>
  )
}

// Generate static params for common categories (optional, for better performance)
export async function generateStaticParams() {
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'blogCategories',
      limit: 100,
    })

    return (
      result.docs?.map((category: BlogCategory) => ({
        slug: category.slug,
      })) || []
    )
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

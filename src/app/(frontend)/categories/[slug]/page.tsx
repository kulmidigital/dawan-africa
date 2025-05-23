import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CategoryPostsList } from '@/components/categories/CategoryPostsList'
import { BlogCategory } from '@/payload-types'
import { FootballLeagueButtons } from '@/components/categories/FootballLeagueButtons'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

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

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found.',
    }
  }

  return {
    title: `${category.name} - News & Articles`,
    description: `Discover the latest news and articles in ${category.name}. Stay updated with comprehensive coverage and insights.`,
    openGraph: {
      title: `${category.name} - News & Articles`,
      description: `Discover the latest news and articles in ${category.name}. Stay updated with comprehensive coverage and insights.`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} - News & Articles`,
      description: `Discover the latest news and articles in ${category.name}. Stay updated with comprehensive coverage and insights.`,
    },
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
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

import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import { HeroSection } from '@/components/home/HeroSection'
import { FeaturedPosts } from '@/components/home/FeaturedPosts'
import { CategorySection } from '@/components/home/CategorySection'
import { BlogPost } from '@/payload-types'

export default async function HomePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Fetch the latest blog posts for the hero section
  const heroPostsResponse = await payload.find({
    collection: 'blogPosts',
    limit: 5,
    sort: '-createdAt',
    depth: 2,
  })

  const heroPosts = heroPostsResponse.docs
  const latestPost: BlogPost | null = heroPosts.length > 0 ? heroPosts[0] : null

  // Get IDs of posts shown in HeroSection to exclude from FeaturedPosts
  const heroPostIds = heroPosts.map((post) => post.id)

  // Fetch categories
  const categoriesResponse = await payload.find({
    collection: 'blogCategories',
    limit: 6,
  })

  const categories = categoriesResponse.docs

  return (
    <div className="min-h-screen">
      {/* Hero Section with latest post and recent posts */}
      <HeroSection latestPost={latestPost} recentPosts={heroPosts.slice(1)} />

      {/* Featured Posts Section - Excluding hero posts */}
      <FeaturedPosts excludePostIds={heroPostIds} />

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-10 text-center">
            News Categories
          </h2>
          <CategorySection categories={categories} />
        </div>
      </section>
    </div>
  )
}

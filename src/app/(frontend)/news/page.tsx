import React from 'react'
import { NewsList } from '@/components/news/NewsList'

// Optionally, you can add metadata for SEO
// import type { Metadata } from 'next'
// export const metadata: Metadata = {
//   title: 'Latest News | Dawan Africa',
//   description: 'Stay updated with the latest news, articles, and insights from Dawan Africa.',
// }

export default function NewsPage() {
  return (
    <main className="bg-gray-50 min-h-screen">
      <NewsList />
    </main>
  )
}

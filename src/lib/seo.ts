import { Metadata } from 'next'
import { BlogPost, BlogCategory, Media } from '@/payload-types'
import { getPostImageFromLayout, getPostExcerpt, getAuthorDisplayName } from '@/utils/postUtils'

// Site configuration
const SITE_CONFIG = {
  name: 'Dawan Africa',
  description: 'Uncovering the Continent — Through Its Own Lens',
  url: process.env.NEXT_PUBLIC_SERVER_URL || 'https://dawan-africa.vercel.app',
  twitterHandle: '@DawanAfrica',
  locale: 'en_US',
  defaultImage: '/og-default.png',
} as const

// Base metadata that will be inherited by all pages
export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  applicationName: SITE_CONFIG.name,
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    images: [
      {
        url: SITE_CONFIG.defaultImage,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: SITE_CONFIG.twitterHandle,
    creator: SITE_CONFIG.twitterHandle,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.defaultImage],
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  manifest: '/manifest.json',
}

// Generate metadata for blog post articles
export function generateArticleMetadata({
  post,
  currentUrl,
}: {
  post: BlogPost
  currentUrl: string
}): Metadata {
  const title = post.name
  const description = getPostExcerpt(post, { maxLength: 160 })
  const authorName = getAuthorDisplayName(post.author)
  const publishedTime = post.createdAt
  const modifiedTime = post.updatedAt

  // Get cover image from layout
  const coverImageUrl = getPostImageFromLayout(post.layout)
  const imageUrl = coverImageUrl
    ? coverImageUrl.startsWith('http')
      ? coverImageUrl
      : `${SITE_CONFIG.url}${coverImageUrl}`
    : `${SITE_CONFIG.url}${SITE_CONFIG.defaultImage}`

  // Extract category names for keywords
  const categoryNames = Array.isArray(post.categories)
    ? (post.categories
        .map((cat) => (typeof cat === 'object' && cat ? cat.name : null))
        .filter(Boolean) as string[])
    : []

  const keywords = [
    'Africa news',
    'African journalism',
    'Horn of Africa',
    'East Africa',
    ...categoryNames,
    SITE_CONFIG.name,
  ].join(', ')

  return {
    title,
    description,
    keywords,
    authors: [{ name: authorName }],
    creator: authorName,
    publisher: SITE_CONFIG.name,
    category: categoryNames[0] || 'News',
    openGraph: {
      type: 'article',
      locale: SITE_CONFIG.locale,
      url: currentUrl,
      siteName: SITE_CONFIG.name,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      publishedTime,
      modifiedTime,
      authors: [authorName],
      section: categoryNames[0] || 'News',
      tags: categoryNames,
    },
    twitter: {
      card: 'summary_large_image',
      site: SITE_CONFIG.twitterHandle,
      creator: SITE_CONFIG.twitterHandle,
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: currentUrl,
    },
  }
}

// Generate metadata for category pages
export function generateCategoryMetadata({
  category,
  currentUrl,
  postCount,
}: {
  category: BlogCategory
  currentUrl: string
  postCount?: number
}): Metadata {
  const title = `${category.name} News & Articles`
  const description = `Discover the latest ${category.name.toLowerCase()} news and articles from ${SITE_CONFIG.name}. ${
    postCount ? `Browse ${postCount} articles` : 'Stay updated with comprehensive coverage'
  } and insights from across Africa.`

  return {
    title,
    description,
    keywords: `${category.name}, African ${category.name.toLowerCase()}, ${category.name} news, Africa, ${SITE_CONFIG.name}`,
    openGraph: {
      type: 'website',
      locale: SITE_CONFIG.locale,
      url: currentUrl,
      siteName: SITE_CONFIG.name,
      title,
      description,
      images: [
        {
          url: `${SITE_CONFIG.url}${SITE_CONFIG.defaultImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: SITE_CONFIG.twitterHandle,
      creator: SITE_CONFIG.twitterHandle,
      title,
      description,
      images: [`${SITE_CONFIG.url}${SITE_CONFIG.defaultImage}`],
    },
    alternates: {
      canonical: currentUrl,
    },
  }
}

// Generate metadata for news listing page
export function generateNewsListingMetadata({
  currentUrl,
  page = 1,
  searchTerm,
}: {
  currentUrl: string
  page?: number
  searchTerm?: string
}): Metadata {
  const title = searchTerm
    ? `Search Results: "${searchTerm}"`
    : page > 1
      ? `Latest News - Page ${page}`
      : 'Latest News & Articles'

  const description = searchTerm
    ? `Search results for "${searchTerm}" on ${SITE_CONFIG.name}. Find the latest African news and insights.`
    : `Stay updated with the latest news, articles, and insights from ${SITE_CONFIG.name}. Comprehensive coverage of African affairs, politics, business, and culture.`

  return {
    title,
    description,
    keywords: searchTerm
      ? `${searchTerm}, African news, search results, ${SITE_CONFIG.name}`
      : 'African news, latest articles, Africa updates, journalism, politics, business, culture',
    openGraph: {
      type: 'website',
      locale: SITE_CONFIG.locale,
      url: currentUrl,
      siteName: SITE_CONFIG.name,
      title,
      description,
      images: [
        {
          url: `${SITE_CONFIG.url}${SITE_CONFIG.defaultImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: SITE_CONFIG.twitterHandle,
      creator: SITE_CONFIG.twitterHandle,
      title,
      description,
      images: [`${SITE_CONFIG.url}${SITE_CONFIG.defaultImage}`],
    },
    alternates: {
      canonical: currentUrl,
    },
    ...(page > 1 && {
      robots: {
        index: false, // Don't index pagination pages
        follow: true,
      },
    }),
  }
}

// Generate metadata for markets page
export function generateMarketsMetadata({ currentUrl }: { currentUrl: string }): Metadata {
  const title = 'Cryptocurrency Markets'
  const description = `Explore real-time cryptocurrency prices, market caps, and trading volumes on ${SITE_CONFIG.name}. Track Bitcoin, Ethereum, and other digital assets with comprehensive market data.`

  return {
    title,
    description,
    keywords:
      'cryptocurrency, Bitcoin, Ethereum, crypto prices, market cap, digital assets, blockchain, trading, Africa',
    openGraph: {
      type: 'website',
      locale: SITE_CONFIG.locale,
      url: currentUrl,
      siteName: SITE_CONFIG.name,
      title,
      description,
      images: [
        {
          url: `${SITE_CONFIG.url}${SITE_CONFIG.defaultImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: SITE_CONFIG.twitterHandle,
      creator: SITE_CONFIG.twitterHandle,
      title,
      description,
      images: [`${SITE_CONFIG.url}${SITE_CONFIG.defaultImage}`],
    },
    alternates: {
      canonical: currentUrl,
    },
  }
}

// Generate metadata for homepage
export function generateHomepageMetadata({
  currentUrl,
  featuredPost,
}: {
  currentUrl: string
  featuredPost?: BlogPost | null
}): Metadata {
  const title = SITE_CONFIG.name
  const description = SITE_CONFIG.description

  // Use featured post image if available
  const imageUrl = featuredPost
    ? (() => {
        const coverImageUrl = getPostImageFromLayout(featuredPost.layout)
        return coverImageUrl
          ? coverImageUrl.startsWith('http')
            ? coverImageUrl
            : `${SITE_CONFIG.url}${coverImageUrl}`
          : `${SITE_CONFIG.url}${SITE_CONFIG.defaultImage}`
      })()
    : `${SITE_CONFIG.url}${SITE_CONFIG.defaultImage}`

  return {
    title,
    description,
    keywords:
      'Africa news, African journalism, Horn of Africa, East Africa, Somalia, Kenya, Ethiopia, Eritrea, Djibouti',
    openGraph: {
      type: 'website',
      locale: SITE_CONFIG.locale,
      url: currentUrl,
      siteName: SITE_CONFIG.name,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: SITE_CONFIG.twitterHandle,
      creator: SITE_CONFIG.twitterHandle,
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: currentUrl,
    },
  }
}

// Generate JSON-LD structured data for articles
export function generateArticleJsonLd({
  post,
  currentUrl,
}: {
  post: BlogPost
  currentUrl: string
}) {
  const authorName = getAuthorDisplayName(post.author)
  const coverImageUrl = getPostImageFromLayout(post.layout)
  const imageUrl = coverImageUrl
    ? coverImageUrl.startsWith('http')
      ? coverImageUrl
      : `${SITE_CONFIG.url}${coverImageUrl}`
    : `${SITE_CONFIG.url}${SITE_CONFIG.defaultImage}`

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.name,
    description: getPostExcerpt(post, { maxLength: 160 }),
    image: imageUrl,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/favicon.png`,
      },
    },
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': currentUrl,
    },
    url: currentUrl,
  }
}

// Generate JSON-LD structured data for website
export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/favicon.png`,
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/news?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export { SITE_CONFIG }

import type { Metadata } from 'next'

export const siteConfig = {
  name: 'Dawan Africa',
  description: 'Uncovering the Continent Through Its Own Lens',
  url: process.env.NODE_ENV === 'production' ? 'https://dawan.africa' : 'http://localhost:3000',
  themeColor: '#2EC6FE',
}

export const sharedMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'Africa',
    'News',
    'Business',
    'Analysis',
    'Dawan Africa',
    'African News',
    'East Africa',
    'Horn of Africa',
    'Politics',
    'Economy',
    'Breaking News',
    'Current Affairs',
    'African Media',
    'Continental News',
    'African Business',
    'African Politics',
    'African Economy',
    'African Society',
    'African Culture',
    'African Development',
    'African Technology',
    'African Healthcare',
    'African Education',
    'African Sports',
    'African Entertainment',
  ],
  generator: 'Next.js',
  applicationName: siteConfig.name,
  referrer: 'origin-when-cross-origin',
  authors: [{ name: 'Dawan Africa', url: siteConfig.url }],
  creator: 'Dawan Africa',
  publisher: 'Dawan Africa',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': '/rss.xml',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - ${siteConfig.description}`,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: ['/og-default.png'],
    creator: '@dawanafrica',
    site: '@dawanafrica',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '84QZctK6dL25aaWZQeIS4z04cFQTcKGTSnyZmMJzcvk',
  },
  category: 'news',
  classification: 'News Website',
  other: {
    'og:site_name': siteConfig.name,
    'application-name': siteConfig.name,
    'apple-mobile-web-app-title': siteConfig.name,
    'msapplication-TileColor': siteConfig.themeColor,
    'theme-color': siteConfig.themeColor,
  },
}

export default siteConfig

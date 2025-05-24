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
    'Markets',
    'Finance',
    'Economics',
    'Business',
    'Investment',
    'Analysis',
    'Dawan Africa',
  ],
  authors: [{ name: 'Dawan Africa' }],
  creator: 'Dawan Africa',
  publisher: 'Dawan Africa',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
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
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: ['/og-default.png'],
    creator: '@dawanafrica',
  },
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
  verification: {
    google: 'google-site-verification-code',
  },
}

export default siteConfig

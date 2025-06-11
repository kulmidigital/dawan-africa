import React, { Suspense } from 'react'
import '../global.css'
import '@/styles/audio-player.css'
import HeaderServer from '@/components/layout/HeaderServer'
import Footer from '@/components/layout/Footer'

import NewsletterPopup from '@/components/NewsletterPopup'
import { Source_Sans_3 } from 'next/font/google'
import { AuthProvider } from '@/hooks/useAuth'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { NavigationProvider } from '@/providers/NavigationProvider'
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext'
import { FloatingAudioPlayer } from '@/components/audio/FloatingAudioPlayer'
import { Toaster } from 'sonner'
import { cn } from '@/lib/utils'
import { Loading } from '@/components/global/Loading'
import type { Metadata, Viewport } from 'next'
import { sharedMetadata } from '@/app/shared-metadata'
import siteConfig from '@/app/shared-metadata'
import { GoogleAnalytics } from '@next/third-parties/google'
import { WebVitals } from '@/hooks/useWebVitals'

const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-source-sans-3',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: sharedMetadata.themeColor,
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  ...sharedMetadata,
  manifest: '/manifest.json',
  verification: {
    google: '84QZctK6dL25aaWZQeIS4z04cFQTcKGTSnyZmMJzcvk',
  },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: siteConfig.name,
    startupImage: [
      {
        url: '/logo.png',
        media:
          '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/logo.png',
        media:
          '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/logo.png',
        media:
          '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/logo.png',
        media:
          '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/logo.png',
        media:
          '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'application-name': siteConfig.name,
    'apple-mobile-web-app-title': siteConfig.name,
    'msapplication-TileColor': '#000000',
    'msapplication-tap-highlight': 'no',
    'msapplication-starturl': '/',
  },
}

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Dawan Africa',
    alternateName: 'Dawan Africa News',
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: 'Uncovering the Continent Through Its Own Lens',
    sameAs: [
      'https://x.com/dawanafrica?s=11&t=cGgYbc_v8C1zcdmiZHSiRg',
      'https://www.facebook.com/share/1DLeMnVa2e/?mibextid=wwXIfr',
      'https://youtube.com/@dawanafrica?si=MeDNmWJDGkFWiF45',
      'https://www.tiktok.com/@dawanafrica?_t=ZS-8wXUI4l8QKX&_r=1',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Editorial',
      email: 'Info@dawan.africa',
      telephone: '+252628881171',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Marinio Rd',
      addressLocality: 'Mogadishu',
      addressCountry: 'Somalia',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Dawan Africa',
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
      },
    },
  }

  const websiteStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Dawan Africa',
    alternateName: 'Dawan Africa News',
    url: siteConfig.url,
    description: 'Uncovering the Continent Through Its Own Lens',
    publisher: {
      '@type': 'Organization',
      name: 'Dawan Africa',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/news?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  // Site Navigation structured data for better sitelinks
  const navigationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'SiteNavigationElement',
    name: 'Dawan Africa Navigation',
    url: siteConfig.url,
    hasPart: [
      {
        '@type': 'SiteNavigationElement',
        name: 'Latest News',
        description: 'Breaking news and current affairs from across Africa',
        url: `${siteConfig.url}/news`,
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Somalia News',
        description: 'Latest news and updates from Somalia',
        url: `${siteConfig.url}/news?search=Somalia&searchField=name`,
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Kenya News',
        description: 'Breaking news and analysis from Kenya',
        url: `${siteConfig.url}/news?search=Kenya&searchField=name`,
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Ethiopia News',
        description: 'Current affairs and news from Ethiopia',
        url: `${siteConfig.url}/news?search=Ethiopia&searchField=name`,
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Business & Finance',
        description: 'African business news, markets, and economic analysis',
        url: `${siteConfig.url}/category/business`,
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Politics',
        description: 'Political news and governance across East Africa',
        url: `${siteConfig.url}/category/politics`,
      },
    ],
  }

  // Breadcrumb List for homepage
  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteConfig.url,
      },
    ],
  }

  return (
    <html lang="en" suppressHydrationWarning className={`scroll-smooth ${sourceSans3.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#2EC6FE" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData).replace(/</g, '\\u003c'),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(navigationStructuredData).replace(/</g, '\\u003c'),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbStructuredData).replace(/</g, '\\u003c'),
          }}
        />
      </head>
      <body className={cn('font-sans', 'min-h-screen flex flex-col bg-gray-50')}>
        <WebVitals />
        <Suspense fallback={<Loading fullScreen={true} message="Loading..." />}>
          <AuthProvider>
            <QueryProvider>
              <NavigationProvider>
                <AudioPlayerProvider>
                  <Toaster richColors position="top-right" />
                  <HeaderServer />
                  <main className="flex-grow">{children}</main>
                  <Footer />
                  <FloatingAudioPlayer />
                  <NewsletterPopup delay={5000} />
                </AudioPlayerProvider>
              </NavigationProvider>
            </QueryProvider>
          </AuthProvider>
        </Suspense>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Service Worker registration successful');
                    },
                    function(err) {
                      console.log('Service Worker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}

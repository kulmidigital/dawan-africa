import React, { Suspense } from 'react'
import '../global.css'
import '@/styles/audio-player.css'
import HeaderServer from '@/components/layout/HeaderServer'
import Footer from '@/components/layout/Footer'
import { Source_Sans_3 } from 'next/font/google'
import { AuthProvider } from '@/hooks/useAuth'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { NavigationProvider } from '@/providers/NavigationProvider'
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext'
import { FloatingAudioPlayer } from '@/components/audio/FloatingAudioPlayer'
import { Toaster } from 'sonner'
import { cn } from '@/lib/utils'
import { Loading } from '@/components/global/Loading'
import { baseMetadata, generateWebsiteJsonLd } from '@/lib/seo'
import ConnectionStatus from '@/components/pwa/ConnectionStatus'

const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-source-sans-3',
  display: 'swap',
})

// Use improved SEO metadata
export const metadata = baseMetadata

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  const websiteJsonLd = generateWebsiteJsonLd()

  return (
    <html lang="en" suppressHydrationWarning className={`scroll-smooth ${sourceSans3.variable}`}>
      <head>
        {/* JSON-LD structured data for website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />

        {/* Standard PWA Meta Tags */}
        <meta name="application-name" content="Dawan Africa" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Dawan Africa" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#2aaac6" />
        <meta name="theme-color" content="#2aaac6" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/favicon.png" />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* DNS prefetch for better performance */}
        <link rel="dns-prefetch" href="//dawan-africa.vercel.app" />
        <link rel="dns-prefetch" href="//utfs.io" />
      </head>
      <body className={cn('font-sans', 'min-h-screen flex flex-col bg-gray-50')}>
        <Suspense fallback={<Loading fullScreen={true} message="Loading..." />}>
          <AuthProvider>
            <QueryProvider>
              <NavigationProvider>
                <AudioPlayerProvider>
                  <Toaster richColors position="top-right" />
                  <ConnectionStatus />
                  <HeaderServer />
                  <main className="flex-grow">{children}</main>
                  <Footer />
                  <FloatingAudioPlayer />
                </AudioPlayerProvider>
              </NavigationProvider>
            </QueryProvider>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  )
}

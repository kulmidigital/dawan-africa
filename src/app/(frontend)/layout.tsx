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
import type { Metadata, Viewport } from 'next'
import { sharedMetadata } from '@/app/shared-metadata'
import siteConfig from '@/app/shared-metadata'

const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-source-sans-3',
  display: 'swap',
})

export function generateViewport(): Viewport {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    colorScheme: 'light dark',
    themeColor:'#FFFFFF',
  }
}

export const metadata: Metadata = {
  ...sharedMetadata,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: siteConfig.name,
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#FFFFFF',
    'msapplication-tap-highlight': 'no',
  },
}

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`scroll-smooth ${sourceSans3.variable}`}>
      <body className={cn('font-sans', 'min-h-screen flex flex-col bg-gray-50')}>
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
                </AudioPlayerProvider>
              </NavigationProvider>
            </QueryProvider>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  )
}

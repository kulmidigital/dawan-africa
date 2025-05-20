import React, { Suspense } from 'react'
import '../global.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Source_Sans_3 } from 'next/font/google'
import { AuthProvider } from '@/hooks/useAuth'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { NavigationProvider } from '@/providers/NavigationProvider'
import { Toaster } from 'sonner'
import { cn } from '@/lib/utils'
import { Loading } from '@/components/global/Loading'

const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-source-sans-3',
  display: 'swap',
})

export const metadata = {
  description: 'Uncovering the Continent — Through Its Own Lens',
  title: 'Uncovering the Continent — Through Its Own Lens',
  icons: {
    icon: '/favicon.png',
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
                <Toaster richColors position="top-right" />
                <Header />
                <main className="flex-grow">{children}</main>
                <Footer />
              </NavigationProvider>
            </QueryProvider>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  )
}

import React from 'react'
import '../global.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Source_Sans_3 } from 'next/font/google'

const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-source-sans-3',
  display: 'swap',
})

export const metadata = {
  description: 'Uncovering the Continent — Through Its Own Lens',
  title: 'Uncovering the Continent — Through Its Own Lens',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" className={`scroll-smooth ${sourceSans3.variable}`}>
      <body className="min-h-screen flex flex-col bg-gray-50 font-sans">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  )
}

import React from 'react'
import '../global.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata = {
  description: 'Uncovering the Continent — Through Its Own Lens',
  title: 'Uncovering the Continent — Through Its Own Lens',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  )
}

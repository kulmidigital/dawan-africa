'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BiChevronRight, BiHome } from 'react-icons/bi'
import { siteConfig } from '@/app/shared-metadata'

interface BreadcrumbItem {
  name: string
  href: string
}

interface BreadcrumbsProps {
  customItems?: BreadcrumbItem[]
  className?: string
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ customItems, className = '' }) => {
  const pathname = usePathname()

  // Generate breadcrumbs from pathname if no custom items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) return customItems

    const pathSegments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Home', href: '/' }
    ]

    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      
      // Capitalize and clean up segment names
      let name = segment.charAt(0).toUpperCase() + segment.slice(1)
      
      // Handle special cases
      if (segment === 'news') name = 'Latest News'
      if (segment === 'category') name = 'Categories'
      if (segment === 'about') name = 'About Us'
      
      breadcrumbs.push({
        name,
        href: currentPath
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  // Generate structured data for search engines
  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.href}`,
    })),
  }

  // Don't show breadcrumbs on homepage
  if (pathname === '/') return null

  return (
    <>
      {/* Structured Data for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData).replace(/</g, '\\u003c'),
        }}
      />
      
      {/* Visual Breadcrumbs */}
      <nav 
        className={`bg-gray-50 border-b border-gray-200 ${className}`}
        aria-label="Breadcrumb"
      >
        <div className="container mx-auto px-4 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((item, index) => (
              <li key={item.href} className="flex items-center">
                {index > 0 && (
                  <BiChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                )}
                
                {index === 0 && (
                  <BiHome className="w-4 h-4 text-gray-500 mr-1" />
                )}
                
                {index === breadcrumbs.length - 1 ? (
                  // Last item (current page) - not a link
                  <span className="text-gray-900 font-medium">{item.name}</span>
                ) : (
                  // Breadcrumb links
                  <Link
                    href={item.href}
                    className="text-gray-500 hover:text-[#2aaac6] transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </>
  )
}

export default Breadcrumbs 
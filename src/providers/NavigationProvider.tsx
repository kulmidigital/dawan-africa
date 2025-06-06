'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Loading } from '@/components/global/Loading'

interface NavigationContextType {
  isLoading: boolean
  startLoading: (target?: string) => void
  stopLoading: () => void
}

const NavigationContext = createContext<NavigationContextType>({
  isLoading: false,
  startLoading: () => {},
  stopLoading: () => {},
})

export const useNavigation = () => useContext(NavigationContext)

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [navigationTarget, setNavigationTarget] = useState<string | null>(null)

  // Start loading with optional target name
  const startLoading = (target?: string) => {
    setIsLoading(true)
    if (target) {
      setNavigationTarget(target)
    }
  }

  // Stop loading
  const stopLoading = () => {
    setIsLoading(false)
    setNavigationTarget(null)
  }

  // Handle client-side navigation
  useEffect(() => {
    // Function to handle link clicks
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const link = target.closest('a') as HTMLAnchorElement

      if (
        link &&
        link.href &&
        link.href.startsWith(window.location.origin) &&
        !link.getAttribute('target') &&
        !link.getAttribute('download') &&
        !link.classList.contains('no-transition') &&
        !event.ctrlKey &&
        !event.metaKey
      ) {
        // Check if it's an article link (going to news pages)
        const isNewsLink = link.href.includes('/news/') && !link.href.endsWith('/news/')

        // Use data attributes if available
        const articleId = link.getAttribute('data-article-id')
        const articleSlug = link.getAttribute('data-article-slug')
        const articleTitle = link.getAttribute('aria-label')?.replace('Read article: ', '')

        if (isNewsLink || articleId || articleSlug) {
          setIsLoading(true)

          // Set the navigation target with priority:
          // 1. Article title from aria-label if available
          // 2. Article slug from data-attribute or URL
          // 3. Generic "article" message
          if (articleTitle) {
            setNavigationTarget(articleTitle)
          } else if (articleSlug) {
            setNavigationTarget(articleSlug.replace(/-/g, ' '))
          } else {
            // Extract from URL as last resort
            const urlSlug = link.href.split('/news/')[1]?.split('?')[0] || null
            if (urlSlug) {
              setNavigationTarget(urlSlug.replace(/-/g, ' '))
            } else {
              setNavigationTarget(null)
            }
          }
        }
      }
    }

    // Add event listener
    document.addEventListener('click', handleLinkClick)

    // Clean up
    return () => {
      document.removeEventListener('click', handleLinkClick)
    }
  }, [])

  // Reset loading state when the path or search params change
  useEffect(() => {
    setIsLoading(false)
    setNavigationTarget(null)
  }, [pathname, searchParams])

  return (
    <NavigationContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      {isLoading && <Loading fullScreen message="Loading..." />}
    </NavigationContext.Provider>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * A hook that helps components manually trigger loading states during navigation
 */
export function useNavigationLoading() {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const [targetPath, setTargetPath] = useState<string | null>(null)

  // Programmatically navigate with loading state
  const navigateTo = (path: string, options?: { showLoading?: boolean; targetName?: string }) => {
    const { showLoading = true, targetName = null } = options || {}
    
    if (showLoading) {
      setIsNavigating(true)
      setTargetPath(targetName || path.split('/').pop() || null)
      
      // Give time for loading state to appear before navigation
      setTimeout(() => {
        router.push(path)
      }, 100)
    } else {
      // Navigate immediately without loading state
      router.push(path)
    }
  }

  return {
    isNavigating,
    targetPath,
    navigateTo,
    setIsNavigating,
  }
} 
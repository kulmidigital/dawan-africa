'use client'

import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
  FC,
} from 'react'
import { useRouter } from 'next/navigation'
import { User as PayloadUser } from '@/payload-types'

interface AuthContextType {
  user: PayloadUser | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
  error: string | null
  fetchUser: () => Promise<void> // Exposed to allow manual refresh if needed
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PayloadUser | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Start true to load initial user
  const [error, setError] = useState<string | null>(null)
  const router = useRouter() // Get router instance

  const fetchUser = useCallback(async (isInitialLoad = false) => {
    if (!isInitialLoad) setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/users/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      })
      if (response.ok) {
        const data = await response.json()
        setUser(data.user || null)
      } else {
        setUser(null)
      }
    } catch (e) {
      console.error('Fetch user error:', e)
      setUser(null)
      // setError('Failed to fetch user details.'); // Optional: set error for user feedback
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser(true) // Fetch user on initial mount
  }, [fetchUser])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (response.ok) {
        // setUser(data.user) // Temporarily remove direct setUser here
        await fetchUser() // Call fetchUser to re-fetch and set user state after successful login
        // fetchUser will call setIsLoading(false) internally at its end
        // but login itself should also manage its isLoading state for the duration of the login process.
        // The user variable available to consumers will be updated by fetchUser.
        return true
      } else {
        setError(data.message || 'Login failed. Please check your credentials.')
        setUser(null)
        return false
      }
    } catch (e) {
      console.error('Login error:', e)
      setError('An unexpected error occurred during login.')
      setUser(null)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      })
      if (response.ok) {
        setUser(null)
        // No need to router.push here, Header/pages will react to user becoming null
      } else {
        const data = await response.json()
        setError(data.message || 'Logout failed.')
      }
    } catch (e) {
      console.error('Logout error:', e)
      setError('An unexpected error occurred during logout.')
    } finally {
      setIsLoading(false)
    }
  }

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    error,
    fetchUser,
  }

  // Using React.createElement to avoid JSX parsing issues
  return React.createElement(AuthContext.Provider, { value: contextValue }, children)
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

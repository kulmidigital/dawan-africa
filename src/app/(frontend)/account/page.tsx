'use client'

import React, { useEffect, useState, Suspense, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { User as PayloadUser } from '@/payload-types'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserProfile } from '@/components/account/UserProfile'
import { UserPosts } from '@/components/account/UserPosts'
import { UserSettings } from '@/components/account/UserSettings'
import { UserBio } from '@/components/account/UserBio'

// Inner component to handle all client-side logic
function AccountPageClientBoundary() {
  const [user, setUser] = useState<PayloadUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const router = useRouter()

  const fetchUser = useCallback(async () => {
    setLoading(true)
    setShouldRedirect(false)
    try {
      const response = await fetch('/api/users/me?depth=2')
      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setUser(data.user)
        } else {
          setShouldRedirect(true)
        }
      } else {
        setShouldRedirect(true)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      setShouldRedirect(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    if (shouldRedirect) {
      router.push('/login?redirect=/account')
    }
  }, [shouldRedirect, router])

  const handleUserUpdate = (updatedUser: PayloadUser) => {
    setUser(updatedUser)
  }

  if (loading) {
    return (
      <div className="bg-white min-h-screen py-6">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div>
                <Skeleton className="h-6 w-36 mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <Skeleton className="h-10 w-full rounded-md" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-64 rounded-md" />
              <Skeleton className="h-64 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user && !loading) {
    return (
      <div className="bg-white min-h-screen py-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">User not found. Redirecting...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-white min-h-screen py-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Session expired or user not found. Please log in.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto max-w-6xl px-4 py-6">
        <UserBio user={user} onUpdate={handleUserUpdate} />

        <div className="mt-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="bg-white border border-slate-200 rounded-md p-1 mb-4 max-w-full overflow-x-auto md:overflow-visible">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-slate-50 data-[state=active]:text-slate-800 text-sm whitespace-nowrap"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="posts"
                className="data-[state=active]:bg-slate-50 data-[state=active]:text-slate-800 text-sm whitespace-nowrap"
              >
                Content
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-slate-50 data-[state=active]:text-slate-800 text-sm whitespace-nowrap"
              >
                Account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-0">
              <UserProfile user={user} onUpdate={handleUserUpdate} />
            </TabsContent>

            <TabsContent value="posts" className="mt-0">
              <UserPosts user={user} />
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <UserSettings user={user} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

const AccountPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
          <div className="animate-pulse text-slate-500 text-sm">Loading account details...</div>
        </div>
      }
    >
      <AccountPageClientBoundary />
    </Suspense>
  )
}

export default AccountPage

'use client'

import React, { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAuth } from '@/hooks/useAuth'
import { CheckCircle2 } from 'lucide-react'

// New inner component to handle client-side logic dependent on searchParams
function LoginClientBoundary() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && user) {
      const redirectTo = searchParams.get('redirect_to') ?? '/'
      router.replace(redirectTo)
    }
  }, [user, authLoading, router, searchParams])

  const registered = searchParams.get('registered')

  if (authLoading || (!authLoading && user)) {
    // Show a loading state or null while checking auth/redirecting
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-pulse text-slate-500 text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <>
      {registered && (
        <div className="bg-green-50 border border-green-100 text-green-700 p-4 mb-6 max-w-md mx-auto rounded-md shadow-sm flex items-center">
          <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 text-green-500" />
          <p className="text-sm">Registration successful! Please sign in.</p>
        </div>
      )}
      <LoginForm />
    </>
  )
}

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-12 pt-16 sm:pt-24">
      <Suspense
        fallback={
          <div className="flex items-center justify-center flex-grow">
            <div className="animate-pulse text-slate-500 text-sm">Loading page content...</div>
          </div>
        }
      >
        <LoginClientBoundary />
      </Suspense>
    </div>
  )
}

'use client'

import React, { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, KeyRound } from 'lucide-react'

export const LoginForm: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isLoading, error } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const redirectTo = searchParams.get('redirect_to') ?? '/'
    const success = await login(email, password)

    if (success) {
      router.push(redirectTo)
    }
  }

  return (
    <div className="mx-auto max-w-md w-full px-4 sm:px-0">
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-white space-y-1 pb-6">
          <CardTitle className="text-2xl font-semibold text-slate-900 text-center">
            Sign In
          </CardTitle>
          <CardDescription className="text-slate-500 text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="bg-white pt-2 pb-8 px-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="email-address" className="text-sm font-medium text-slate-700">
                Email Address
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <Input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="pl-10 bg-white border-slate-200 focus:border-[#2aaac6] focus:ring-[#2aaac6]/10 text-sm"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[#2aaac6] hover:text-[#238da1]"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <KeyRound className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="pl-10 bg-white border-slate-200 focus:border-[#2aaac6] focus:ring-[#2aaac6]/10 text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">{error}</div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-[#2aaac6] hover:bg-[#238da1] shadow-sm transition-colors text-sm"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-medium text-[#2aaac6] hover:text-[#238da1]">
                Create account
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

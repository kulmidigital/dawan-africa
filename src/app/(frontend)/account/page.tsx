import { Suspense } from 'react'
import AccountPageClient from '@/components/account/AccountPageClient' 
export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
          <p className="animate-pulse text-slate-500 text-sm">Loading account details…</p>
        </div>
      }
    >
      {/* Client component lives under a Suspense boundary, so RSC guard is satisfied */}
      <AccountPageClient />
    </Suspense>
  )
}

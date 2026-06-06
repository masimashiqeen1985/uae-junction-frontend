// /my-account — Customer Account Hub (Phase 4).
// Server component: auth() decides the variant server-side (no client flash).
// Signed out → AuthPanel (Sign In / Create Account). Signed in → dashboard.
// noindex: account pages must never be indexed.
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { auth, authProviderFlags } from '@/auth'
import { AccountGate } from '@/components/account/AccountGate'

export const metadata: Metadata = {
  title: 'My Account',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function MyAccountPage() {
  // auth() is safe even when AUTH_SECRET is absent at build/runtime — we gate
  // on authProviderFlags.configured and never call it unconfigured.
  const session = authProviderFlags.configured ? await auth() : null
  return (
    // Suspense: AuthPanel/AccountDashboard use useSearchParams (deep-link tabs).
    <Suspense fallback={<div className="container-xl py-20" aria-busy="true" />}>
      <AccountGate
        session={session}
        configured={authProviderFlags.configured}
        providers={{ google: authProviderFlags.google, facebook: authProviderFlags.facebook }}
      />
    </Suspense>
  )
}

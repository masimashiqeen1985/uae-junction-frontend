// Shared account shell — Phase 5. Wraps the /my-account sub-pages only
// (orders / profile / rewards) via the (sub) route group, so the Phase-4 hub
// keeps its exact presentation. Server-side guard: signed-out visitors are
// redirected to /my-account BEFORE any personal data is fetched — no flash of
// private chrome, no client-side gate.
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth, authProviderFlags } from '@/auth'
import { AccountNav } from '@/components/account/AccountNav'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

// Personal data everywhere below — always render at request time.
export const dynamic = 'force-dynamic'

export default async function AccountSubLayout({ children }: { children: React.ReactNode }) {
  const session = authProviderFlags.configured ? await auth() : null
  if (!session?.user) redirect('/my-account')

  return (
    <div className="bg-neutral-50/70">
      <div className="container-xl py-8 md:py-12">
        <div className="grid gap-6 md:grid-cols-[224px_minmax(0,1fr)] md:gap-8 lg:grid-cols-[252px_minmax(0,1fr)]">
          <AccountNav name={session.user.name ?? null} email={session.user.email ?? null} />
          {/* Content pane (root layout owns the <main> landmark) */}
          <div id="account-content" className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  )
}

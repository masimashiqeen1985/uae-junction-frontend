// /my-account/profile — Profile editing (Phase 5, sub-page 2 of 3).
// Server component prefills the form from the bearer's own customer record
// (customerFetch — token never reaches the browser, nothing cached).
import type { Metadata } from 'next'
import { customerFetch } from '@/lib/account/api'
import { GET_CUSTOMER_PROFILE, type CustomerProfile } from '@/lib/queries/customer'
import { ProfileForm } from '@/components/account/ProfileForm'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Profile',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function ProfilePageRoute() {
  const result = await customerFetch<{ customer: CustomerProfile | null }>(GET_CUSTOMER_PROFILE)
  const customer = result.ok ? result.data.customer : null

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-secondary sm:text-3xl">Profile</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Keep your details up to date — we use them for booking confirmations and payment matching.
        </p>
      </header>

      {customer ? (
        <div className="grid gap-6">
          {/* Read-only account card */}
          <section aria-label="Account" className="rounded-card bg-white p-5 shadow-card sm:p-6">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Account email</dt>
                <dd className="mt-1 font-semibold text-secondary">{customer.email}</dd>
              </div>
              {customer.date && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Member since</dt>
                  <dd className="mt-1 font-semibold text-secondary">{formatDate(customer.date)}</dd>
                </div>
              )}
            </dl>
          </section>

          <ProfileForm
            initial={{
              firstName: customer.firstName ?? '',
              lastName: customer.lastName ?? '',
              email: customer.email ?? '',
              phone: customer.billing?.phone ?? '',
              country: customer.billing?.country ?? 'AE',
            }}
          />
        </div>
      ) : (
        <div className="rounded-card bg-white p-10 text-center shadow-card">
          <p className="font-display text-lg font-bold text-secondary">We couldn’t load your profile right now</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
            Please refresh in a moment — your details are safe, we just couldn’t reach them.
          </p>
        </div>
      )}
    </div>
  )
}

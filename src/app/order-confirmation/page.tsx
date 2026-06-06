// Phase-2 stub of the order confirmation page — minimal but polished so the
// funnel is never dead-ended. Phase 3 upgrades this to the full confirmation
// experience (order readback, line items, email confirmation, etc.).
import type { Metadata } from 'next'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Booking Received',
  robots: { index: false, follow: false },
}

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; total?: string }>
}) {
  const { ref, total } = await searchParams
  const safeRef = (ref || '').replace(/[^0-9A-Za-z-]/g, '').slice(0, 20)
  const amount = total ? `AED ${formatPrice(total)}` : null

  if (!safeRef) {
    return (
      <div className="container-xl py-20 text-center">
        <h1 className="font-display font-bold text-3xl text-secondary mb-3">No booking found</h1>
        <p className="text-neutral-500 mb-8">We couldn&apos;t find a booking reference. If you just placed a booking, check your email.</p>
        <Link href="/" className="inline-block rounded-btn bg-primary px-8 py-3.5 font-semibold text-white hover:bg-primary-dark focus-ring">
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <div className="container-xl py-12 lg:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-card bg-white p-8 shadow-card text-center">
          <div aria-hidden="true" className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-600"><path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h1 className="font-display font-bold text-3xl text-secondary mb-2">Booking received!</h1>
          <p className="text-neutral-600 mb-6">
            Your experiences are reserved. Your pre-booking reference is
          </p>
          <p className="mb-2 font-display text-4xl font-bold tracking-wide text-primary" aria-label={`Pre-booking reference ${safeRef}`}>
            #{safeRef}
          </p>
          {amount && <p className="text-neutral-500">Amount due: <span className="font-semibold text-secondary">{amount}</span></p>}
        </div>

        <div className="mt-8 rounded-card bg-white p-8 shadow-card">
          <h2 className="font-display font-semibold text-lg text-secondary mb-4">How to complete your booking</h2>
          <ol className="list-none space-y-4 text-sm text-neutral-600">
            <li className="flex gap-3">
              <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">1</span>
              Transfer the total amount to our company bank account. Our team will send you the account details by email and WhatsApp.
            </li>
            <li className="flex gap-3">
              <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">2</span>
              Use your reference <strong className="text-secondary">#{safeRef}</strong> as the payment reference so we can match your transfer instantly.
            </li>
            <li className="flex gap-3">
              <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">3</span>
              Once your payment is received, we confirm your booking and email your invoice and tickets.
            </li>
          </ol>
          <p className="mt-6 text-sm text-neutral-500">
            Questions or faster help?{' '}
            <a href="https://wa.me/971585898221" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline focus-ring">
              WhatsApp us at +971 58 589 8221
            </a>
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="inline-block rounded-btn bg-primary px-8 py-3.5 font-semibold text-white hover:bg-primary-dark focus-ring">
            Continue exploring
          </Link>
        </div>
      </div>
    </div>
  )
}

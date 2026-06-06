// Phase 3 — full order confirmation page. Server shell only: metadata +
// Suspense boundary (required for useSearchParams). All rendering is client-
// side from the opaque ref + sessionStorage snapshot — nothing sensitive is
// read or fetched on the server, and the page is never indexed.
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { OrderConfirmation } from '@/components/checkout/OrderConfirmation'

export const metadata: Metadata = {
  title: 'Booking Confirmed',
  robots: { index: false, follow: false },
}

export default function OrderConfirmationPage() {
  return (
    <div className="container-xl py-12 lg:py-16">
      <Suspense
        fallback={
          <div className="py-24 text-center text-neutral-500" role="status" aria-live="polite">
            Loading your booking…
          </div>
        }
      >
        <OrderConfirmation />
      </Suspense>
    </div>
  )
}

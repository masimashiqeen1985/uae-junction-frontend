import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
}

const STEPS = [
  { label: 'Cart', state: 'done' },
  { label: 'Details & payment', state: 'current' },
  { label: 'Confirmation', state: 'todo' },
] as const

export default function CheckoutPage() {
  return (
    <div className="container-xl py-12 lg:py-16">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-neutral-500">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-primary focus-ring">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/cart" className="hover:text-primary focus-ring">Cart</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-semibold text-secondary">Checkout</li>
        </ol>
      </nav>

      <h1 className="font-display font-bold text-3xl text-secondary mb-6">Checkout</h1>

      <ol aria-label="Booking progress" className="mb-10 flex items-center gap-3 text-sm">
        {STEPS.map((s, i) => (
          <li key={s.label} className="flex items-center gap-3">
            <span
              aria-current={s.state === 'current' ? 'step' : undefined}
              className={
                s.state === 'done'
                  ? 'flex items-center gap-1.5 font-semibold text-emerald-600'
                  : s.state === 'current'
                    ? 'rounded-full bg-primary px-3 py-1 font-semibold text-white'
                    : 'text-neutral-400'
              }
            >
              {s.state === 'done' && (
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z"/></svg>
              )}
              {s.label}
            </span>
            {i < STEPS.length - 1 && <span aria-hidden="true" className="text-neutral-300">→</span>}
          </li>
        ))}
      </ol>

      <CheckoutForm />
    </div>
  )
}

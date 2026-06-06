'use client'
// Signed-in /my-account dashboard — greeting hero, card grid, deep-link tabs.
// Customer/orders data is fetched DEFERRED via /api/account/me (skeleton
// loaders, no layout shift); the WP token never reaches the browser.
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  CalendarCheck, Wallet, UserRound, MessageCircle, LogOut, ChevronRight,
} from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import type { CustomerData, CustomerOrderNode } from '@/lib/queries/customer'

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending payment',
  ON_HOLD: 'Awaiting confirmation',
  PROCESSING: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
  FAILED: 'Failed',
}

function OrderRow({ o }: { o: CustomerOrderNode }) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-btn bg-neutral-50 px-3 py-2.5">
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-neutral-800">
          Booking #{o.orderNumber || o.databaseId}
        </span>
        <span className="block text-xs text-neutral-500">
          {o.date ? formatDate(o.date) : ''}{o.status ? ` · ${STATUS_LABEL[o.status] || o.status}` : ''}
        </span>
      </span>
      {o.total && <span className="shrink-0 text-sm font-bold text-secondary">AED {formatPrice(o.total)}</span>}
    </li>
  )
}

function Card({
  id, icon, title, children, highlight,
}: {
  id?: string
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  highlight?: boolean
}) {
  return (
    <section
      id={id}
      tabIndex={-1}
      aria-label={title}
      className={`rounded-card bg-white p-6 shadow-card outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary/60 ${
        highlight ? 'ring-2 ring-primary/50' : ''
      }`}
    >
      <h2 className="font-display mb-4 flex items-center gap-2.5 text-lg font-bold text-secondary">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-primary">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Skeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div aria-hidden className="grid gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <span key={i} className="block h-10 animate-pulse rounded-btn bg-neutral-100" />
      ))}
    </div>
  )
}

export function AccountDashboard({ name, email }: { name: string | null; email: string | null }) {
  const search = useSearchParams()
  const reduce = useReducedMotion()
  const [customer, setCustomer] = useState<CustomerData | null>(null)
  const [loading, setLoading] = useState(true)
  const focused = useRef(false)

  const tab = search.get('tab') // bookings | rewards | null

  useEffect(() => {
    let alive = true
    fetch('/api/account/me')
      .then((r) => r.json())
      .then((j) => { if (alive) setCustomer(j?.customer ?? null) })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  // Deep-link: scroll + focus the matching card (header dropdown emits these).
  useEffect(() => {
    if (!tab || focused.current) return
    const id = tab === 'bookings' ? 'card-bookings' : tab === 'rewards' ? 'card-rewards' : null
    if (!id) return
    const el = document.getElementById(id)
    if (el) {
      focused.current = true
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
      el.focus({ preventScroll: true })
    }
  }, [tab, reduce])

  const firstName = (customer?.firstName || name?.split(' ')[0] || 'Traveller').trim()
  const orders = customer?.orders?.nodes ?? []

  return (
    <div className="bg-neutral-50/70">
      {/* Hero strip */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50">
        <div className="container-xl flex flex-wrap items-center justify-between gap-4 py-10 sm:py-12">
          <div>
            <h1 className="font-display text-3xl font-bold text-secondary">Welcome back, {firstName}</h1>
            <p className="mt-1 text-sm text-neutral-500">{customer?.email || email || ''}</p>
          </div>
          <span className="pill-cash" aria-label="Cashback rate">2.5% cashback on every booking</span>
        </div>
      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="container-xl grid gap-6 py-10 sm:grid-cols-2"
      >
        {/* My Bookings */}
        <Card id="card-bookings" icon={<CalendarCheck className="h-4.5 w-4.5" aria-hidden />} title="My bookings" highlight={tab === 'bookings'}>
          {loading ? (
            <Skeleton rows={3} />
          ) : orders.length > 0 ? (
            <ul className="grid gap-2">{orders.map((o) => <OrderRow key={o.databaseId} o={o} />)}</ul>
          ) : (
            <p className="rounded-btn bg-neutral-50 px-4 py-5 text-center text-sm text-neutral-500">
              Your bookings will appear here once you make your first one — let’s plan something unforgettable.
            </p>
          )}
          <Link href="/category/theme-parks" className="focus-ring mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            Explore experiences <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </Card>

        {/* Cashback & Rewards */}
        <Card id="card-rewards" icon={<Wallet className="h-4.5 w-4.5" aria-hidden />} title="Cashback & rewards" highlight={tab === 'rewards'}>
          <p className="text-sm leading-relaxed text-neutral-600">
            You earn <strong className="text-secondary">2.5% cashback</strong> on every booking. Cashback is pending
            until your first purchase is completed, then it lands in your wallet automatically.
          </p>
          <p className="mt-2 text-xs text-neutral-400">Live wallet balance is coming to this page soon.</p>
          <Link href="/rewards-policy" className="focus-ring mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            Read the rewards policy <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </Card>

        {/* Profile */}
        <Card icon={<UserRound className="h-4.5 w-4.5" aria-hidden />} title="Profile">
          {loading ? (
            <Skeleton rows={2} />
          ) : (
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between gap-3 rounded-btn bg-neutral-50 px-3 py-2.5">
                <dt className="text-neutral-500">Name</dt>
                <dd className="font-semibold text-neutral-800">
                  {[customer?.firstName, customer?.lastName].filter(Boolean).join(' ') || name || '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-3 rounded-btn bg-neutral-50 px-3 py-2.5">
                <dt className="text-neutral-500">Email</dt>
                <dd className="truncate font-semibold text-neutral-800">{customer?.email || email || '—'}</dd>
              </div>
            </dl>
          )}
          <p className="mt-3 text-xs text-neutral-400">Profile editing is coming soon.</p>
        </Card>

        {/* Need help? */}
        <Card icon={<MessageCircle className="h-4.5 w-4.5" aria-hidden />} title="Need help?">
          <p className="text-sm leading-relaxed text-neutral-600">
            Questions about a booking, payment or cashback? Our team replies fast on WhatsApp.
          </p>
          <a
            href="https://wa.me/971585898221"
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring mt-4 inline-flex items-center gap-2 rounded-btn bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            <MessageCircle className="h-4 w-4" aria-hidden /> Chat on WhatsApp
          </a>
        </Card>
      </motion.div>

      <div className="container-xl pb-12">
        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: '/' })}
          className="focus-ring inline-flex items-center gap-2 rounded-btn px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" aria-hidden /> Sign out
        </button>
      </div>
    </div>
  )
}

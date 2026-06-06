'use client'
// Bookings list — Phase 5. Order cards with friendly status pills, an
// accessible in-place detail accordion (no ID routes — detail renders from
// the already-owned list payload), cursor "Load more" pagination, and a
// WhatsApp payment CTA on awaiting-payment bookings.
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import {
  CalendarCheck, ChevronDown, Clock4, CheckCircle2, XCircle, RotateCcw,
  MessageCircle, Repeat2, Loader2,
} from 'lucide-react'
import { cn, formatPrice, formatDate } from '@/lib/utils'
import type { CustomerOrderFull } from '@/lib/queries/customer'

type PageInfo = { hasNextPage: boolean; endCursor: string | null }

/* Friendly, semantic status presentation — never raw Woo strings. */
const STATUS: Record<string, { label: string; cls: string; icon: typeof Clock4 }> = {
  PENDING:    { label: 'Awaiting payment', cls: 'bg-amber-50 text-amber-700', icon: Clock4 },
  ON_HOLD:    { label: 'Awaiting payment', cls: 'bg-amber-50 text-amber-700', icon: Clock4 },
  PROCESSING: { label: 'Confirmed', cls: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  COMPLETED:  { label: 'Completed', cls: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  CANCELLED:  { label: 'Cancelled', cls: 'bg-red-50 text-red-600', icon: XCircle },
  FAILED:     { label: 'Payment failed', cls: 'bg-red-50 text-red-600', icon: XCircle },
  REFUNDED:   { label: 'Refunded', cls: 'bg-neutral-100 text-neutral-600', icon: RotateCcw },
}
const AWAITING = new Set(['PENDING', 'ON_HOLD'])
const EARNING = new Set(['PROCESSING', 'COMPLETED'])

function StatusPill({ status }: { status: string | null }) {
  const s = (status && STATUS[status]) || { label: 'Processing', cls: 'bg-neutral-100 text-neutral-600', icon: Clock4 }
  const Icon = s.icon
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold', s.cls)}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {s.label}
    </span>
  )
}

const aed = (s?: string | null) => (s ? `AED ${formatPrice(s)}` : '')
const num = (s?: string | null) => {
  const n = parseFloat(formatPrice(s ?? undefined).replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}
const money = (n: number) => `AED ${n.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function whatsAppHref(o: CustomerOrderFull) {
  const text = `Hi! I'd like to complete payment for my booking #${o.orderNumber || o.databaseId} (${aed(o.total)}). Sending the transfer receipt here.`
  return `https://wa.me/971585898221?text=${encodeURIComponent(text)}`
}

function OrderCard({ order }: { order: CustomerOrderFull }) {
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  const items = order.lineItems?.nodes ?? []
  const first = items[0]?.product?.node
  const detailId = `order-detail-${order.databaseId}`
  const awaiting = AWAITING.has(order.status ?? '')
  // Canonical sitewide rate since 2026-06-07: 2.5% cashback.
  const cashback = +(num(order.total) * 0.025).toFixed(2)

  return (
    <li className="overflow-hidden rounded-card bg-white shadow-card">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={detailId}
        onClick={() => setOpen((v) => !v)}
        className="focus-ring flex w-full items-center gap-4 p-4 text-left sm:p-5"
      >
        {/* Thumbnail */}
        <span className="relative hidden h-16 w-16 shrink-0 overflow-hidden rounded-btn bg-neutral-100 sm:block" aria-hidden>
          {first?.image?.sourceUrl ? (
            <Image src={first.image.sourceUrl} alt="" fill className="object-cover" sizes="64px" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-neutral-300">
              <CalendarCheck className="h-6 w-6" />
            </span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-display text-base font-bold text-secondary">
              Booking #{order.orderNumber || order.databaseId}
            </span>
            <StatusPill status={order.status} />
          </span>
          <span className="mt-1 block truncate text-sm text-neutral-500">
            {order.date ? `${formatDate(order.date)} · ` : ''}
            {first?.name || 'Experience booking'}
            {items.length > 1 ? ` +${items.length - 1} more` : ''}
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block font-display text-base font-bold text-secondary">{aed(order.total)}</span>
          <ChevronDown
            aria-hidden
            className={cn('ml-auto mt-1 h-4 w-4 text-neutral-400 transition-transform', open && 'rotate-180')}
          />
        </span>
      </button>

      {open && (
        <motion.div
          id={detailId}
          role="region"
          aria-label={`Booking ${order.orderNumber || order.databaseId} details`}
          initial={reduce ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="border-t border-neutral-100"
        >
          <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[1fr_260px]">
            {/* Line items */}
            <ul className="grid gap-3">
              {items.length > 0 ? items.map((li, i) => {
                const p = li.product?.node
                return (
                  <li key={i} className="flex items-center gap-3 rounded-btn bg-neutral-50 p-3">
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-btn bg-neutral-100" aria-hidden>
                      {p?.image?.sourceUrl && (
                        <Image src={p.image.sourceUrl} alt="" fill className="object-cover" sizes="48px" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-neutral-800">{p?.name || 'Experience'}</span>
                      <span className="block text-xs text-neutral-500">Qty {li.quantity ?? 1}</span>
                    </span>
                    <span className="shrink-0 text-sm font-bold text-secondary">{aed(li.total)}</span>
                    {p?.slug && (
                      <Link
                        href={`/product/${p.slug}`}
                        className="focus-ring hidden shrink-0 items-center gap-1 rounded-btn px-2 py-1 text-xs font-semibold text-primary hover:underline sm:inline-flex"
                      >
                        <Repeat2 className="h-3.5 w-3.5" aria-hidden /> Book again
                      </Link>
                    )}
                  </li>
                )
              }) : (
                <li className="rounded-btn bg-neutral-50 p-4 text-sm text-neutral-500">
                  Item details aren’t available for this booking — our team can resend them on WhatsApp.
                </li>
              )}
            </ul>

            {/* Totals + actions */}
            <div className="rounded-btn bg-neutral-50 p-4">
              <dl className="space-y-2 text-sm">
                {order.subtotal && (
                  <div className="flex justify-between text-neutral-600">
                    <dt>Subtotal</dt><dd>{aed(order.subtotal)}</dd>
                  </div>
                )}
                {order.paymentMethodTitle && (
                  <div className="flex justify-between text-neutral-600">
                    <dt>Payment</dt><dd className="text-right">{order.paymentMethodTitle}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-neutral-200 pt-2">
                  <dt className="font-display font-bold text-secondary">Total</dt>
                  <dd className="font-display font-bold text-primary">{aed(order.total)}</dd>
                </div>
                {cashback > 0 && order.status && (EARNING.has(order.status) || AWAITING.has(order.status)) && (
                  <div className="flex items-center justify-between rounded-btn bg-emerald-50 px-2.5 py-1.5 text-xs text-emerald-700">
                    <dt className="font-semibold">
                      2.5% cashback {order.status === 'COMPLETED' ? '· credited' : '· pending'}
                    </dt>
                    <dd className="font-bold">{money(cashback)}</dd>
                  </div>
                )}
              </dl>
              {awaiting && (
                <a
                  href={whatsAppHref(order)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring mt-4 inline-flex w-full items-center justify-center gap-2 rounded-btn bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  Pay now / send receipt
                </a>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </li>
  )
}

function SkeletonCards({ count = 2 }: { count?: number }) {
  return (
    <ul aria-hidden className="grid gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="h-24 animate-pulse rounded-card bg-white shadow-card" />
      ))}
    </ul>
  )
}

export function OrdersList({
  initialOrders, initialPageInfo, loadError,
}: {
  initialOrders: CustomerOrderFull[]
  initialPageInfo: PageInfo
  loadError?: boolean
}) {
  const reduce = useReducedMotion()
  const [orders, setOrders] = useState(initialOrders)
  const [pageInfo, setPageInfo] = useState(initialPageInfo)
  const [loadingMore, setLoadingMore] = useState(false)
  const [moreError, setMoreError] = useState(false)

  async function loadMore() {
    if (loadingMore || !pageInfo.hasNextPage || !pageInfo.endCursor) return
    setLoadingMore(true)
    setMoreError(false)
    try {
      const res = await fetch(`/api/account/orders?after=${encodeURIComponent(pageInfo.endCursor)}`)
      const json = await res.json().catch(() => null)
      if (json?.ok && json.orders) {
        const seen = new Set(orders.map((o) => o.databaseId))
        setOrders([...orders, ...(json.orders.nodes as CustomerOrderFull[]).filter((o) => !seen.has(o.databaseId))])
        setPageInfo(json.orders.pageInfo as PageInfo)
      } else {
        setMoreError(true)
      }
    } catch {
      setMoreError(true)
    } finally {
      setLoadingMore(false)
    }
  }

  if (loadError) {
    return (
      <div className="rounded-card bg-white p-10 text-center shadow-card">
        <p className="font-display text-lg font-bold text-secondary">We couldn’t load your bookings right now</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
          It’s us, not you — please refresh in a moment. If it keeps happening, message us on WhatsApp and we’ll
          send your booking details directly.
        </p>
        <a
          href="https://wa.me/971585898221"
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring mt-5 inline-flex items-center gap-2 rounded-btn bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
        >
          <MessageCircle className="h-4 w-4" aria-hidden /> Chat on WhatsApp
        </a>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-card bg-white p-10 text-center shadow-card">
        <span aria-hidden className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-primary">
          <CalendarCheck className="h-6 w-6" />
        </span>
        <p className="mt-4 font-display text-lg font-bold text-secondary">No bookings yet — your next adventure is waiting</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
          Theme parks, desert safaris, sky-high views: when you book, everything you need lands right here.
          (Booked as a guest before creating this account? Those bookings stay on the email confirmation we sent you.)
        </p>
        <Link
          href="/category/theme-parks"
          className="focus-ring mt-5 inline-flex items-center gap-2 rounded-btn bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
        >
          Browse experiences
        </Link>
      </div>
    )
  }

  return (
    <div>
      <motion.ul
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="grid gap-3"
      >
        {orders.map((o) => <OrderCard key={o.databaseId} order={o} />)}
      </motion.ul>

      {loadingMore && <div className="mt-3"><SkeletonCards /></div>}

      {pageInfo.hasNextPage && (
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="focus-ring inline-flex items-center gap-2 rounded-btn bg-white px-6 py-2.5 text-sm font-bold text-secondary shadow-card transition-colors hover:bg-neutral-50 disabled:opacity-60"
          >
            {loadingMore && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {loadingMore ? 'Loading…' : 'Load more bookings'}
          </button>
          {moreError && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              Couldn’t load more just now — please try again.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

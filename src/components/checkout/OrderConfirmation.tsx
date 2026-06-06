'use client'
// Phase 3 — full order confirmation experience. Privacy-first: renders only
// from the opaque `ref` query param + a sessionStorage snapshot written by
// CheckoutForm on success (dies with the tab, never sent to a server). No
// CMS fetches on this page — zero order-enumeration surface. Three states:
// full (snapshot), reference-only (reload), and friendly no-reference.
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { useCart } from '@/components/cart/CartProvider'
import { formatPrice } from '@/lib/utils'

export const ORDER_SNAPSHOT_KEY = 'uaej:last-order'

export interface OrderSnapshot {
  ref: string
  total: string
  status: string
  firstName?: string
  subtotal?: string
  items?: { name: string; qty: number; total: string }[]
  placedAt?: number
}

const BANK = {
  holder: 'Arabian Junction FZC LLC',
  iban: 'AE448090000000000597368',
  account: '597368',
  currency: 'AED',
  swift: 'EMDVAEADXXX',
}

const WHATSAPP = '971585898221'

const sanitizeRef = (v: string | null) => (v || '').replace(/[^0-9A-Za-z-]/g, '').slice(0, 20)

function money(raw?: string): string | null {
  const n = formatPrice(raw)
  return n ? `AED ${n}` : null
}

function readSnapshot(ref: string): OrderSnapshot | null {
  try {
    const raw = sessionStorage.getItem(ORDER_SNAPSHOT_KEY)
    if (!raw) return null
    const snap = JSON.parse(raw) as OrderSnapshot
    // Snapshot must belong to the reference in the URL — otherwise ignore it.
    if (!snap || typeof snap.ref !== 'string' || snap.ref !== ref) return null
    return snap
  } catch {
    return null
  }
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard unavailable — button simply does nothing harmful */ }
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label}`}
      className="inline-flex items-center gap-1.5 rounded-btn border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-secondary transition hover:border-primary hover:text-primary focus-ring print:hidden"
    >
      {copied ? (
        <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      ) : (
        <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
      )}
      {copied ? 'Copied' : 'Copy'}
      <span aria-live="polite" className="sr-only">{copied ? `${label} copied to clipboard` : ''}</span>
    </button>
  )
}

function SuccessCheck({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <motion.div
      initial={reduceMotion ? false : { scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      aria-hidden="true"
      className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-600">
        <motion.path
          d="M20 6 9 17l-5-5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
        />
      </svg>
    </motion.div>
  )
}

const TIMELINE = [
  { key: 'received', label: 'Booking received', sub: 'Your reference is reserved' },
  { key: 'payment', label: 'Your transfer', sub: 'Send the bank transfer' },
  { key: 'invoice', label: 'We confirm', sub: 'Invoice & tickets by email' },
  { key: 'enjoy', label: 'Enjoy!', sub: 'Show your tickets & have fun' },
]

function Timeline() {
  return (
    <ol className="grid gap-4 sm:grid-cols-4" aria-label="What happens next">
      {TIMELINE.map((s, i) => (
        <li key={s.key} className="relative flex sm:block items-start gap-3">
          <div
            aria-hidden="true"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold sm:mb-2 ${
              i === 0 ? 'bg-emerald-500 text-white' : i === 1 ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-400'
            }`}
          >
            {i === 0 ? '✓' : i + 1}
          </div>
          <div>
            <p className={`text-sm font-semibold ${i <= 1 ? 'text-secondary' : 'text-neutral-400'}`}>
              {s.label}
              {i === 1 && <span className="sr-only"> (current step)</span>}
            </p>
            <p className={`text-xs ${i <= 1 ? 'text-neutral-500' : 'text-neutral-400'}`}>{s.sub}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

function BankRow({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 py-2.5">
      <dt className="text-sm text-neutral-500">{label}</dt>
      <dd className="flex items-center gap-2">
        <span className="font-mono text-sm font-semibold tracking-wide text-secondary">{value}</span>
        {copy && <CopyButton value={value} label={label} />}
      </dd>
    </div>
  )
}

function CrossSell() {
  const links = [
    { href: '/promotions', title: 'Promotions', sub: 'Limited-time deals on top experiences' },
    { href: '/experiences', title: 'Experiences', sub: 'Theme parks, tours & attractions' },
    { href: '/blogs', title: 'Travel Blog', sub: 'Tips & guides for your UAE trip' },
  ]
  return (
    <section aria-labelledby="while-you-wait" className="mt-12 print:hidden">
      <h2 id="while-you-wait" className="font-display font-semibold text-lg text-secondary mb-4">While you wait…</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="group rounded-card bg-white p-5 shadow-card transition hover:-translate-y-0.5 focus-ring">
            <p className="font-display font-semibold text-secondary group-hover:text-primary">{l.title}</p>
            <p className="mt-1 text-sm text-neutral-500">{l.sub}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function OrderConfirmation() {
  const params = useSearchParams()
  const reduceMotion = useReducedMotion() ?? false
  const { refresh } = useCart()
  const headingRef = useRef<HTMLHeadingElement>(null)

  const ref = sanitizeRef(params.get('ref'))
  const queryTotal = money(params.get('total') || undefined)

  // 'init' avoids a hydration mismatch: sessionStorage is read after mount.
  const [snap, setSnap] = useState<OrderSnapshot | null | 'init'>('init')

  useEffect(() => {
    setSnap(ref ? readSnapshot(ref) : null)
    void refresh() // ensure the header cart badge reflects the emptied server cart
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (snap !== 'init') headingRef.current?.focus()
  }, [snap])

  if (snap === 'init') {
    return (
      <div className="py-24 text-center text-neutral-500" role="status" aria-live="polite">
        Loading your booking…
      </div>
    )
  }

  // ---------- No-reference state (direct visit) ----------
  if (!ref) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div aria-hidden="true" className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" /></svg>
        </div>
        <h1 ref={headingRef} tabIndex={-1} className="font-display font-bold text-3xl text-secondary mb-3 outline-none">
          Looking for a booking?
        </h1>
        <p className="text-neutral-500 mb-8">
          This page shows your confirmation right after checkout. If you placed a booking, your
          reference and instructions are in your email — or message us and we&apos;ll find it for you.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/experiences" className="inline-block rounded-btn bg-primary px-8 py-3.5 font-semibold text-white hover:bg-primary-dark focus-ring">
            Browse experiences
          </Link>
          <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer"
            className="inline-block rounded-btn border border-neutral-200 bg-white px-8 py-3.5 font-semibold text-secondary hover:border-primary hover:text-primary focus-ring">
            WhatsApp us
          </a>
          <Link href="/contact" className="inline-block rounded-btn border border-neutral-200 bg-white px-8 py-3.5 font-semibold text-secondary hover:border-primary hover:text-primary focus-ring">
            Contact
          </Link>
        </div>
      </div>
    )
  }

  // ---------- Full + reference-only states ----------
  const full = snap !== null
  const total = (full && money(snap.total)) || queryTotal
  const firstName = full ? (snap.firstName || '').trim() : ''
  const waText = encodeURIComponent(`Hi! I just placed booking #${ref} and I'm sending you my transfer receipt.`)

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto max-w-3xl"
    >
      {/* Hero */}
      <div className="text-center">
        <SuccessCheck reduceMotion={reduceMotion} />
        <h1 ref={headingRef} tabIndex={-1} className="font-display font-bold text-3xl sm:text-4xl text-secondary mb-2 outline-none">
          Booking received{firstName ? `, ${firstName}` : ''} — you&apos;re almost there!
        </h1>
        <p className="text-neutral-500">
          Complete the bank transfer below and we&apos;ll confirm your booking and email your invoice &amp; tickets.
        </p>
      </div>

      {/* Reference card */}
      <div className="mt-8 rounded-card bg-white p-6 sm:p-8 shadow-card text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-neutral-400">Pre-booking reference</p>
        <p className="mt-2 font-mono text-4xl font-bold tracking-widest text-primary" aria-label={`Pre-booking reference ${ref}`}>
          #{ref}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <CopyButton value={ref} label="booking reference" />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Awaiting payment
          </span>
        </div>
        {total && (
          <p className="mt-4 text-neutral-500">
            Amount due: <span className="font-display font-bold text-secondary text-lg">{total}</span>
          </p>
        )}
      </div>

      {/* Payment instructions */}
      <section aria-labelledby="pay-heading" className="mt-8 rounded-card bg-white p-6 sm:p-8 shadow-card">
        <h2 id="pay-heading" className="font-display font-semibold text-xl text-secondary mb-5">
          How to complete your booking
        </h2>
        <ol className="space-y-4 text-sm text-neutral-600">
          {[
            <>Transfer {total ? <strong className="text-secondary">{total}</strong> : 'the total amount'} to our company account below.</>,
            <>Add your reference <strong className="text-secondary">#{ref}</strong> in the transfer note so we match it instantly.</>,
            <>We verify your payment and email your <strong className="text-secondary">invoice</strong>.</>,
            <>Your booking is <strong className="text-secondary">confirmed</strong> — tickets follow by email.</>,
          ].map((step, i) => (
            <li key={i} className="flex gap-3">
              <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <div className="mt-6 rounded-card border border-neutral-100 bg-neutral-50 px-5 py-3">
          <h3 className="py-2 font-display font-semibold text-secondary">Bank transfer details</h3>
          <dl className="divide-y divide-neutral-100">
            <BankRow label="Account holder" value={BANK.holder} />
            <BankRow label="IBAN" value={BANK.iban} copy />
            <BankRow label="Account number" value={BANK.account} copy />
            <BankRow label="SWIFT code" value={BANK.swift} copy />
            <BankRow label="Currency" value={BANK.currency} />
          </dl>
        </div>

        <a
          href={`https://wa.me/${WHATSAPP}?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-btn bg-emerald-500 px-8 py-3.5 font-semibold text-white transition hover:bg-emerald-600 focus-ring print:hidden"
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.4 14.1c-.2.7-1.3 1.3-1.8 1.3-.5.1-1 .2-3.4-.7-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1.1 2.2 1.4 2.5 1.5.3.2.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2 .9c.3.2.5.3.6.4 0 .2 0 .7-.2 1.3l-.5-.3Z"/></svg>
          Send us the transfer receipt on WhatsApp
        </a>
        <p className="mt-3 text-center text-sm text-neutral-500 print:mt-4 print:text-left">
          Questions? WhatsApp <span className="font-semibold text-secondary">+971 58 589 8221</span> — fastest way to confirm your booking.
        </p>
      </section>

      {/* Order summary (full state only) */}
      {full && (snap.items?.length ?? 0) > 0 && (
        <section aria-labelledby="summary-heading" className="mt-8 rounded-card bg-white p-6 sm:p-8 shadow-card">
          <h2 id="summary-heading" className="font-display font-semibold text-lg text-secondary mb-5">Order Summary</h2>
          <ul className="divide-y divide-neutral-100">
            {snap.items!.map((it, i) => (
              <li key={i} className="flex items-baseline justify-between gap-4 py-3 text-sm">
                <span className="text-neutral-600">
                  {it.name}
                  {it.qty > 1 && <span className="ml-1.5 text-neutral-400">× {it.qty}</span>}
                </span>
                <span className="shrink-0 font-semibold text-secondary">{money(it.total) || '—'}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-3 border-t border-neutral-100 pt-4 text-sm">
            {money(snap.subtotal) && (
              <div className="flex justify-between text-neutral-600"><dt>Subtotal</dt><dd>{money(snap.subtotal)}</dd></div>
            )}
            <div className="flex items-baseline justify-between">
              <dt className="font-display font-bold text-secondary text-base">Total</dt>
              <dd className="font-display font-bold text-primary text-xl">{total || '—'}</dd>
            </div>
            {(() => {
              const n = parseFloat((formatPrice(snap.total) || '0').replace(/,/g, ''))
              if (!Number.isFinite(n) || n <= 0) return null
              return (
                <div className="flex items-center justify-between rounded-btn bg-emerald-50 px-3 py-2 text-emerald-700">
                  <dt className="font-semibold">2.5% cashback earned — pending until payment</dt>
                  <dd className="font-bold">{`AED ${(n * 0.04).toFixed(2)}`}</dd>
                </div>
              )
            })()}
          </dl>
        </section>
      )}

      {/* Timeline */}
      <section aria-labelledby="next-heading" className="mt-8 rounded-card bg-white p-6 sm:p-8 shadow-card">
        <h2 id="next-heading" className="font-display font-semibold text-lg text-secondary mb-5">What happens next</h2>
        <Timeline />
      </section>

      <CrossSell />
    </motion.div>
  )
}

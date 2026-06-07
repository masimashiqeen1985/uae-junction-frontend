'use client'
// Rewards view — Phase 5. Hero wallet card (live plugin figures only),
// 3-step "how it works" consistent with /rewards-policy, referral code with
// copy-to-clipboard, and the live points ledger. Zero invented numbers:
// everything renders from `myLoyalty` / `myPointsHistory`.
import { useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Wallet, Clock4, Sparkles, Copy, Check, ChevronRight, Gift,
  CalendarCheck, BadgeCheck, MessageCircle,
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import type { LoyaltySummary, PointsEntry } from '@/lib/queries/customer'

const pts = (n: number | null | undefined) =>
  (n ?? 0).toLocaleString('en-AE')

const aed = (n: number | null | undefined) =>
  `AED ${(n ?? 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function Stat({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={cn('rounded-btn p-4', highlight ? 'bg-white/15' : 'bg-white/10')}>
      <p className="text-xs font-semibold uppercase tracking-wide text-white/70">{label}</p>
      <p className="font-display mt-1 text-2xl font-bold text-white">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-white/70">{sub}</p>}
    </div>
  )
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard unavailable — value stays visible to copy manually */ }
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Copied' : label}
      className="focus-ring inline-flex items-center gap-1.5 rounded-btn bg-white px-3 py-1.5 text-xs font-bold text-secondary shadow-card transition-colors hover:bg-neutral-50"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

const STEPS = [
  { icon: CalendarCheck, title: 'Book', text: 'Reserve any experience — every booking earns points.' },
  { icon: BadgeCheck, title: 'Payment confirmed', text: 'Once your first booking is confirmed, pending points unlock.' },
  { icon: Gift, title: 'Rewards credited', text: 'Points land in your wallet and convert to AED off future bookings.' },
] as const

export function RewardsView({
  loyalty, history, loadError,
}: {
  loyalty: LoyaltySummary | null
  history: PointsEntry[]
  loadError?: boolean
}) {
  const reduce = useReducedMotion()

  if (loadError || !loyalty) {
    return (
      <div className="rounded-card bg-white p-10 text-center shadow-card">
        <p className="font-display text-lg font-bold text-secondary">We couldn’t load your rewards wallet right now</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
          Your points are safe — please refresh in a moment, or message us on WhatsApp for your balance.
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

  const hasAnything = (loyalty.pointsBalance ?? 0) > 0 || (loyalty.pointsPending ?? 0) > 0 || (loyalty.pointsLifetime ?? 0) > 0

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="grid gap-6"
    >
      {/* Wallet hero */}
      <section
        aria-label="Rewards wallet"
        className="rounded-card bg-gradient-to-br from-secondary via-secondary to-neutral-800 p-5 shadow-card sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display flex items-center gap-2 text-lg font-bold text-white">
            <Wallet className="h-5 w-5 text-amber-300" aria-hidden /> Your wallet
          </h2>
          <span className="pill-cash" aria-label="Cashback program">2.5% cashback on every booking</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat
            label="Available"
            value={`${pts(loyalty.pointsBalance)} pts`}
            sub={`≈ ${aed(loyalty.aedEquivalent)} off your next booking`}
            highlight
          />
          <Stat
            label="Pending"
            value={`${pts(loyalty.pointsPending)} pts`}
            sub="Unlocks after your first confirmed booking"
          />
          <Stat
            label="Lifetime earned"
            value={`${pts(loyalty.pointsLifetime)} pts`}
            sub={loyalty.tierLabel ? `Tier: ${loyalty.tierLabel}` : loyalty.nextTier ? `Next tier: ${loyalty.nextTier}` : undefined}
          />
        </div>
        {(loyalty.pointsPending ?? 0) > 0 && (loyalty.pointsLifetime ?? 0) === 0 && (
          <p className="mt-4 flex items-center gap-2 rounded-btn bg-amber-300/15 px-3.5 py-2.5 text-sm font-semibold text-amber-200">
            <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
            Your first booking starts your cashback wallet — {pts(loyalty.pointsPending)} points are waiting to unlock.
          </p>
        )}
      </section>

      {/* How it works */}
      <section aria-label="How rewards work" className="rounded-card bg-white p-5 shadow-card sm:p-6">
        <h2 className="font-display mb-4 text-lg font-bold text-secondary">How it works</h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="rounded-btn bg-neutral-50 p-4">
              <span className="flex items-center gap-2.5">
                <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <Icon className="h-4 w-4 text-primary" aria-hidden />
                <span className="font-display text-sm font-bold text-secondary">{title}</span>
              </span>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{text}</p>
            </li>
          ))}
        </ol>
        <Link href="/rewards-policy" className="focus-ring mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          Read the full rewards policy <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </section>

      {/* Referral */}
      {loyalty.referralCode && (
        <section aria-label="Refer a friend" className="rounded-card bg-white p-5 shadow-card sm:p-6">
          <h2 className="font-display mb-1 text-lg font-bold text-secondary">Refer a friend, earn together</h2>
          <p className="text-sm text-neutral-500">
            Share your code — earn AED 20 in reward points when your friend signs up and completes their first booking.
            {typeof loyalty.totalReferrals === 'number' && loyalty.totalReferrals > 0 && (
              <> You’ve referred <strong className="text-secondary">{loyalty.totalReferrals}</strong> so far.</>
            )}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <code className="rounded-btn bg-neutral-50 px-3.5 py-2 font-mono text-sm font-bold tracking-wider text-secondary">
              {loyalty.referralCode}
            </code>
            <CopyButton value={loyalty.referralLink || loyalty.referralCode} label="Copy referral link" />
          </div>
        </section>
      )}

      {/* Points ledger */}
      <section aria-label="Points history" className="rounded-card bg-white p-5 shadow-card sm:p-6">
        <h2 className="font-display mb-4 text-lg font-bold text-secondary">Points history</h2>
        {history.length > 0 ? (
          <ul className="grid gap-2">
            {history.map((h) => {
              const positive = (h.points ?? 0) >= 0
              const pending = h.type === 'pending'
              return (
                <li key={h.id} className="flex items-center gap-3 rounded-btn bg-neutral-50 px-3.5 py-3">
                  <span
                    aria-hidden
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      pending ? 'bg-amber-50 text-amber-600' : positive ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-500',
                    )}
                  >
                    {pending ? <Clock4 className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-neutral-800">
                      {h.sourceLabel || h.source || 'Points activity'}
                    </span>
                    <span className="block truncate text-xs text-neutral-500">
                      {h.createdAt ? formatDate(h.createdAt.replace(' ', 'T')) : ''}
                      {pending ? ' · pending' : ''}
                      {h.note ? ` · ${h.note}` : ''}
                    </span>
                  </span>
                  <span className={cn('shrink-0 text-sm font-bold', pending ? 'text-amber-600' : positive ? 'text-emerald-600' : 'text-neutral-500')}>
                    {positive ? '+' : ''}{pts(h.points)} pts
                  </span>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="rounded-btn bg-neutral-50 px-4 py-8 text-center">
            <p className="font-display text-base font-bold text-secondary">
              {hasAnything ? 'Your activity will appear here soon' : 'Your first booking starts your cashback wallet'}
            </p>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-neutral-500">
              Book any experience and watch the points roll in.
            </p>
            <Link
              href="/category/theme-parks"
              className="focus-ring mt-4 inline-flex items-center gap-2 rounded-btn bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
            >
              Browse experiences
            </Link>
          </div>
        )}
      </section>
    </motion.div>
  )
}

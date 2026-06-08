'use client'
// Junction Wallet — embedded inside the header sign-in dropdown.
// • WalletCardLive  : signed-in. Real balance/referrals from GET /api/account/me
//                     (server-side WP JWT; token never reaches the browser).
//                     Graceful empty/loading states — never an error dump.
// • WalletTeaser    : logged-out. Sells the three program advantages with an
//                     illustrative (clearly-labelled) balance + CTAs.
// No new deps. On-brand tokens only. Mobile-first, reduced-motion safe, WCAG AA.
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Wallet, Gift, Users, Sparkles, Check, Copy, ArrowRight } from 'lucide-react'

// ---- Program value-props (real program facts; parity with homepage section) ----
const PROPS: { icon: typeof Wallet; big: string; small: string }[] = [
  { icon: Sparkles, big: '2.5%', small: 'back on every booking' },
  { icon: Gift, big: 'AED 25', small: 'welcome joining bonus' },
  { icon: Users, big: 'AED 20', small: 'per friend you refer' },
]

type Loyalty = {
  pointsBalance?: number | null
  pointsPending?: number | null
  referralCode?: string | null
  referralLink?: string | null
  totalReferrals?: number | null
  aedEquivalent?: number | null
}
type MeResponse = { ok?: boolean; customer?: { myLoyalty?: Loyalty | null } | null }

const aed = (n?: number | null) =>
  `AED ${(Number(n) || 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const pts = (n?: number | null) => (Number(n) || 0).toLocaleString('en-AE')

// ---------- shared sub-views ----------
function GrowList() {
  return (
    <ul className="grid gap-1.5" aria-label="Ways your wallet grows">
      {PROPS.map(({ icon: Icon, big, small }) => (
        <li key={big} className="flex items-center gap-2.5 rounded-lg bg-white/10 px-3 py-2">
          <Icon className="h-4 w-4 shrink-0 text-white/90" aria-hidden="true" />
          <span className="text-xs text-white/90">
            <strong className="font-semibold text-white">{big}</strong> {small}
          </span>
        </li>
      ))}
    </ul>
  )
}

function WalletShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#0bb8a6] to-[#5b6cff] p-4 text-white shadow-lg">
      {children}
    </div>
  )
}

// ---------- SIGNED-IN ----------
export function WalletCardLive() {
  const [state, setState] = useState<'loading' | 'ready' | 'inactive'>('loading')
  const [loyalty, setLoyalty] = useState<Loyalty | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let alive = true
    fetch('/api/account/me', { cache: 'no-store' })
      .then((r) => r.json() as Promise<MeResponse>)
      .then((j) => {
        if (!alive) return
        const l = j?.ok ? j.customer?.myLoyalty ?? null : null
        if (l) {
          setLoyalty(l)
          setState('ready')
        } else {
          setState('inactive')
        }
      })
      .catch(() => alive && setState('inactive'))
    return () => {
      alive = false
    }
  }, [])

  const code = loyalty?.referralLink || loyalty?.referralCode || ''
  const copy = useCallback(() => {
    if (!code) return
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    })
  }, [code])

  if (state === 'loading') {
    return (
      <div className="mb-2">
        <WalletShell>
          <div className="h-3 w-24 animate-pulse rounded bg-white/30" />
          <div className="mt-3 h-7 w-40 animate-pulse rounded bg-white/30" />
          <div className="mt-4 h-14 animate-pulse rounded-lg bg-white/15" />
        </WalletShell>
      </div>
    )
  }

  if (state === 'inactive') {
    return (
      <div className="mb-2">
        <WalletShell>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/80">Your Junction Wallet</p>
          <p className="mt-1 text-sm text-white/90">
            Your wallet activates on your first booking — then cashback lands here as real dirhams.
          </p>
          <div className="mt-3">
            <GrowList />
          </div>
        </WalletShell>
      </div>
    )
  }

  const refs = loyalty?.totalReferrals ?? 0
  const pending = loyalty?.pointsPending ?? 0

  return (
    <div className="mb-2">
      <WalletShell>
        <div className="flex items-start justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/80">
              <Wallet className="h-3.5 w-3.5" aria-hidden="true" /> Available balance
            </p>
            <p className="mt-0.5 text-2xl font-bold leading-none">{aed(loyalty?.aedEquivalent)}</p>
            <p className="mt-1 text-xs text-white/80">{pts(loyalty?.pointsBalance)} pts · spend like cash</p>
          </div>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">Active</span>
        </div>

        {pending > 0 && (
          <p className="mt-2 rounded-lg bg-white/10 px-3 py-1.5 text-[11px] text-white/90">
            {pts(pending)} pts pending — clears after your next booking.
          </p>
        )}

        {refs > 0 && (
          <p className="mt-2 text-[11px] text-white/90">
            You’ve referred <strong className="text-white">{refs}</strong> {refs === 1 ? 'friend' : 'friends'} 🎉
          </p>
        )}

        {code && (
          <button
            type="button"
            onClick={copy}
            className="focus-ring mt-2 flex w-full items-center justify-between gap-2 rounded-lg bg-white/15 px-3 py-2 text-left text-xs transition-colors hover:bg-white/25"
            aria-label="Copy your referral link"
          >
            <span className="min-w-0 truncate">
              <span className="text-white/70">Invite &amp; earn AED 20: </span>
              <span className="font-semibold">{loyalty?.referralCode}</span>
            </span>
            {copied ? <Check className="h-4 w-4 shrink-0" /> : <Copy className="h-4 w-4 shrink-0" />}
          </button>
        )}

        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-white/70">No expiry · no minimum</span>
          <Link href="/cart" className="focus-ring inline-flex items-center gap-1 font-semibold hover:underline">
            Use at checkout <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </WalletShell>
    </div>
  )
}

// ---------- LOGGED-OUT ----------
export function WalletTeaser({ onCreateAccount }: { onCreateAccount?: () => void }) {
  return (
    <div className="mt-3 border-t border-black/5 pt-3">
      <WalletShell>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-white/80">When you’re signed in</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-base font-bold">
          <Wallet className="h-4 w-4" aria-hidden="true" /> Your Junction Wallet
        </p>
        <p className="mt-1 text-xs text-white/85">
          One balance for cashback and bonuses — real dirhams, ready for your next booking.
        </p>

        <div className="mt-3 rounded-xl bg-white/10 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wide text-white/70">Example balance</p>
          <p className="text-xl font-bold leading-none">AED 312.50</p>
          <p className="mt-0.5 text-[10px] text-white/70">Illustrative — yours starts at AED 0 and grows automatically.</p>
        </div>

        <div className="mt-3">
          <GrowList />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCreateAccount}
            className="focus-ring rounded-full bg-white px-3 py-2 text-xs font-semibold text-[var(--c-primary-dark,#0a7e72)] transition-transform hover:scale-[1.02]"
          >
            Create free account
          </button>
          <Link
            href="/rewards-policy"
            className="focus-ring rounded-full border border-white/40 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-white/10"
          >
            How it works
          </Link>
        </div>
        <p className="mt-2 text-center text-[10px] text-white/70">No expiry · no minimum · spend like cash</p>
      </WalletShell>
    </div>
  )
}

'use client'
// "Why create an account?" benefits — rendered inside the auth dropdown.
// Full rows on the Create-account tab, single-line reminder on Sign-in.
// Copy is value-true: 2.5% cashback is live sitewide; joining + referral
// bonuses come from the uaej-loyalty programme (no invented numbers).
import { Wallet, Gift, Users2, Zap } from 'lucide-react'

const BENEFITS = [
  { icon: Wallet, label: '2.5% cashback on every booking' },
  { icon: Gift, label: 'Joining bonus on your first booking' },
  { icon: Users2, label: 'AED 5 instant + AED 20 referral bonus when friends book' },
  { icon: Zap, label: 'Faster checkout & order tracking' },
] as const

export function BenefitsStrip() {
  return (
    <ul className="mb-4 grid gap-1.5 rounded-xl bg-gradient-to-br from-[#e7faf7] to-amber-50/70 p-3">
      {BENEFITS.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-2.5 text-xs font-medium text-neutral-700">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white text-[var(--c-primary)] shadow-sm">
            <Icon className="h-3.5 w-3.5" aria-hidden />
          </span>
          {label}
        </li>
      ))}
    </ul>
  )
}

export function BenefitsReminder() {
  return (
    <p className="mb-4 flex items-center gap-2 rounded-lg bg-[#e7faf7] px-3 py-2 text-[11px] font-medium leading-snug text-neutral-600">
      <Wallet className="h-3.5 w-3.5 shrink-0 text-[var(--c-primary)]" aria-hidden />
      Members earn 2.5% cashback on every booking.
    </p>
  )
}

'use client'
// Account area navigation — Phase 5. Sidebar on md+, horizontal scrollable
// tab bar on mobile. Keyboard-complete links with aria-current; sign out via
// next-auth (same call as the Phase-4 dashboard).
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, CalendarCheck, UserRound, Wallet, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ITEMS = [
  { href: '/my-account', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/my-account/orders', label: 'My bookings', icon: CalendarCheck },
  { href: '/my-account/profile', label: 'Profile', icon: UserRound },
  { href: '/my-account/rewards', label: 'Rewards', icon: Wallet },
] as const

export function AccountNav({ name, email }: { name: string | null; email: string | null }) {
  const pathname = usePathname()
  const displayName = (name || email || 'My account').split('@')[0]

  return (
    <nav aria-label="Account" className="md:sticky md:top-24 md:self-start">
      {/* Identity chip — hidden on mobile to keep the tab bar lean */}
      <div className="mb-4 hidden items-center gap-3 rounded-card bg-white p-4 shadow-card md:flex">
        <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 font-display text-base font-bold text-primary">
          {displayName.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-secondary">{displayName}</span>
          {email && <span className="block truncate text-xs text-neutral-400">{email}</span>}
        </span>
      </div>

      <ul className="flex gap-1.5 overflow-x-auto pb-1 md:flex-col md:gap-1 md:overflow-visible md:rounded-card md:bg-white md:p-2 md:shadow-card">
        {ITEMS.map(({ href, label, icon: Icon, ...rest }) => {
          const active = 'exact' in rest && rest.exact ? pathname === href : pathname.startsWith(href)
          return (
            <li key={href} className="shrink-0 md:shrink">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'focus-ring flex items-center gap-2.5 whitespace-nowrap rounded-btn px-3.5 py-2.5 text-sm font-semibold transition-colors',
                  active
                    ? 'bg-amber-50 text-primary'
                    : 'bg-white text-neutral-600 shadow-card hover:text-secondary md:bg-transparent md:shadow-none md:hover:bg-neutral-50',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {label}
              </Link>
            </li>
          )
        })}
        <li className="shrink-0 md:mt-1 md:border-t md:border-neutral-100 md:pt-1">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="focus-ring flex w-full items-center gap-2.5 whitespace-nowrap rounded-btn bg-white px-3.5 py-2.5 text-sm font-semibold text-neutral-500 shadow-card transition-colors hover:text-red-600 md:bg-transparent md:shadow-none md:hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
            Sign out
          </button>
        </li>
      </ul>
    </nav>
  )
}

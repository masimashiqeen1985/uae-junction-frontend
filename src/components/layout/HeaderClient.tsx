'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import {
  ShoppingCart, Search, Menu, ChevronDown,
  Ticket, Waves, Tent, Ship, Sparkles, Building2, Plane, MapPin, Compass, Moon, Star,
} from 'lucide-react'
import { AuthDropdown } from '@/components/auth/AuthDropdown'
import { MobileMenu } from './MobileMenu'
import type { NavItem, NavChild } from './nav-types'

export type { NavItem, NavChild }

type Props = {
  nav: NavItem[]
  providers: { google: boolean; facebook: boolean }
  authConfigured: boolean
}

// Map a child label to a travel icon (keyword based) for the mega-menu.
function iconFor(label: string) {
  const l = label.toLowerCase()
  if (l.includes('water')) return Waves
  if (l.includes('theme')) return Ticket
  if (l.includes('desert') || l.includes('safari')) return Tent
  if (l.includes('cruise') || l.includes('dhow')) return Ship
  if (l.includes('experience')) return Sparkles
  if (l.includes('hotel')) return Building2
  if (l.includes('flight')) return Plane
  if (l.includes('city') || l.includes('tour')) return MapPin
  if (l.includes('umrah')) return Moon
  if (l.includes('promo') || l.includes('offer')) return Star
  return Compass
}

export function HeaderClient({ nav, providers }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const reduce = useReducedMotion()
  const isHome = pathname === '/'
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setScrolled(y > 24)
    // Hide on scroll-down past the hero, reveal on scroll-up. Never hide near top.
    if (y > 160 && y > prev) setHidden(true)
    else setHidden(false)
  })

  const transparent = isHome && !scrolled
  const textColor = transparent ? 'text-white' : 'text-neutral-700'
  const logoSecond = transparent ? 'text-[#FFB733]' : 'text-[var(--c-primary)]'

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: hidden && !mobileOpen ? '-100%' : '0%' }}
        transition={reduce ? { duration: 0 } : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          transparent ? 'bg-transparent' : 'glass-light border-b border-black/5 shadow-sm'
        }`}
      >
        <div className="container-xl">
          <div className="flex h-16 items-center justify-between lg:h-20">
            {/* Logo */}
            <Link href="/" className={`font-display text-xl font-extrabold tracking-tight ${transparent ? 'text-white' : 'text-neutral-900'}`}>
              THE UAE <span className={logoSecond}>JUNCTION</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-1 lg:flex" onMouseLeave={() => setOpenMenu(null)}>
              {nav.map((item) =>
                item.children?.length ? (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setOpenMenu(item.label)}
                  >
                    <button
                      type="button"
                      aria-haspopup="true"
                      aria-expanded={openMenu === item.label}
                      onClick={() => setOpenMenu((m) => (m === item.label ? null : item.label))}
                      className={`focus-ring flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-[var(--c-primary)] ${textColor}`}
                    >
                      {item.label}
                      <ChevronDown className={`h-4 w-4 transition-transform ${openMenu === item.label ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {openMenu === item.label && (
                        <motion.div
                          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute left-1/2 top-[calc(100%+10px)] w-[34rem] -translate-x-1/2"
                        >
                          <MegaMenu items={item.children} onPick={() => setOpenMenu(null)} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`focus-ring rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-[var(--c-primary)] ${textColor}`}
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              <button aria-label="Search" className={`focus-ring rounded-full p-2 transition-colors hover:text-[var(--c-primary)] ${textColor}`}>
                <Search className="h-5 w-5" />
              </button>
              <Link href="/cart" aria-label="Cart" className={`focus-ring relative rounded-full p-2 transition-colors hover:text-[var(--c-primary)] ${textColor}`}>
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--c-primary)] text-[10px] font-bold text-white">0</span>
              </Link>
              <div className="hidden sm:block">
                <AuthDropdown providers={providers} />
              </div>
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setMobileOpen(true)}
                className={`focus-ring rounded-full p-2 lg:hidden ${textColor}`}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Spacer so fixed header doesn't overlap content (homepage hero sits under it intentionally) */}
      {!isHome && <div className="h-16 lg:h-20" aria-hidden="true" />}

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} nav={nav} />
    </>
  )
}

function MegaMenu({ items, onPick }: { items: NavChild[]; onPick: () => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white p-3 shadow-2xl">
      <div className="grid grid-cols-2 gap-1">
        {items.map((c) => {
          const Icon = iconFor(c.label)
          return (
            <Link
              key={c.href + c.label}
              href={c.href}
              onClick={onPick}
              className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-amber-50"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFB733] to-[#FF8A3D] text-white shadow-sm">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-neutral-800 group-hover:text-[var(--c-primary-dark)]">{c.label}</span>
                <span className="block truncate text-xs text-neutral-400">{c.description || 'Explore & book with 4% cashback'}</span>
              </span>
            </Link>
          )
        })}
      </div>
      <div className="mt-1 flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-2.5">
        <span className="text-xs text-neutral-500">Every booking earns 4% cashback</span>
        <Link href="/promotions" onClick={onPick} className="text-xs font-semibold text-[var(--c-primary)] hover:underline">
          View all offers →
        </Link>
      </div>
    </div>
  )
}

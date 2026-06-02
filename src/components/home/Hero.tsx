'use client'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Search, Sparkles, ShieldCheck, BadgePercent, Headphones } from 'lucide-react'
import { Skyline } from './hero/Skyline'

export type HeroContent = {
  badge?: string
  headline?: string
  highlight?: string
  subhead?: string
  ctaLabel?: string
  ctaHref?: string
  secondaryLabel?: string
  secondaryHref?: string
}

const DEFAULTS: Required<HeroContent> = {
  badge: '4% Cashback on Every Booking',
  headline: 'Your journey is our',
  highlight: 'passion',
  subhead:
    'Theme parks, desert safaris, dhow cruises, hotels and flights — booked your way across the UAE and beyond, with rewards on every trip.',
  ctaLabel: 'Explore Packages',
  ctaHref: '/promotions',
  secondaryLabel: 'Get a Free Quote',
  secondaryHref: '#quote',
}

const TRUST = [
  { icon: BadgePercent, label: '4% cashback' },
  { icon: ShieldCheck, label: 'Secure booking' },
  { icon: Headphones, label: '24/7 support' },
]

const ease = [0.16, 1, 0.3, 1] as const

export function Hero({ content }: { content?: HeroContent }) {
  const c = { ...DEFAULTS, ...content }
  const reduce = useReducedMotion()

  const parent = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  }
  const item = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }

  return (
    <section className="relative flex min-h-[78vh] items-center overflow-hidden md:min-h-[84vh]">
      {/* Gradient backdrop */}
      <div className="absolute inset-0" style={{ background: 'var(--g-heroSky, linear-gradient(180deg,#0B1E3A 0%,#1E7070 55%,#2D9D9D 100%))' }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,165,0,.24),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_30%,rgba(59,186,186,.28),transparent_55%)]" />

      {/* White line-art Dubai skyline — full-width, responsive, sits along the base */}
      <Skyline className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] w-full sm:h-[52%]" />
      {/* fade so the skyline melts into the section base */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#2d9d9d]/40 to-transparent" />

      {/* Content */}
      <div className="container-xl relative z-10 w-full pt-24 pb-20 sm:pt-28 lg:pt-24">
        <motion.div variants={parent} initial="hidden" animate="show" className="max-w-2xl">
          <motion.span
            variants={item}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white ring-1 ring-white/20 backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#FFB733]" /> {c.badge}
          </motion.span>

          <motion.h1 variants={item} className="font-display text-[2rem] font-extrabold leading-[1.06] text-white sm:text-5xl lg:text-6xl">
            {c.headline}{' '}
            <span className="text-gradient-sunset">{c.highlight}</span>
          </motion.h1>

          <motion.p variants={item} className="mt-5 max-w-xl text-base leading-relaxed text-neutral-100/90 sm:text-lg">
            {c.subhead}
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={c.ctaHref}
              className="shine inline-flex items-center justify-center gap-2 rounded-[10px] bg-[var(--c-primary)] px-7 py-3.5 font-semibold text-white shadow-xl shadow-amber-500/30 transition-transform hover:-translate-y-0.5"
            >
              <Search className="h-4 w-4" /> {c.ctaLabel}
            </Link>
            <Link
              href={c.secondaryHref}
              className="inline-flex items-center justify-center rounded-[10px] border border-white/40 px-7 py-3.5 font-semibold text-white backdrop-blur transition-colors hover:bg-white hover:text-[var(--c-secondary-dark)]"
            >
              {c.secondaryLabel}
            </Link>
          </motion.div>

          <motion.ul variants={item} className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
            {TRUST.map((t) => (
              <li key={t.label} className="inline-flex items-center gap-2 text-sm text-white/85">
                <t.icon className="h-4 w-4 text-[#FFB733]" /> {t.label}
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  )
}

'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Search, Sparkles, ShieldCheck, BadgePercent, Headphones } from 'lucide-react'

// 3D scene is loaded ONLY on the client, after paint, so it never blocks LCP.
const HeroScene = dynamic(() => import('./hero/HeroScene'), {
  ssr: false,
  loading: () => null,
})

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
  const [show3D, setShow3D] = useState(false)
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    setMobile(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setMobile(e.matches)
    mq.addEventListener('change', onChange)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let idleId: number | undefined
    let timerId: ReturnType<typeof setTimeout> | undefined
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void) => number
      cancelIdleCallback?: (id: number) => void
    }
    if (!reduced) {
      if (w.requestIdleCallback) idleId = w.requestIdleCallback(() => setShow3D(true))
      else timerId = setTimeout(() => setShow3D(true), 400)
    }
    return () => {
      mq.removeEventListener('change', onChange)
      if (idleId !== undefined) w.cancelIdleCallback?.(idleId)
      if (timerId !== undefined) clearTimeout(timerId)
    }
  }, [])

  const parent = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  }
  const item = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }

  return (
    <section className="relative flex min-h-[88vh] items-center overflow-hidden">
      {/* Poster / LCP background — always present, instant paint */}
      <div className="absolute inset-0" style={{ background: 'var(--g-heroSky, linear-gradient(180deg,#0B1E3A 0%,#1E7070 55%,#2D9D9D 100%))' }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(255,165,0,.26),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_60%,rgba(59,186,186,.30),transparent_55%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/40" />

      {/* Two-column: text LEFT, contained 3D globe RIGHT (gap keeps them from overlapping; stacks on mobile) */}
      <div className="container-xl relative z-10 w-full pt-28 pb-16 lg:pt-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          {/* LEFT — content */}
          <motion.div variants={parent} initial="hidden" animate="show" className="max-w-xl">
            <motion.span
              variants={item}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white ring-1 ring-white/20 backdrop-blur"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#FFB733]" /> {c.badge}
            </motion.span>

            <motion.h1 variants={item} className="font-display text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
              {c.headline}{' '}
              <span className="text-gradient-sunset">{c.highlight}</span>
            </motion.h1>

            <motion.p variants={item} className="mt-5 text-base leading-relaxed text-neutral-100/90 sm:text-lg">
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

          {/* RIGHT — contained 3D globe (own column; never overlaps the text) */}
          <div className="relative h-[280px] sm:h-[380px] lg:h-[560px]">
            {show3D && (
              <div className="absolute inset-0 opacity-95 mix-blend-screen">
                <HeroScene mobile={mobile} />
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(59,186,186,.25),transparent_60%)]" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* scroll cue */}
      {!reduce && (
        <motion.div
          aria-hidden="true"
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="flex h-9 w-6 items-start justify-center rounded-full border-2 border-white/40 p-1.5">
            <span className="h-1.5 w-1 rounded-full bg-white/70" />
          </span>
        </motion.div>
      )}
    </section>
  )
}

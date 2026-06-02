'use client'
import { motion, useReducedMotion } from 'framer-motion'
import { Skyline } from './hero/Skyline'

// Mirrors the theuaejunction.com hero: full-bleed Dubai backdrop, centred
// headline + cashback line + descriptive subhead. Drop an image at
// /public/hero-bg.jpg to use the exact photographic background; until then a
// branded gradient + white line-art Dubai skyline stands in (no broken image).
export type HeroContent = {
  headline?: string
  subline?: string
  subhead?: string
  bgImage?: string
}

const DEFAULTS: Required<HeroContent> = {
  headline: 'Your Journey Is Our Passion',
  subline: '4% Cashback on All Travel Bookings',
  subhead:
    'Every journey holds a promise, every destination unfolds a story, and every moment crafts a memory. We don’t just guide you to places, we transform the way you embrace the world.',
  bgImage: '/hero-bg.jpg',
}

const ease = [0.16, 1, 0.3, 1] as const

export function Hero({ content }: { content?: HeroContent }) {
  const c = { ...DEFAULTS, ...content }
  const reduce = useReducedMotion()

  const parent = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }
  const item = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }

  return (
    <section className="relative flex min-h-[68vh] items-center justify-center overflow-hidden text-center md:min-h-[76vh]">
      {/* gradient base */}
      <div className="absolute inset-0" style={{ background: 'var(--g-heroSky, linear-gradient(180deg,#0B1E3A 0%,#1E7070 55%,#2D9D9D 100%))' }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,165,0,.22),transparent_55%)]" />
      {/* white line-art Dubai skyline (stand-in until a photo is supplied) */}
      <Skyline className="animate-skyline-drift pointer-events-none absolute bottom-0 left-[-3%] h-[46%] w-[106%] sm:h-[56%]" />
      {/* optional photographic background — shows automatically once /hero-bg.jpg exists */}
      <div className="animate-kenburns absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${c.bgImage})` }} />
      {/* contrast overlay for centred text */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/45" />

      <div className="container-xl relative z-10 py-24 pt-28 sm:pt-32">
        <motion.div variants={parent} initial="hidden" animate="show" className="mx-auto max-w-4xl">
          <motion.h1 variants={item} className="font-display font-extrabold leading-tight text-white">
            <span className="block text-[1.9rem] sm:text-5xl lg:text-[3.4rem]">{c.headline}</span>
            <span className="mt-1 block text-[1.6rem] sm:text-4xl lg:text-5xl">
              <span className="text-gradient-sunset">{c.subline}</span>
            </span>
          </motion.h1>
          <motion.p variants={item} className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-neutral-100/90 sm:text-lg">
            {c.subhead}
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

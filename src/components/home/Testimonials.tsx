'use client'
import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'

export type Review = { name: string; loc: string; text: string }

// Curated launch testimonials. CMS-overridable via the `reviews` prop the day a
// reviews source (WP CPT / Woo reviews) is wired — defaults keep the section live.
const DEFAULT_REVIEWS: Review[] = [
  { name: 'Aisha R.', loc: 'Dubai, UAE', text: 'Booked our Ferrari World tickets and a desert safari through The UAE Junction — seamless, and the cashback was a lovely surprise. Will use again!' },
  { name: 'James M.', loc: 'London, UK', text: 'Planned our entire Dubai trip with them. Great prices on the dhow cruise and hotel, and support answered every question on WhatsApp within minutes.' },
  { name: 'Priya S.', loc: 'Mumbai, India', text: 'The Umrah package was handled with so much care. Everything was organised end to end. Highly recommend for stress-free travel.' },
  { name: 'Omar K.', loc: 'Abu Dhabi, UAE', text: 'Customised our family itinerary perfectly — water parks for the kids and city tours for us. Excellent value with the 4% cashback.' },
]

export function Testimonials({ reviews = DEFAULT_REVIEWS }: { reviews?: Review[] }) {
  const [i, setI] = useState(0)
  const reduce = useReducedMotion()
  const count = reviews.length
  const go = useCallback((d: number) => setI((p) => (p + d + count) % count), [count])

  useEffect(() => {
    if (reduce || count < 2) return
    const t = setInterval(() => setI((p) => (p + 1) % count), 6500)
    return () => clearInterval(t)
  }, [reduce, count])

  const r = reviews[i]

  return (
    <section className="relative overflow-hidden bg-[var(--c-secondary-dark)] py-16 text-white lg:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,165,0,.2),transparent_55%)]" aria-hidden="true" />
      <div className="container-xl relative max-w-3xl text-center">
        <Quote className="mx-auto mb-6 h-10 w-10 text-[#FFB733]" aria-hidden="true" />
        <div className="mb-6 flex items-center justify-center gap-1" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, n) => <Star key={n} className="h-4 w-4 fill-[#FFB733] text-[#FFB733]" />)}
        </div>
        <div className="min-h-[150px]">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={i}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg leading-relaxed text-white/95 sm:text-xl"
            >
              &ldquo;{r.text}&rdquo;
              <footer className="mt-6">
                <span className="block font-display font-semibold text-[#FFB733]">{r.name}</span>
                <span className="block text-sm text-white/70">{r.loc}</span>
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>
        <div className="mt-8 flex items-center justify-center gap-4">
          <button type="button" onClick={() => go(-1)} aria-label="Previous review" className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-white/40 transition-colors hover:bg-white hover:text-[var(--c-secondary-dark)]">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            {reviews.map((_, n) => (
              <button key={n} type="button" aria-label={`Go to review ${n + 1}`} onClick={() => setI(n)} className={`h-2.5 rounded-full transition-all ${n === i ? 'w-6 bg-[#FFB733]' : 'w-2.5 bg-white/40 hover:bg-white/70'}`} />
            ))}
          </div>
          <button type="button" onClick={() => go(1)} aria-label="Next review" className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-white/40 transition-colors hover:bg-white hover:text-[var(--c-secondary-dark)]">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  )
}

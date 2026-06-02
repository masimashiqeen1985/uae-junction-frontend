import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/motion/Reveal'
import { staggerParent, fadeUp } from '@/components/motion/variants'

const PROMOS = [
  { title: 'Theme Park Season Pass', desc: 'Multi-park access across Dubai & Abu Dhabi', href: '/theme-parks', accent: 'from-orange-500 to-[var(--c-primary)]' },
  { title: 'Desert Safari Specials', desc: 'Dune bashing, BBQ dinner & live shows', href: '/desert-safari', accent: 'from-amber-600 to-orange-500' },
  { title: 'Umrah Packages 2026', desc: 'Curated spiritual journeys, all-inclusive', href: '/umrah-packages', accent: 'from-[var(--c-secondary)] to-[var(--c-secondary-dark)]' },
]

export function PromotionsBanner() {
  return (
    <section className="bg-white py-12">
      <div className="container-xl">
        <Reveal variants={staggerParent(0.1)} className="flex gap-5 overflow-x-auto pb-3 [scrollbar-width:thin] snap-x">
          {PROMOS.map((p) => (
            <Reveal key={p.title} variants={fadeUp} as="div" className={`group w-[85%] shrink-0 snap-start rounded-2xl bg-gradient-to-r ${p.accent} p-7 text-white shadow-lg transition-shadow hover:shadow-2xl sm:w-[420px]`}>
              <Link href={p.href} className="block">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/80">Featured Deal</p>
                <h3 className="mb-1.5 font-display text-2xl font-bold">{p.title}</h3>
                <p className="mb-5 text-sm text-white/90">{p.desc}</p>
                <span className="inline-flex items-center gap-1.5 rounded-[10px] bg-white/95 px-5 py-2 text-sm font-semibold text-neutral-900 transition-transform group-hover:translate-x-1">
                  View Offer <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </Reveal>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

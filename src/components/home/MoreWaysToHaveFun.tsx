import Link from 'next/link'
import { SectionHeading } from './SectionHeading'
import { Reveal } from '@/components/motion/Reveal'
import { staggerParent, fadeUp } from '@/components/motion/variants'

const ITEMS = [
  { l: 'Dhow Cruise Dinner', h: '/dhow-cruise', accent: 'from-blue-600 to-[var(--c-secondary)]' },
  { l: 'City Sightseeing', h: '/uae-city-tours', accent: 'from-[var(--c-secondary)] to-teal-700' },
  { l: 'Adventure Experiences', h: '/experiences', accent: 'from-orange-500 to-[var(--c-primary)]' },
  { l: 'Water Park Fun', h: '/water-parks', accent: 'from-cyan-500 to-blue-600' },
  { l: 'Desert Adventures', h: '/desert-safari', accent: 'from-amber-600 to-orange-600' },
  { l: 'Theme Park Thrills', h: '/theme-parks', accent: 'from-fuchsia-600 to-[var(--c-primary)]' },
]

export function MoreWaysToHaveFun() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="container-xl">
        <SectionHeading center eyebrow="Endless options" title="More ways to" highlight="have fun" />
        <Reveal variants={staggerParent(0.07)} className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {ITEMS.map((i) => (
            <Reveal key={i.l} variants={fadeUp} as="div">
              <Link href={i.h} className={`group relative flex h-44 items-end overflow-hidden rounded-2xl bg-gradient-to-br ${i.accent} p-5 text-white shadow-md sm:h-52`}>
                <div className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/0" />
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-150" />
                <span className="relative z-10 font-display text-lg font-semibold drop-shadow">{i.l}</span>
              </Link>
            </Reveal>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

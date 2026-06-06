import { Reveal } from '@/components/motion/Reveal'
import { staggerParent, fadeUp } from '@/components/motion/variants'

const STATS = [
  { v: '50K+', l: 'Happy travellers' },
  { v: '2.5%', l: 'Cashback on every booking' },
  { v: '200+', l: 'Tours & experiences' },
  { v: '24/7', l: 'Customer support' },
]

export function StatsBand() {
  return (
    <section className="bg-lagoon py-12 text-white">
      <div className="container-xl">
        <Reveal variants={staggerParent(0.08)} className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((s) => (
            <Reveal key={s.l} variants={fadeUp} as="div" className="text-center">
              <p className="font-display text-3xl font-extrabold sm:text-4xl">{s.v}</p>
              <p className="mt-1 text-sm text-white/80">{s.l}</p>
            </Reveal>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

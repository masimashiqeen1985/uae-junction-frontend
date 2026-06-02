import { Gem, Map, Handshake } from 'lucide-react'
import { SectionHeading } from './SectionHeading'
import { Reveal } from '@/components/motion/Reveal'
import { staggerParent, fadeUp } from '@/components/motion/variants'

const USPS = [
  { Icon: Gem, t: 'Affordable Luxury', d: 'Premium tours delivering luxury without breaking the bank.' },
  { Icon: Map, t: 'Customized Itineraries', d: 'Personalized travel plans balancing quality and affordability.' },
  { Icon: Handshake, t: 'Exclusive Local Deals', d: 'Partnerships with local businesses for exclusive discounts.' },
]

export function WhyChooseUs() {
  return (
    <section className="bg-neutral-50 py-16 lg:py-20">
      <div className="container-xl">
        <SectionHeading center eyebrow="Why travellers pick us" title="Why choose" highlight="The UAE Junction" />
        <Reveal variants={staggerParent(0.1)} className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {USPS.map((x) => (
            <Reveal key={x.t} variants={fadeUp} as="div" className="group rounded-2xl bg-white p-8 text-center shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
              <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFB733] to-[#FF8A3D] text-white shadow-lg shadow-amber-500/30 transition-transform duration-300 group-hover:scale-110">
                <x.Icon className="h-6 w-6" />
              </span>
              <h3 className="mb-3 font-display text-lg font-semibold text-neutral-800">{x.t}</h3>
              <p className="text-sm leading-relaxed text-neutral-500">{x.d}</p>
            </Reveal>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

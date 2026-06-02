import Link from 'next/link'
import { WPImage } from '@/components/ui/WPImage'
import type { WPCategory } from '@/types/wordpress'
import { SectionHeading } from './SectionHeading'
import { Reveal } from '@/components/motion/Reveal'
import { staggerParent, scaleIn } from '@/components/motion/variants'

const TILES = [
  { l: 'Theme Parks', h: '/theme-parks', slug: 'theme-parks', e: '🎢' },
  { l: 'UAE City Tours', h: '/uae-city-tours', slug: 'uae-city-tours', e: '🏙️' },
  { l: 'Experiences', h: '/experiences', slug: 'experiences', e: '✨' },
  { l: 'Water Parks', h: '/water-parks', slug: 'water-parks', e: '🌊' },
  { l: 'Hotel Booking', h: '/hotel-booking', slug: 'hotel-booking', e: '🏨' },
  { l: 'Flight Booking', h: '/flight-booking', slug: 'flight-booking', e: '✈️' },
  { l: 'Umrah Packages', h: '/umrah-packages', slug: 'umrah-packages', e: '🕌' },
  { l: 'Desert Safari', h: '/desert-safari', slug: 'desert-safari', e: '🐪' },
]

// `categories` come from CMS (Woo) when available — real hero images light up
// automatically. Until then tiles render as branded gradient cards (no fakes).
export function CategoryGrid({ categories }: { categories: WPCategory[] }) {
  const bySlug = new Map((categories || []).map((c) => [c.slug, c]))
  return (
    <section className="bg-neutral-50 py-16 lg:py-20">
      <div className="container-xl">
        <SectionHeading
          center
          eyebrow="Explore by category"
          title="Discover your next"
          highlight="adventure"
          subtitle="From thrilling theme parks to serene desert escapes — find the trip that fits you."
        />
        <Reveal variants={staggerParent(0.06)} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {TILES.map((t) => {
            const img = bySlug.get(t.slug)?.categoryFields?.categoryHeroImage
            return (
              <Reveal key={t.h} variants={scaleIn} as="div">
                <Link href={t.h} className="group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--c-secondary)] to-[var(--c-secondary-dark)] p-4 text-white shadow-md">
                  {img?.sourceUrl && (
                    <>
                      <WPImage image={img} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(max-width:640px) 50vw,25vw" />
                      <div className="absolute inset-0 bg-black/45 transition-colors group-hover:bg-black/30" />
                    </>
                  )}
                  <span className="relative z-10 mb-2 text-4xl transition-transform duration-300 group-hover:-translate-y-1">{t.e}</span>
                  <span className="relative z-10 text-center font-display text-sm font-semibold">{t.l}</span>
                </Link>
              </Reveal>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}

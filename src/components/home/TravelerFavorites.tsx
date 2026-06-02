import Link from 'next/link'
import { Compass } from 'lucide-react'
import { ProductCard } from '@/components/ui/ProductCard'
import type { WPProduct } from '@/types/wordpress'
import { SectionHeading } from './SectionHeading'
import { Reveal } from '@/components/motion/Reveal'
import { staggerParent, fadeUp } from '@/components/motion/variants'

// Products come from WooGraphQL (not installed yet) → `products` will be empty.
// Instead of hiding the section silently, show a branded empty state so the
// homepage layout stays intact and the section lights up the moment Woo is live.
export function TravelerFavorites({ products }: { products: WPProduct[] }) {
  const list = (products || []).slice(0, 8)
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="container-xl">
        <SectionHeading
          eyebrow="Loved by travellers"
          title="Traveler favourites"
          highlight="this season"
          subtitle="Hand-picked experiences our guests love most."
          linkLabel="View all"
          linkHref="/experiences"
        />
        {list.length > 0 ? (
          <Reveal variants={staggerParent(0.06)} className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {list.map((p) => (
              <Reveal key={p.id} variants={fadeUp} as="div">
                <ProductCard product={p} />
              </Reveal>
            ))}
          </Reveal>
        ) : (
          <Reveal className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-14 text-center">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-[var(--c-primary)]">
              <Compass className="h-6 w-6" />
            </span>
            <h3 className="font-display text-lg font-semibold text-neutral-800">Featured experiences are on their way</h3>
            <p className="mt-1.5 max-w-md text-sm text-neutral-500">
              Browse our full range of tours, tickets and packages while we curate this season&apos;s favourites.
            </p>
            <Link href="/experiences" className="mt-5 inline-flex rounded-[10px] bg-[var(--c-primary)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--c-primary-dark)]">
              Explore all experiences
            </Link>
          </Reveal>
        )}
      </div>
    </section>
  )
}

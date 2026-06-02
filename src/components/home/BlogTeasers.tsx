import Link from 'next/link'
import { ArrowRight, CalendarDays } from 'lucide-react'
import { WPImage } from '@/components/ui/WPImage'
import type { WPPost } from '@/types/wordpress'
import { SectionHeading } from './SectionHeading'
import { Reveal } from '@/components/motion/Reveal'
import { staggerParent, fadeUp } from '@/components/motion/variants'

function fmt(d?: string) {
  if (!d) return ''
  try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) } catch { return '' }
}

// Posts come from WPGraphQL (this works today). Renders nothing extra if empty.
export function BlogTeasers({ posts }: { posts: WPPost[] }) {
  const list = (posts || []).slice(0, 3)
  if (!list.length) return null
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="container-xl">
        <SectionHeading
          eyebrow="Travel inspiration"
          title="From our"
          highlight="travel journal"
          subtitle="Guides, tips and stories to fuel your next adventure."
          linkLabel="Read the blog"
          linkHref="/blogs"
        />
        <Reveal variants={staggerParent(0.08)} className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {list.map((p) => {
            const img = p.featuredImage?.node
            return (
              <Reveal key={p.id} variants={fadeUp} as="article">
                <Link href={`/blogs/${p.slug}`} className="group block overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                    {img?.sourceUrl ? (
                      <WPImage image={img} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width:768px) 100vw,33vw" />
                    ) : (
                      <div className="absolute inset-0 bg-lagoon" />
                    )}
                  </div>
                  <div className="p-5">
                    {p.date && (
                      <span className="mb-2 inline-flex items-center gap-1.5 text-xs text-neutral-400">
                        <CalendarDays className="h-3.5 w-3.5" /> {fmt(p.date)}
                      </span>
                    )}
                    <h3 className="font-display text-lg font-semibold leading-snug text-neutral-800 group-hover:text-[var(--c-primary-dark)] line-clamp-2">{p.title}</h3>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--c-primary)]">
                      Read more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}

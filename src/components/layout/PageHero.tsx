import Link from 'next/link'

/**
 * Site-wide gradient intro band — mirrors the Vibrant Junction homepage hero brand.
 * Used by every inner page so chrome + page banners share one design language.
 */
export function PageHero({
  title, subtitle, crumb,
}: { title: string; subtitle?: string; crumb?: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-brand text-white">
      <div className="pointer-events-none absolute -top-28 -right-16 h-80 w-80 rounded-full bg-[#5b6cff] opacity-40 blur-[70px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-[#0bf0c8] opacity-40 blur-[70px]" aria-hidden="true" />
      <div className="container-xl relative py-14 sm:py-16 text-center">
        <nav aria-label="Breadcrumb" className="text-sm text-white/70 mb-4">
          <Link href="/" className="hover:text-white">Home</Link>{' '}
          <span aria-hidden="true">/</span>{' '}
          <span className="text-white">{crumb ?? title}</span>
        </nav>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight">{title}</h1>
        {subtitle && <p className="text-white/90 text-lg max-w-2xl mx-auto mt-4">{subtitle}</p>}
      </div>
    </section>
  )
}

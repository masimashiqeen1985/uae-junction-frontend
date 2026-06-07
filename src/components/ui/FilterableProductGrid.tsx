'use client'

import { useMemo, useState } from 'react'
import type { WPProduct } from '@/types/wordpress'
import { ProductCard } from '@/components/ui/ProductCard'

/**
 * Category product grid with destination (city) filter pills.
 * Pills appear only when products span 2+ cities; otherwise renders the plain grid.
 */
export function FilterableProductGrid({ products, noun = 'experience', nounPlural }: {
  products: WPProduct[]
  noun?: string
  nounPlural?: string
}) {
  const [city, setCity] = useState<string>('all')

  const cities = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>()
    for (const p of products) {
      for (const d of p.destinations?.nodes ?? []) {
        if (!d.parentDatabaseId) continue // skip country-level terms
        const cur = map.get(d.slug)
        map.set(d.slug, { name: d.name, count: (cur?.count ?? 0) + 1 })
      }
    }
    return [...map.entries()]
      .map(([slug, v]) => ({ slug, ...v }))
      .sort((a, b) => b.count - a.count)
  }, [products])

  const filtered = city === 'all'
    ? products
    : products.filter((p) => (p.destinations?.nodes ?? []).some((d) => d.slug === city))

  const plural = nounPlural ?? `${noun}s`
  const label = (n: number) => `${n} ${n === 1 ? noun : plural}`

  return (
    <div className="container-xl py-10 sm:py-12">
      {cities.length >= 2 && (
        <div role="group" aria-label="Filter by destination" className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={city === 'all'}
            onClick={() => setCity('all')}
            className={`focus-ring rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
              city === 'all'
                ? 'border-transparent bg-[var(--c-primary)] text-white'
                : 'border-neutral-200 bg-white text-neutral-700 hover:border-[var(--c-primary)] hover:text-[var(--c-primary-dark)]'
            }`}
          >
            All ({products.length})
          </button>
          {cities.map((c) => (
            <button
              key={c.slug}
              type="button"
              aria-pressed={city === c.slug}
              onClick={() => setCity(city === c.slug ? 'all' : c.slug)}
              className={`focus-ring rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                city === c.slug
                  ? 'border-transparent bg-[var(--c-primary)] text-white'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:border-[var(--c-primary)] hover:text-[var(--c-primary-dark)]'
              }`}
            >
              {c.name} ({c.count})
            </button>
          ))}
        </div>
      )}

      <p className="mb-6 text-sm text-neutral-500" aria-live="polite">
        {label(filtered.length)}
        {city !== 'all' && cities.length >= 2 && ` in ${cities.find((c) => c.slug === city)?.name ?? ''}`}
      </p>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <p className="py-10 text-center text-neutral-500">No {plural} in this destination yet — try another city.</p>
      )}
    </div>
  )
}

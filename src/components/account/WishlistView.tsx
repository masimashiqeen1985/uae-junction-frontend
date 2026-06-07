'use client'
// Wishlist grid for /my-account/wishlist. Server page hydrates product data;
// the WishlistProvider context stays the source of truth for membership, so a
// remove here updates the header badge and every heart instantly (no reload).
import Link from 'next/link'
import Image from 'next/image'
import { HeartOff, Compass } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useWishlist } from '@/components/wishlist/WishlistProvider'
import { WishlistButton } from '@/components/wishlist/WishlistButton'
import type { WishlistProduct } from '@/lib/queries/wishlist'

export function WishlistView({ products, loadError }: { products: WishlistProduct[]; loadError: boolean }) {
  const { ids, ready } = useWishlist()
  // Show server-hydrated products still present in live context state.
  const visible = products.filter((p) => (!ready ? true : ids.includes(p.databaseId)))

  if (loadError) {
    return (
      <div className="rounded-card bg-white p-8 text-center shadow-card">
        <p className="font-semibold text-neutral-700">We couldn&apos;t load your wishlist right now.</p>
        <p className="mt-1 text-sm text-neutral-500">Please refresh the page or try again in a moment.</p>
      </div>
    )
  }

  if (!visible.length) {
    return (
      <div className="rounded-card bg-white p-10 text-center shadow-card">
        <span aria-hidden className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-primary">
          <HeartOff className="h-7 w-7" />
        </span>
        <h2 className="font-display text-lg font-bold text-secondary">No saved experiences yet</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500">
          Tap the heart on any tour or attraction to keep it here — then book when you&apos;re ready.
        </p>
        <Link href="/experiences" className="focus-ring mt-5 inline-flex items-center gap-2 rounded-btn bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark">
          <Compass aria-hidden className="h-4 w-4" /> Explore experiences
        </Link>
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {visible.map((p) => {
        const display = formatPrice(p.salePrice ?? p.regularPrice ?? p.price ?? '')
        return (
          <li key={p.databaseId} className="group relative overflow-hidden rounded-card bg-white shadow-card transition-shadow hover:shadow-card-hover">
            <Link href={`/product/${p.slug}`} aria-label={p.name} className="absolute inset-0 z-[1] rounded-card focus-ring" />
            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
              {p.image?.sourceUrl ? (
                <Image src={p.image.sourceUrl} alt={p.image.altText || p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:640px) 100vw,(max-width:1280px) 50vw,33vw" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400">No image</div>
              )}
              <div className="absolute top-2 right-2 z-10">
                <WishlistButton productId={p.databaseId} productName={p.name} size="sm" />
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-display mb-2 text-sm font-semibold leading-snug text-neutral-800 line-clamp-2 group-hover:text-primary">{p.name}</h3>
              <div className="flex items-center justify-between gap-2">
                {display && <span className="text-base font-bold text-primary">AED {display}</span>}
                <span aria-hidden className="text-xs font-semibold text-secondary">View tour →</span>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

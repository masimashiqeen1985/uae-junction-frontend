// /my-account/wishlist — saved experiences (account sub-page).
// Same contract as orders/profile/rewards: (sub) layout enforces the
// server-side auth redirect + noindex; ids come bearer-only via customerFetch
// (myWishlist, uaej-wishlist plugin); product cards are hydrated through ONE
// aliased public query (ids sanitised to ints before interpolation).
import type { Metadata } from 'next'
import { customerFetch } from '@/lib/account/api'
import { fetchGraphQL } from '@/lib/graphql-client'
import {
  MY_WISHLIST, buildWishlistProductsQuery, sanitizeIds, type WishlistProduct,
} from '@/lib/queries/wishlist'
import { WishlistView } from '@/components/account/WishlistView'

export const metadata: Metadata = {
  title: 'My Wishlist',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function WishlistPageRoute() {
  const idsRes = await customerFetch<{ myWishlist: number[] | null }>(MY_WISHLIST)
  const ids = idsRes.ok ? sanitizeIds(idsRes.data.myWishlist) : []

  let products: WishlistProduct[] = []
  if (ids.length) {
    const query = buildWishlistProductsQuery(ids)
    if (query) {
      try {
        const data = await fetchGraphQL<Record<string, WishlistProduct | null>>(query, undefined, false)
        // Preserve the saved order; drop products that were unpublished since.
        products = ids
          .map((_, i) => data[`p${i}`])
          .filter((p): p is WishlistProduct => Boolean(p && p.databaseId && p.slug && p.name))
      } catch {
        /* render the designed error state below */
        products = []
      }
    }
  }

  const loadError = !idsRes.ok && idsRes.reason !== 'unauthenticated'

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-secondary sm:text-3xl">My wishlist</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Experiences you&apos;ve saved — synced to your account on every device.
        </p>
      </header>
      <WishlistView products={products} loadError={loadError} />
    </div>
  )
}

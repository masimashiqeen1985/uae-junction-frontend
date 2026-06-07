// Wishlist GraphQL operations — uaej-wishlist plugin (bearer-only, mirrors
// myLoyalty contract: guest -> "You must be logged in to use the wishlist.").
// Field/mutation names match uaej-wishlist.php v1.0.0 exactly.

export const MY_WISHLIST = `query MyWishlist{myWishlist}`

export const WISHLIST_ADD = `mutation WishlistAdd($ids:[Int]){uaejWishlistAdd(input:{productIds:$ids}){wishlist}}`

export const WISHLIST_REMOVE = `mutation WishlistRemove($ids:[Int]){uaejWishlistRemove(input:{productIds:$ids}){wishlist}}`

/** Lightweight product shape for the wishlist grid (schema-verified fields only). */
export type WishlistProduct = {
  databaseId: number
  slug: string
  name: string
  onSale?: boolean | null
  image?: { sourceUrl?: string | null; altText?: string | null } | null
  regularPrice?: string | null
  salePrice?: string | null
  price?: string | null
}

const WISHLIST_PRODUCT_FIELDS =
  'databaseId slug name onSale image{sourceUrl altText} ... on SimpleProduct{regularPrice salePrice price}'

/**
 * Aliased multi-product lookup by DATABASE_ID (core WPGraphQL `product(id:,idType:DATABASE_ID)`,
 * already proven by the PDP query pattern). IDs are sanitised to positive ints —
 * never interpolate raw input.
 */
export function buildWishlistProductsQuery(ids: number[]): string | null {
  const safe = ids.filter((n) => Number.isInteger(n) && n > 0).slice(0, 100)
  if (!safe.length) return null
  const parts = safe.map((id, i) => `p${i}:product(id:${id},idType:DATABASE_ID){${WISHLIST_PRODUCT_FIELDS}}`)
  return `query WishlistProducts{${parts.join(' ')}}`
}

export function sanitizeIds(input: unknown): number[] {
  if (!Array.isArray(input)) return []
  return [...new Set(input.map((n) => Number(n)).filter((n) => Number.isInteger(n) && n > 0))].slice(0, 100)
}

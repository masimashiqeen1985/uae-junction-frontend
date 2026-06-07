'use client'
// Live wishlist count bubble for the header heart — same visual contract as
// CartBadge. Hidden when empty.
import { useWishlist } from './WishlistProvider'

export function WishlistBadge() {
  const { count } = useWishlist()
  if (!count) return null
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--c-primary)] px-1 text-[10px] font-bold text-white">
      {count > 9 ? '9+' : count}
    </span>
  )
}

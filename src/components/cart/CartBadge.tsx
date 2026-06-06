'use client'
import { useCart } from './CartProvider'

// Live cart count bubble for the header. Hidden when empty.
export function CartBadge() {
  const { itemCount } = useCart()
  if (!itemCount) return null
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--c-primary)] px-1 text-[10px] font-bold text-white">
      {itemCount > 9 ? '9+' : itemCount}
    </span>
  )
}

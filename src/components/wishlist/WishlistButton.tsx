'use client'
// Heart toggle — used on product cards (overlay) and the PDP. Optimistic via
// WishlistProvider; stops propagation so it can sit above stretched links.
// 44px touch target at both sizes (p-2.5 + 20px icon / p-3 + 24px icon).
import { type MouseEvent } from 'react'
import { Heart } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useWishlist } from './WishlistProvider'

export function WishlistButton({
  productId,
  productName,
  size = 'md',
  className,
}: {
  productId: number
  productName?: string
  size?: 'sm' | 'md'
  className?: string
}) {
  const { has, toggle } = useWishlist()
  const reduce = useReducedMotion()
  const saved = has(productId)
  const label = saved
    ? `Remove ${productName || 'this experience'} from wishlist`
    : `Save ${productName || 'this experience'} to wishlist`

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(productId)
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        'focus-ring inline-flex items-center justify-center rounded-full bg-white/90 shadow-card backdrop-blur-sm transition-colors hover:bg-white',
        size === 'sm' ? 'p-2.5' : 'p-3',
        className,
      )}
    >
      <motion.span
        className="inline-flex"
        animate={saved && !reduce ? { scale: [1, 1.35, 1] } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 18, duration: 0.35 }}
      >
        <Heart
          aria-hidden
          className={cn(
            size === 'sm' ? 'h-5 w-5' : 'h-6 w-6',
            'transition-colors',
            saved ? 'fill-rose-500 text-rose-500' : 'text-neutral-600',
          )}
        />
      </motion.span>
    </button>
  )
}

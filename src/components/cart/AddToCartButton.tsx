'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, ShoppingCart } from 'lucide-react'
import { useCart } from './CartProvider'

interface Props {
  productId: number
  className?: string
  label?: string
  goToCart?: boolean
}

// Wires the PDP "Book Now" CTA to the live cart. Optimistic UI: shows a brief
// success state, then optionally routes to /cart. Never throws — surfaces a
// recoverable inline error.
export function AddToCartButton({ productId, className, label = 'Book Now', goToCart = true }: Props) {
  const { addToCart, status, error } = useCart()
  const [done, setDone] = useState(false)
  const router = useRouter()
  const busy = status === 'mutating'

  async function onClick() {
    setDone(false)
    const ok = await addToCart(productId, 1)
    if (ok) {
      setDone(true)
      if (goToCart) setTimeout(() => router.push('/cart'), 450)
      else setTimeout(() => setDone(false), 1800)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        aria-live="polite"
        className={
          className ||
          'w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-btn text-lg transition-colors disabled:opacity-70'
        }
      >
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : done ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
        {busy ? 'Adding…' : done ? 'Added to cart' : label}
      </button>
      {error && status === 'error' && (
        <p className="mt-2 text-sm text-red-600">Couldn’t add to cart. Please try again or message us on WhatsApp.</p>
      )}
    </div>
  )
}

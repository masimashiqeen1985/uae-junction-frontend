import type { Metadata } from 'next'
import { CartView } from '@/components/cart/CartView'

export const metadata: Metadata = { title: 'Your Cart', robots: { index: false, follow: false } }

export default function CartPage() {
  return (
    <div className="container-xl py-12 lg:py-16">
      <h1 className="font-display font-bold text-3xl text-secondary mb-8">Your Cart</h1>
      <CartView />
    </div>
  )
}

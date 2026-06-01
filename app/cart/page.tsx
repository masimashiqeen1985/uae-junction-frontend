import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cart',
  robots: { index: false },
}

export default function CartPage() {
  return (
    <main className="container section-py">
      <h1>Your Cart</h1>
      <p>Cart functionality coming in PAY-01.</p>
    </main>
  )
}

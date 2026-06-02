import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false },
}

export default function CheckoutPage() {
  return (
    <main className="container section-py">
      <h1>Checkout</h1>
      <p>Checkout with Stripe, Tabby &amp; PayPal coming in PAY-01.</p>
    </main>
  )
}

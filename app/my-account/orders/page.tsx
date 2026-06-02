import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Orders',
  robots: { index: false },
}

export default function OrdersPage() {
  return (
    <main className="container section-py">
      <h1>My Orders</h1>
      <p>Order history coming in FE-07.</p>
    </main>
  )
}

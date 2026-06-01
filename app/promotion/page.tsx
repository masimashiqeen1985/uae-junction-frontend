import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Promotions & Deals',
  description: 'Exclusive travel promotions and deals in the UAE.',
}

export const revalidate = 3600

export default function PromotionPage() {
  return (
    <main className="container section-py">
      <h1>Promotions</h1>
      <p>Content coming in FE-10 page build phase.</p>
    </main>
  )
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Water Park Tickets UAE — Best Prices',
  description: 'Book water park tickets across UAE at the best prices. Earn 4% cashback.',
}

export const revalidate = 3600

export default function WaterParksPage() {
  return (
    <main className="container section-py">
      <h1>Water Park Tickets</h1>
      <p>Content coming in FE-05 category listing phase.</p>
    </main>
  )
}

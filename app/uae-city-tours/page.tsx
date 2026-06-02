import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UAE City Tours — Dubai, Abu Dhabi & More',
  description: 'Book city tours across the UAE including Dubai and Abu Dhabi.',
}

export const revalidate = 3600

export default function CityToursPage() {
  return (
    <main className="container section-py">
      <h1>UAE City Tours</h1>
      <p>Content coming in FE-05 category listing phase.</p>
    </main>
  )
}

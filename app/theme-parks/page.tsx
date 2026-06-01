import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Theme Park Tickets Dubai — Best Prices',
  description: 'Book theme park tickets in Dubai and UAE at the best prices. Earn 4% cashback.',
}

export const revalidate = 3600

export default function ThemeParksPage() {
  return (
    <main className="container section-py">
      <h1>Theme Parks</h1>
      <p>Content coming in FE-05 category listing phase.</p>
    </main>
  )
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Group & Corporate Bookings',
  description: 'Tailored group and corporate travel packages in the UAE.',
}

export const revalidate = 3600

export default function GroupCorporatePage() {
  return (
    <main className="container section-py">
      <h1>Group & Corporate Bookings</h1>
      <p>Content coming in FE-07 static pages phase.</p>
    </main>
  )
}

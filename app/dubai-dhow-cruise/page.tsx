import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dubai Dhow Cruise — Marina & Creek',
  description: 'Book Dubai dhow cruise packages. Dinner cruises on Marina and Creek.',
}

export const revalidate = 3600

export default function DhowCruisePage() {
  return (
    <main className="container section-py">
      <h1>Dubai Dhow Cruise</h1>
      <p>Content coming in FE-05 category listing phase.</p>
    </main>
  )
}

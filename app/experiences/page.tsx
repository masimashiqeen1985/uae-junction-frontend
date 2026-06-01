import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Experiences in UAE',
  description: 'Unique experiences and activities across the UAE.',
}

export const revalidate = 3600

export default function ExperiencesPage() {
  return (
    <main className="container section-py">
      <h1>Experiences</h1>
      <p>Content coming in FE-05 category listing phase.</p>
    </main>
  )
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Desert Safari Dubai Packages',
  description: 'Book desert safari packages in Dubai. Morning, evening and overnight safaris.',
}

export const revalidate = 3600

export default function DesertSafariPage() {
  return (
    <main className="container section-py">
      <h1>Desert Safari Packages</h1>
      <p>Content coming in FE-05 category listing phase.</p>
    </main>
  )
}

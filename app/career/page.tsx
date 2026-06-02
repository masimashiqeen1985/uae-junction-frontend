import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Join The UAE Junction team — travel industry careers in Dubai.',
}

export const revalidate = 3600

export default function CareerPage() {
  return (
    <main className="container section-py">
      <h1>Careers</h1>
      <p>Content coming in FE-10 page build phase.</p>
    </main>
  )
}

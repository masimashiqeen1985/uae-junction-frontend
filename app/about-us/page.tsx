import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about The UAE Junction — your trusted travel partner in the UAE.',
}

export const revalidate = 3600

export default function AboutPage() {
  return (
    <main className="container section-py">
      <h1>About Us</h1>
      <p>Content coming in FE-10 page build phase.</p>
    </main>
  )
}

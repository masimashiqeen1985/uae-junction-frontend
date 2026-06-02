import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Travel Blog',
  description: 'Travel tips, guides, and inspiration from The UAE Junction.',
}

export const revalidate = 3600

export default function BlogsPage() {
  return (
    <main className="container section-py">
      <h1>Travel Blog</h1>
      <p>Content coming in FE-06 blog build phase.</p>
    </main>
  )
}

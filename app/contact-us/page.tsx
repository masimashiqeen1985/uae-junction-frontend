import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with The UAE Junction team.',
}

export const revalidate = 3600

export default function ContactPage() {
  return (
    <main className="container section-py">
      <h1>Contact Us</h1>
      <p>Content coming in FE-10 page build phase.</p>
    </main>
  )
}

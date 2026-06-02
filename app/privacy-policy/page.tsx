import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for The UAE Junction.',
}

export const revalidate = 86400

export default function PrivacyPolicyPage() {
  return (
    <main className="container section-py">
      <h1>Privacy Policy</h1>
      <p>Content coming in FE-07 static pages phase.</p>
    </main>
  )
}

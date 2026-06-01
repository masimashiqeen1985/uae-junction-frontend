import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and conditions for using The UAE Junction.',
}

export const revalidate = 86400

export default function TermsPage() {
  return (
    <main className="container section-py">
      <h1>Terms & Conditions</h1>
      <p>Content coming in FE-07 static pages phase.</p>
    </main>
  )
}

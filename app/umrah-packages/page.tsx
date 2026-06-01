import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Umrah Packages from UAE',
  description: 'Affordable Umrah packages from Dubai and UAE with The UAE Junction.',
}

export const revalidate = 3600

export default function UmrahPackagesPage() {
  return (
    <main className="container section-py">
      <h1>Umrah Packages</h1>
      <p>Content coming in FE-05 category listing phase.</p>
    </main>
  )
}

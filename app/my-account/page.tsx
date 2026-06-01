import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Account',
  robots: { index: false },
}

export default function MyAccountPage() {
  return (
    <main className="container section-py">
      <h1>My Account</h1>
      <p>Account management coming in FE-07.</p>
    </main>
  )
}

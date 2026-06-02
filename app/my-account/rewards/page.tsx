import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Rewards — 4% Cashback',
  robots: { index: false },
}

export default function RewardsPage() {
  return (
    <main className="container section-py">
      <h1>My Rewards</h1>
      <p>Cashback rewards dashboard coming in FE-07.</p>
    </main>
  )
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rewards Policy — 4% Cashback Program',
  description: 'Learn how our 4% cashback rewards program works at The UAE Junction.',
}

export const revalidate = 86400

export default function RewardsPolicyPage() {
  return (
    <main className="container section-py">
      <h1>Rewards Policy</h1>
      <p>Content coming in FE-07 static pages phase.</p>
    </main>
  )
}

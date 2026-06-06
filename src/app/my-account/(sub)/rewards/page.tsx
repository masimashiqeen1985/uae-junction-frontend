// /my-account/rewards — Cashback & Rewards (Phase 5, sub-page 3 of 3).
// UPGRADE over the Phase-4 assumption: the uaej-loyalty plugin DOES expose
// bearer-only GraphQL (root fields `myLoyalty` + `myPointsHistory`, guest →
// "You must be logged in", per-user data proven live 2026-06-07). Every
// figure on this page is the plugin's own number — nothing invented.
// Both queries are fetched server-side via customerFetch (no token in the
// browser, no caching of personal data).
import type { Metadata } from 'next'
import { customerFetch } from '@/lib/account/api'
import {
  MY_LOYALTY, MY_POINTS_HISTORY,
  type LoyaltySummary, type PointsEntry,
} from '@/lib/queries/customer'
import { RewardsView } from '@/components/account/RewardsView'

export const metadata: Metadata = {
  title: 'Cashback & Rewards',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function RewardsPageRoute() {
  const [loyaltyRes, historyRes] = await Promise.all([
    customerFetch<{ myLoyalty: LoyaltySummary | null }>(MY_LOYALTY),
    customerFetch<{ myPointsHistory: PointsEntry[] | null }>(MY_POINTS_HISTORY, { first: 25 }),
  ])

  const loyalty = loyaltyRes.ok ? loyaltyRes.data.myLoyalty : null
  const history = historyRes.ok ? historyRes.data.myPointsHistory ?? [] : []

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-secondary sm:text-3xl">Cashback &amp; rewards</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Earn on every booking — points unlock after your first confirmed booking, then keep stacking.
        </p>
      </header>
      <RewardsView loyalty={loyalty} history={history} loadError={!loyaltyRes.ok} />
    </div>
  )
}

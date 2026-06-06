// /my-account/orders — Bookings history (Phase 5, sub-page 1 of 3).
// Server component: first page of the signed-in customer's own orders is
// fetched server-side via customerFetch (Bearer from the NextAuth JWT —
// never in the browser, never cached). Pagination + in-place detail are
// handled by the OrdersList client island via /api/account/orders.
import type { Metadata } from 'next'
import { customerFetch } from '@/lib/account/api'
import { GET_CUSTOMER_ORDERS, type OrdersPage } from '@/lib/queries/customer'
import { OrdersList } from '@/components/account/OrdersList'

export const metadata: Metadata = {
  title: 'My Bookings',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 10

export default async function OrdersPageRoute() {
  // (sub) layout has already guaranteed a session; this fetch returns ONLY
  // the bearer's orders. Failures degrade to a designed error state.
  const result = await customerFetch<OrdersPage>(GET_CUSTOMER_ORDERS, { first: PAGE_SIZE, after: null })
  const orders = result.ok ? result.data.customer?.orders ?? null : null

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-secondary sm:text-3xl">My bookings</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Every booking you make with The UAE Junction lives here — payment status, details and receipts.
        </p>
      </header>
      <OrdersList
        initialOrders={orders?.nodes ?? []}
        initialPageInfo={orders?.pageInfo ?? { hasNextPage: false, endCursor: null }}
        loadError={!result.ok}
      />
    </div>
  )
}

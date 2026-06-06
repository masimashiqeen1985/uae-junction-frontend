// Paginated bookings — Phase 5 "Load more" endpoint.
// Mirrors /api/account/me: WP token read SERVER-SIDE from the NextAuth JWT
// cookie (getToken) and proxied as a Bearer header. Ownership enforced
// upstream (bearer-only `customer.orders`, proven live 2026-06-07).
// The cursor is an opaque WPGraphQL value — no IDs, no PII in the URL.
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { GET_CUSTOMER_ORDERS, type OrdersPage } from '@/lib/queries/customer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ENDPOINT = process.env.WP_GRAPHQL_ENDPOINT || process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || ''
const SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
const PAGE_SIZE = 10

export async function GET(req: NextRequest) {
  if (!SECRET || !ENDPOINT) {
    return NextResponse.json({ ok: false, orders: null }, { status: 503 })
  }
  const token = await getToken({ req, secret: SECRET })
  const wpAuthToken = token?.wpAuthToken as string | undefined
  if (!token || !wpAuthToken) {
    return NextResponse.json({ ok: false, orders: null }, { status: 401 })
  }
  // Opaque relay cursor only; cap length defensively.
  const afterRaw = req.nextUrl.searchParams.get('after') || ''
  const after = afterRaw && afterRaw.length <= 200 ? afterRaw : null
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${wpAuthToken}`,
      },
      body: JSON.stringify({ query: GET_CUSTOMER_ORDERS, variables: { first: PAGE_SIZE, after } }),
      cache: 'no-store',
    })
    if (!res.ok) return NextResponse.json({ ok: false, orders: null }, { status: 502 })
    const json = await res.json().catch(() => ({}))
    const orders = (json?.data as OrdersPage | undefined)?.customer?.orders ?? null
    if (!orders || json?.errors?.length) {
      return NextResponse.json({ ok: false, orders: null }, { status: 200 })
    }
    return NextResponse.json({ ok: true, orders })
  } catch {
    return NextResponse.json({ ok: false, orders: null }, { status: 502 })
  }
}

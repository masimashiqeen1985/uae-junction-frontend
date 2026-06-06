// Authenticated customer snapshot — Phase 4 dashboard data.
// Reads the WP authToken from the NextAuth JWT cookie SERVER-SIDE (getToken)
// and proxies a Bearer-authed `customer` query. The token itself never reaches
// the browser. Ownership is enforced upstream: WPGraphQL JWT returns only the
// token's own customer + orders (proven live 2026-06-07).
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { GET_CUSTOMER, type CustomerData } from '@/lib/queries/customer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ENDPOINT = process.env.WP_GRAPHQL_ENDPOINT || process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || ''
const SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET

export async function GET(req: NextRequest) {
  if (!SECRET || !ENDPOINT) {
    return NextResponse.json({ ok: false, customer: null }, { status: 503 })
  }
  const token = await getToken({ req, secret: SECRET })
  const wpAuthToken = token?.wpAuthToken as string | undefined
  if (!token || !wpAuthToken) {
    return NextResponse.json({ ok: false, customer: null }, { status: 401 })
  }
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${wpAuthToken}`,
      },
      body: JSON.stringify({ query: GET_CUSTOMER }),
      cache: 'no-store',
    })
    if (!res.ok) return NextResponse.json({ ok: false, customer: null }, { status: 502 })
    const json = await res.json().catch(() => ({}))
    const customer = (json?.data?.customer ?? null) as CustomerData | null
    // Expired/invalid WP token → treat as unauthenticated for data purposes;
    // the UI keeps its polished empty states (never an error dump).
    if (!customer || json?.errors?.length) {
      return NextResponse.json({ ok: false, customer: null }, { status: 200 })
    }
    return NextResponse.json({ ok: true, customer })
  } catch {
    return NextResponse.json({ ok: false, customer: null }, { status: 502 })
  }
}

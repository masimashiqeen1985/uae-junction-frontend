// Wishlist proxy — same security contract as /api/account/me:
// WP authToken is read SERVER-SIDE from the NextAuth JWT cookie and never
// reaches the browser. 401 here is the WishlistProvider's signal to run in
// guest (localStorage) mode — it is an expected, non-error state.
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { MY_WISHLIST, WISHLIST_ADD, WISHLIST_REMOVE, sanitizeIds } from '@/lib/queries/wishlist'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ENDPOINT = process.env.WP_GRAPHQL_ENDPOINT || process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || ''
const SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET

async function wpToken(req: NextRequest): Promise<string | null> {
  if (!SECRET) return null
  const token = await getToken({ req, secret: SECRET })
  const wp = token?.wpAuthToken
  return typeof wp === 'string' && wp ? wp : null
}

async function gql(
  wp: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<{ ok: boolean; data?: Record<string, unknown> }> {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${wp}` },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store',
    })
    if (!res.ok) return { ok: false }
    const json = await res.json().catch(() => null)
    if (!json || json.errors?.length || !json.data) return { ok: false }
    return { ok: true, data: json.data as Record<string, unknown> }
  } catch {
    return { ok: false }
  }
}

function idsFrom(data: Record<string, unknown> | undefined, path: string[]): number[] {
  let cur: unknown = data
  for (const key of path) {
    if (!cur || typeof cur !== 'object') return []
    cur = (cur as Record<string, unknown>)[key]
  }
  return sanitizeIds(cur)
}

export async function GET(req: NextRequest) {
  if (!ENDPOINT || !SECRET) return NextResponse.json({ ok: false, ids: [] }, { status: 503 })
  const wp = await wpToken(req)
  if (!wp) return NextResponse.json({ ok: false, ids: [] }, { status: 401 })
  const r = await gql(wp, MY_WISHLIST)
  if (!r.ok) return NextResponse.json({ ok: false, ids: [] }, { status: 502 })
  return NextResponse.json({ ok: true, ids: idsFrom(r.data, ['myWishlist']) })
}

async function mutate(req: NextRequest, mutation: string, payloadKey: string) {
  if (!ENDPOINT || !SECRET) return NextResponse.json({ ok: false, ids: [] }, { status: 503 })
  const wp = await wpToken(req)
  if (!wp) return NextResponse.json({ ok: false, ids: [] }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const ids = sanitizeIds(body?.productIds)
  if (!ids.length) return NextResponse.json({ ok: false, ids: [] }, { status: 400 })
  const r = await gql(wp, mutation, { ids })
  if (!r.ok) return NextResponse.json({ ok: false, ids: [] }, { status: 502 })
  return NextResponse.json({ ok: true, ids: idsFrom(r.data, [payloadKey, 'wishlist']) })
}

export async function POST(req: NextRequest) {
  return mutate(req, WISHLIST_ADD, 'uaejWishlistAdd')
}

export async function DELETE(req: NextRequest) {
  return mutate(req, WISHLIST_REMOVE, 'uaejWishlistRemove')
}

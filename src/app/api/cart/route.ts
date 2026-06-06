// Server-side cart proxy. Holds the WooCommerce session token in an httpOnly
// cookie and forwards it as the `woocommerce-session` header on every call, so
// the guest cart persists across requests without exposing the token to JS.
// Verified live: WooGraphQL returns the session header on first cart op and
// honours `Session <token>` thereafter.
import { NextRequest, NextResponse } from 'next/server'
import { GET_CART, ADD_TO_CART, UPDATE_ITEM_QTY, REMOVE_ITEMS, EMPTY_CART } from '@/lib/queries/cart'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ENDPOINT = process.env.WP_GRAPHQL_ENDPOINT || process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || ''
const COOKIE = 'wc_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

async function wooFetch(query: string, variables: Record<string, unknown>, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['woocommerce-session'] = `Session ${token}`
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  })
  const newToken = res.headers.get('woocommerce-session') || undefined
  const json = await res.json().catch(() => ({}))
  return { ok: res.ok, json, newToken }
}

function pickCart(json: { data?: Record<string, unknown> }): unknown {
  const d: Record<string, unknown> = json?.data || {}
  const nested = (k: string) => (d[k] as { cart?: unknown } | undefined)?.cart
  return (
    d.cart ||
    nested('updateItemQuantities') ||
    nested('removeItemsFromCart') ||
    nested('emptyCart') ||
    null
  )
}

async function withSession(req: NextRequest, query: string, variables: Record<string, unknown>, refetch = true) {
  if (!ENDPOINT) return NextResponse.json({ error: 'endpoint-missing' }, { status: 503 })
  const token = req.cookies.get(COOKIE)?.value
  try {
    const r = await wooFetch(query, variables, token)
    if (r.json?.errors?.length) {
      return NextResponse.json({ error: r.json.errors[0]?.message || 'cart-error' }, { status: 400 })
    }
    let cart = pickCart(r.json)
    const liveToken = r.newToken || token
    // Mutations like addToCart don't return the full cart — refetch with the same token.
    if (refetch && !cart && liveToken) {
      const r2 = await wooFetch(GET_CART, {}, liveToken)
      cart = pickCart(r2.json)
    }
    const out = NextResponse.json({ cart: cart ?? null })
    if (r.newToken) {
      out.cookies.set(COOKIE, r.newToken, {
        httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: COOKIE_MAX_AGE,
      })
    }
    return out
  } catch {
    return NextResponse.json({ error: 'cart-unavailable' }, { status: 502 })
  }
}

export async function GET(req: NextRequest) {
  return withSession(req, GET_CART, {}, false)
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const action = body?.action as string
  switch (action) {
    case 'add':
      return withSession(req, ADD_TO_CART, { id: Number(body.productId), qty: Number(body.quantity) || 1 })
    case 'update':
      return withSession(req, UPDATE_ITEM_QTY, { key: String(body.key), qty: Number(body.quantity) })
    case 'remove':
      return withSession(req, REMOVE_ITEMS, { keys: [String(body.key)] })
    case 'clear':
      return withSession(req, EMPTY_CART, {})
    default:
      return NextResponse.json({ error: 'unknown-action' }, { status: 400 })
  }
}

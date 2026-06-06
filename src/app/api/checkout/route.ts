// Server-side checkout proxy. Mirrors /api/cart session mechanics: reads the
// httpOnly `wc_session` cookie, forwards `woocommerce-session: Session <token>`,
// and persists any rotated token. Validates the payload server-side and only
// ever submits paymentMethod "bacs" (Direct Account Transfer). No card data
// is ever accepted or forwarded. PII is never logged.
import { NextRequest, NextResponse } from 'next/server'
import { CHECKOUT, type CheckoutOrder } from '@/lib/queries/checkout'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ENDPOINT = process.env.WP_GRAPHQL_ENDPOINT || process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || ''
const COOKIE = 'wc_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^\+?[0-9 ()-]{7,20}$/

interface CheckoutPayload {
  firstName?: unknown
  lastName?: unknown
  email?: unknown
  phone?: unknown
  country?: unknown
  note?: unknown
  website?: unknown // honeypot — must be empty
}

function str(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

function validate(p: CheckoutPayload) {
  const firstName = str(p.firstName, 60)
  const lastName = str(p.lastName, 60)
  const email = str(p.email, 120)
  const phone = str(p.phone, 24)
  const country = (str(p.country, 2) || 'AE').toUpperCase()
  const note = str(p.note, 500)
  const errors: Record<string, string> = {}
  if (!firstName) errors.firstName = 'First name is required'
  if (!lastName) errors.lastName = 'Last name is required'
  if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address'
  if (!PHONE_RE.test(phone)) errors.phone = 'Enter a valid phone number'
  if (!/^[A-Z]{2}$/.test(country)) errors.country = 'Select a country'
  return { fields: { firstName, lastName, email, phone, country, note }, errors }
}

export async function POST(req: NextRequest) {
  if (!ENDPOINT) return NextResponse.json({ error: 'endpoint-missing' }, { status: 503 })

  const body = (await req.json().catch(() => null)) as CheckoutPayload | null
  // Bot/malformed guard: non-JSON body or filled honeypot → reject quietly.
  if (!body || (typeof body.website === 'string' && body.website.length > 0)) {
    return NextResponse.json({ error: 'invalid-request' }, { status: 400 })
  }

  const { fields, errors } = validate(body)
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: 'validation', fields: errors }, { status: 422 })
  }

  const token = req.cookies.get(COOKIE)?.value
  if (!token) {
    // No cart session → nothing to check out.
    return NextResponse.json({ error: 'empty-cart' }, { status: 409 })
  }

  const input = {
    clientMutationId: `checkout-${Date.now()}`,
    paymentMethod: 'bacs',
    customerNote: fields.note || undefined,
    billing: {
      firstName: fields.firstName,
      lastName: fields.lastName,
      email: fields.email,
      phone: fields.phone,
      country: fields.country,
    },
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'woocommerce-session': `Session ${token}`,
      },
      body: JSON.stringify({ query: CHECKOUT, variables: { input } }),
      cache: 'no-store',
    })
    const newToken = res.headers.get('woocommerce-session') || undefined
    const json = (await res.json().catch(() => ({}))) as {
      data?: { checkout?: { result?: string; redirect?: string; order?: CheckoutOrder | null } | null }
      errors?: { message?: string }[]
    }

    if (json?.errors?.length) {
      const msg = json.errors[0]?.message || ''
      const friendly = /no session|empty/i.test(msg)
        ? 'empty-cart'
        : /payment method/i.test(msg)
          ? 'payment-method-unavailable'
          : 'checkout-failed'
      return NextResponse.json({ error: friendly }, { status: 409 })
    }

    const order = json?.data?.checkout?.order
    if (!order?.orderNumber) {
      return NextResponse.json({ error: 'checkout-failed' }, { status: 502 })
    }

    const out = NextResponse.json({
      order: { orderNumber: order.orderNumber, total: order.total, status: order.status },
    })
    if (newToken) {
      out.cookies.set(COOKIE, newToken, {
        httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: COOKIE_MAX_AGE,
      })
    }
    return out
  } catch {
    return NextResponse.json({ error: 'checkout-unavailable' }, { status: 502 })
  }
}

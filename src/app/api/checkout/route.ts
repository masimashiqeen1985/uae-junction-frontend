// Server-side checkout proxy. Mirrors /api/cart session mechanics: reads the
// httpOnly `wc_session` cookie, forwards `woocommerce-session: Session <token>`,
// and persists any rotated token. Validates the payload server-side and only
// ever submits paymentMethod "bacs" (Direct Account Transfer). No card data
// is ever accepted or forwarded. PII is never logged.
//
// Traveller-details gate (2026-06-07): nationality, UAE residency and gender
// are MANDATORY at checkout (optional everywhere else — progressive
// profiling). They are stored on the ORDER as metaData (uaej_* keys —
// checkout.metaData schema-probed live 2026-06-07) and, for signed-in
// customers, persisted back to the CUSTOMER profile so they are asked
// exactly once.
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { CHECKOUT, type CheckoutOrder } from '@/lib/queries/checkout'
import { UPDATE_CUSTOMER } from '@/lib/queries/customer'
import { isGender, isNationality, isResidency, fieldsToMeta } from '@/lib/profile-fields'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ENDPOINT = process.env.WP_GRAPHQL_ENDPOINT || process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || ''
const SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
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
  nationality?: unknown
  residency?: unknown
  gender?: unknown
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
  const nationality = str(p.nationality, 2).toUpperCase()
  const residency = str(p.residency, 20)
  const gender = str(p.gender, 20)
  const note = str(p.note, 500)
  const errors: Record<string, string> = {}
  if (!firstName) errors.firstName = 'First name is required'
  if (!lastName) errors.lastName = 'Last name is required'
  if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address'
  if (!PHONE_RE.test(phone)) errors.phone = 'Enter a valid phone number'
  if (!/^[A-Z]{2}$/.test(country)) errors.country = 'Select a country'
  // Mandatory traveller details (the checkout gate).
  if (!isNationality(nationality)) errors.nationality = 'Select your nationality'
  if (!isResidency(residency)) errors.residency = 'Tell us if you are a UAE resident'
  if (!isGender(gender)) errors.gender = 'Select an option'
  return { fields: { firstName, lastName, email, phone, country, nationality, residency, gender, note }, errors }
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

  const travellerMeta = fieldsToMeta(fields)

  const input = {
    clientMutationId: `checkout-${Date.now()}`,
    paymentMethod: 'bacs',
    customerNote: fields.note || undefined,
    metaData: travellerMeta,
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

    // Signed-in? Persist traveller details back to the customer profile so
    // they're asked exactly once. Best-effort: never blocks the order.
    if (SECRET) {
      try {
        const nextToken = await getToken({ req, secret: SECRET })
        const wpAuthToken = nextToken?.wpAuthToken as string | undefined
        if (wpAuthToken) {
          await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${wpAuthToken}`,
            },
            body: JSON.stringify({
              query: UPDATE_CUSTOMER,
              variables: {
                billing: { phone: fields.phone, country: fields.country },
                metaData: travellerMeta,
              },
            }),
            cache: 'no-store',
          })
        }
      } catch {
        /* non-fatal — order already placed */
      }
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

// Account registration proxy — Phase 4.
// Calls WooGraphQL registerCustomer server-side. The JWT plugin refuses to
// issue tokens on register outside the user's own context (proven live), so
// the client follows success with signIn('credentials') — register-then-login.
//
// Security: never logs passwords; ALL upstream errors are collapsed into one
// generic, non-enumerating message (Woo's own "already registered" reply would
// otherwise leak which emails exist). 503 with friendly JSON when auth is not
// configured. No PII in URLs (POST body only).
import { NextRequest, NextResponse } from 'next/server'
import { REGISTER_CUSTOMER } from '@/lib/queries/customer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ENDPOINT = process.env.WP_GRAPHQL_ENDPOINT || process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || ''
const CONFIGURED = Boolean(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET)

const GENERIC_FAIL =
  'We could not create an account with those details. If you already have an account, try signing in instead.'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  if (!CONFIGURED || !ENDPOINT) {
    return NextResponse.json(
      { ok: false, message: 'Accounts are launching soon. For bookings now, message us on WhatsApp at +971 58 589 8221.' },
      { status: 503 },
    )
  }

  const body = await req.json().catch(() => ({}))
  const email = typeof body?.email === 'string' ? body.email.trim() : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  const firstName = typeof body?.firstName === 'string' ? body.firstName.trim().slice(0, 60) : ''
  const lastName = typeof body?.lastName === 'string' ? body.lastName.trim().slice(0, 60) : ''

  if (!EMAIL_RE.test(email) || password.length < 8 || !firstName) {
    return NextResponse.json({ ok: false, message: GENERIC_FAIL }, { status: 400 })
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: REGISTER_CUSTOMER,
        variables: { email, password, firstName, lastName },
      }),
      cache: 'no-store',
    })
    if (!res.ok) return NextResponse.json({ ok: false, message: GENERIC_FAIL }, { status: 502 })
    const json = await res.json().catch(() => ({}))
    const customer = json?.data?.registerCustomer?.customer
    if (!customer || json?.errors?.length) {
      // Sanitised: do not forward Woo's error text (user enumeration risk).
      return NextResponse.json({ ok: false, message: GENERIC_FAIL }, { status: 400 })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, message: GENERIC_FAIL }, { status: 502 })
  }
}

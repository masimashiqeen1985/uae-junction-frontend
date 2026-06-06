// Profile update — Phase 5. POST { firstName, lastName, email, phone,
// country, currentPassword?, newPassword? }.
// Security model (probe-driven, 2026-06-07):
//  • updateCustomer mutates ONLY the bearer (cross-customer attempt →
//    capability error, proven) — but it does NOT ask for the current
//    password. We therefore verify the current password ourselves (a login
//    mutation for the bearer's own email) before applying a password change.
//  • The WP JWT stays valid after email AND password changes (proven), so
//    the session survives; the header chip refreshes on next sign-in.
//  • Same sanitisation rules as the Phase-4 register route: generic
//    non-enumerating errors, nothing logged, nothing cached.
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { UPDATE_CUSTOMER, type CustomerProfile } from '@/lib/queries/customer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ENDPOINT = process.env.WP_GRAPHQL_ENDPOINT || process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || ''
const SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET

const GENERIC = 'We couldn’t save your changes. Please check the form and try again.'
const BAD_PASSWORD = 'Your current password didn’t match. Please try again.'

const VERIFY_LOGIN = `mutation VerifyPassword($username:String!,$password:String!){
  login(input:{clientMutationId:"verify-pw",username:$username,password:$password}){ authToken }
}`

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^\+?[0-9 ()-]{6,20}$/

async function gql(query: string, variables: Record<string, unknown>, bearer?: string) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json().catch(() => null)
}

export async function POST(req: NextRequest) {
  if (!SECRET || !ENDPOINT) {
    return NextResponse.json({ ok: false, message: 'Account updates are temporarily unavailable.' }, { status: 503 })
  }
  const token = await getToken({ req, secret: SECRET })
  const wpAuthToken = token?.wpAuthToken as string | undefined
  const sessionEmail = typeof token?.email === 'string' ? token.email : ''
  if (!token || !wpAuthToken) {
    return NextResponse.json({ ok: false, message: 'Please sign in again.' }, { status: 401 })
  }

  let body: Record<string, unknown> = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, message: GENERIC }, { status: 400 })
  }

  const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
  const firstName = str(body.firstName, 60)
  const lastName = str(body.lastName, 60)
  const email = str(body.email, 254)
  const phone = str(body.phone, 24)
  const country = str(body.country, 2).toUpperCase()
  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword.slice(0, 200) : ''
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword.slice(0, 200) : ''

  // Validation — mirror the client's inline rules.
  if (!firstName || !lastName) return NextResponse.json({ ok: false, message: 'Please add your first and last name.' }, { status: 400 })
  if (!EMAIL_RE.test(email)) return NextResponse.json({ ok: false, message: 'Please enter a valid email address.' }, { status: 400 })
  if (phone && !PHONE_RE.test(phone)) return NextResponse.json({ ok: false, message: 'Please enter a valid phone number.' }, { status: 400 })
  if (country && !/^[A-Z]{2}$/.test(country)) return NextResponse.json({ ok: false, message: GENERIC }, { status: 400 })
  if (newPassword && newPassword.length < 8) {
    return NextResponse.json({ ok: false, message: 'New password must be at least 8 characters.' }, { status: 400 })
  }

  try {
    // Password change gate: prove the CURRENT password first (bearer's own
    // account — this is identity confirmation, not enumeration).
    if (newPassword) {
      if (!currentPassword || !sessionEmail) {
        return NextResponse.json({ ok: false, message: BAD_PASSWORD }, { status: 400 })
      }
      const verify = await gql(VERIFY_LOGIN, { username: sessionEmail, password: currentPassword })
      if (!verify?.data?.login?.authToken) {
        return NextResponse.json({ ok: false, message: BAD_PASSWORD }, { status: 400 })
      }
    }

    const variables: Record<string, unknown> = {
      firstName,
      lastName,
      email,
      billing: { phone: phone || null, country: country || null },
    }
    if (newPassword) variables.password = newPassword

    const json = await gql(UPDATE_CUSTOMER, variables, wpAuthToken)
    const customer = (json?.data?.updateCustomer?.customer ?? null) as CustomerProfile | null
    if (!customer || json?.errors?.length) {
      // Generic copy — upstream messages can enumerate (e.g. email exists).
      return NextResponse.json({ ok: false, message: GENERIC }, { status: 200 })
    }
    return NextResponse.json({
      ok: true,
      customer,
      emailChanged: sessionEmail !== '' && customer.email !== null && customer.email !== sessionEmail,
      passwordChanged: Boolean(newPassword),
    })
  } catch {
    return NextResponse.json({ ok: false, message: GENERIC }, { status: 502 })
  }
}

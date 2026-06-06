// Profile read/update - Phase 5 + traveller-details extension.
// GET  -> bearer's own profile (incl. nationality/residency/gender meta) -
//         used by checkout prefill for signed-in customers.
// POST -> { firstName, lastName, email, phone, country, nationality?,
//           residency?, gender?, currentPassword?, newPassword? }.
// Security model (probe-driven, 2026-06-07):
//   - updateCustomer mutates ONLY the bearer (cross-customer attempt ->
//     capability error, proven) - but it does NOT ask for the current
//     password. We therefore verify the current password ourselves (a login
//     mutation for the bearer's own email) before applying a password change.
//   - The WP JWT stays valid after email AND password changes (proven), so
//     the session survives; the header chip refreshes on next sign-in.
//   - Same sanitisation rules as the Phase-4 register route: generic
//     non-enumerating errors, nothing logged, nothing cached.
//   - Traveller extras persist as customer metaData (uaej_* keys) - schema
//     probed live 2026-06-07 (metaData input + keysIn read-back accepted).
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { GET_CUSTOMER_PROFILE, UPDATE_CUSTOMER, type CustomerProfile } from '@/lib/queries/customer'
import { isGender, isNationality, isResidency, fieldsToMeta, metaToFields } from '@/lib/profile-fields'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ENDPOINT = process.env.WP_GRAPHQL_ENDPOINT || process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || ''
const SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET

const GENERIC = 'We could not save your changes. Please check the form and try again.'
const BAD_PASSWORD = 'Your current password did not match. Please try again.'

const VERIFY_LOGIN = `mutation VerifyPassword($username:String!,$password:String!){
login(input:{clientMutationId:"verify-pw",username:$username,password:$password}){ authToken }
}`

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^\+?[0-9 ()-]{6,20}$/

// getToken with cookie-name probing - on https the Auth.js cookie is
// `__Secure-authjs.session-token`, which a plain getToken() call can miss
// (same probing as lib/account/api.getWpAuthToken, proven Phase 5).
async function getSessionToken(req: NextRequest) {
  if (!SECRET) return null
  for (const cookieName of [undefined, '__Secure-authjs.session-token', 'authjs.session-token']) {
    try {
      const token = await getToken({ req, secret: SECRET, ...(cookieName ? { cookieName } : {}) })
      if (token && typeof token.wpAuthToken === 'string' && token.wpAuthToken) return token
    } catch {
      /* try next cookie name */
    }
  }
  return null
}

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

function profileJson(customer: CustomerProfile) {
  const meta = metaToFields(customer.metaData)
  return {
    firstName: customer.firstName ?? '',
    lastName: customer.lastName ?? '',
    email: customer.email ?? '',
    phone: customer.billing?.phone ?? '',
    country: customer.billing?.country ?? '',
    nationality: meta.nationality,
    residency: meta.residency,
    gender: meta.gender,
  }
}

/** Signed-in customer's own profile - consumed by the checkout prefill. */
export async function GET(req: NextRequest) {
  if (!SECRET || !ENDPOINT) {
    return NextResponse.json({ ok: false }, { status: 503 })
  }
  const token = await getSessionToken(req)
  const wpAuthToken = token?.wpAuthToken as string | undefined
  if (!token || !wpAuthToken) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  try {
    const json = await gql(GET_CUSTOMER_PROFILE, {}, wpAuthToken)
    const customer = (json?.data?.customer ?? null) as CustomerProfile | null
    if (!customer || json?.errors?.length) {
      return NextResponse.json({ ok: false }, { status: 502 })
    }
    return NextResponse.json({ ok: true, profile: profileJson(customer) })
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 })
  }
}

export async function POST(req: NextRequest) {
  if (!SECRET || !ENDPOINT) {
    return NextResponse.json({ ok: false, message: 'Account updates are temporarily unavailable.' }, { status: 503 })
  }
  const token = await getSessionToken(req)
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
  const nationality = str(body.nationality, 2).toUpperCase()
  const residency = str(body.residency, 20)
  const gender = str(body.gender, 20)
  const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword.slice(0, 200) : ''
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword.slice(0, 200) : ''

  // Validation - mirror the client's inline rules. Traveller extras are
  // OPTIONAL here (progressive profiling) but must be valid when present.
  if (!firstName || !lastName) return NextResponse.json({ ok: false, message: 'Please add your first and last name.' }, { status: 400 })
  if (!EMAIL_RE.test(email)) return NextResponse.json({ ok: false, message: 'Please enter a valid email address.' }, { status: 400 })
  if (phone && !PHONE_RE.test(phone)) return NextResponse.json({ ok: false, message: 'Please enter a valid phone number.' }, { status: 400 })
  if (country && !/^[A-Z]{2}$/.test(country)) return NextResponse.json({ ok: false, message: GENERIC }, { status: 400 })
  if (nationality && !isNationality(nationality)) return NextResponse.json({ ok: false, message: GENERIC }, { status: 400 })
  if (residency && !isResidency(residency)) return NextResponse.json({ ok: false, message: GENERIC }, { status: 400 })
  if (gender && !isGender(gender)) return NextResponse.json({ ok: false, message: GENERIC }, { status: 400 })
  if (newPassword && newPassword.length < 8) {
    return NextResponse.json({ ok: false, message: 'New password must be at least 8 characters.' }, { status: 400 })
  }

  try {
    // Password change gate: prove the CURRENT password first (bearer's own
    // account - this is identity confirmation, not enumeration).
    if (newPassword) {
      if (!currentPassword || !sessionEmail) {
        return NextResponse.json({ ok: false, message: BAD_PASSWORD }, { status: 400 })
      }
      const verify = await gql(VERIFY_LOGIN, { username: sessionEmail, password: currentPassword })
      if (!verify?.data?.login?.authToken) {
        return NextResponse.json({ ok: false, message: BAD_PASSWORD }, { status: 400 })
      }
    }

    const meta = fieldsToMeta({ nationality, residency, gender })
    const variables: Record<string, unknown> = {
      firstName,
      lastName,
      email,
      billing: { phone: phone || null, country: country || null },
      ...(meta.length ? { metaData: meta } : {}),
    }
    if (newPassword) variables.password = newPassword

    const json = await gql(UPDATE_CUSTOMER, variables, wpAuthToken)
    const customer = (json?.data?.updateCustomer?.customer ?? null) as CustomerProfile | null
    if (!customer || json?.errors?.length) {
      // Generic copy - upstream messages can enumerate (e.g. email exists).
      return NextResponse.json({ ok: false, message: GENERIC }, { status: 200 })
    }
    return NextResponse.json({
      ok: true,
      customer,
      profile: profileJson(customer),
      emailChanged: sessionEmail !== '' && customer.email !== null && customer.email !== sessionEmail,
      passwordChanged: Boolean(newPassword),
    })
  } catch {
    return NextResponse.json({ ok: false, message: GENERIC }, { status: 502 })
  }
}

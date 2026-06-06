// Server-only account data layer — Phase 5 (account sub-pages).
// One helper, customerFetch(), through which ALL personal data flows:
//  • Reads the WP authToken from the NextAuth JWT cookie SERVER-SIDE
//    (the token never reaches the browser — same guarantee as /api/account/me).
//  • Injects `Authorization: Bearer` + cache:'no-store' (PII is never cached).
//  • Ownership is enforced upstream: WPGraphQL JWT resolves `customer`,
//    `myLoyalty`, `myPointsHistory` ONLY for the bearer (two-customer matrix
//    proven live 2026-06-07 — see PHASE-5 report §2).
// Never import this from a client component (uses next/headers — Next.js
// itself hard-fails such an import at build time; no `server-only` dep needed).
import { cookies } from 'next/headers'
import { getToken } from 'next-auth/jwt'

const ENDPOINT = process.env.WP_GRAPHQL_ENDPOINT || process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || ''
const SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET

export type CustomerFetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: 'unauthenticated' | 'unconfigured' | 'upstream' }

/** Read the WP JWT from the (httpOnly, encrypted) NextAuth cookie — server only. */
export async function getWpAuthToken(): Promise<string | null> {
  if (!SECRET) return null
  try {
    const store = await cookies()
    const cookie = store.getAll().map((c) => `${c.name}=${c.value}`).join('; ')
    if (!cookie) return null
    const req = { headers: { cookie } } as Parameters<typeof getToken>[0]['req']
    // Auth.js v5 names the cookie `authjs.session-token` (or the __Secure-
    // prefixed variant on https). Probe both — plain-object reqs can't infer it.
    for (const cookieName of [undefined, '__Secure-authjs.session-token', 'authjs.session-token']) {
      try {
        const token = await getToken({ req, secret: SECRET, ...(cookieName ? { cookieName } : {}) })
        const wp = token?.wpAuthToken
        if (typeof wp === 'string' && wp) return wp
      } catch {
        /* try next cookie name */
      }
    }
  } catch {
    /* fall through */
  }
  return null
}

/**
 * Bearer-authed GraphQL fetch for the signed-in customer's OWN data.
 * Returns a typed result — callers render designed empty/error states,
 * never throw to the user.
 */
export async function customerFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<CustomerFetchResult<T>> {
  if (!ENDPOINT || !SECRET) return { ok: false, reason: 'unconfigured' }
  const wpAuthToken = await getWpAuthToken()
  if (!wpAuthToken) return { ok: false, reason: 'unauthenticated' }
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${wpAuthToken}`,
      },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store',
    })
    if (!res.ok) return { ok: false, reason: 'upstream' }
    const json = await res.json().catch(() => null)
    if (!json || json.errors?.length || !json.data) return { ok: false, reason: 'upstream' }
    return { ok: true, data: json.data as T }
  } catch {
    return { ok: false, reason: 'upstream' }
  }
}

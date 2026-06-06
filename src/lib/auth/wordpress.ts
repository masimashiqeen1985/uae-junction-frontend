// WordPress credential authentication via the WPGraphQL JWT login mutation.
// GATED + best-effort: returns null on ANY failure (missing JWT plugin, the
// known request-time container→CMS connectivity issue, bad credentials) so the
// sign-in flow degrades gracefully and never throws at request time.
//
// Phase 4 (2026-06-07): wp-graphql-jwt-authentication v0.7.0 is now ACTIVE on
// cms.theuaejunction.cloud (login/refreshJwtAuthToken proven live). This module
// now also surfaces the WP authToken/refreshToken so auth.ts can stash them in
// the NextAuth JWT (httpOnly cookie — NEVER exposed to the client session).

const ENDPOINT = process.env.WP_GRAPHQL_ENDPOINT || process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT

export type WpAuthUser = {
  id: string
  name: string
  email: string
  image?: string | null
  // Server-side only — stripped before anything reaches the client session.
  wpAuthToken?: string | null
  wpRefreshToken?: string | null
}

const LOGIN = `mutation LoginUser($username:String!,$password:String!){
  login(input:{clientMutationId:"web-signin",username:$username,password:$password}){
    authToken
    refreshToken
    user { databaseId name email avatar { url } }
  }
}`

export async function authenticateWithWordpress(
  username: string,
  password: string,
): Promise<WpAuthUser | null> {
  if (!ENDPOINT || !username || !password) return null
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: LOGIN, variables: { username, password } }),
      cache: 'no-store',
    })
    if (!res.ok) return null
    const json = await res.json()
    const login = json?.data?.login
    const u = login?.user
    if (!u || json?.errors) return null
    return {
      id: String(u.databaseId),
      name: u.name as string,
      email: u.email as string,
      image: u.avatar?.url ?? null,
      wpAuthToken: login?.authToken ?? null,
      wpRefreshToken: login?.refreshToken ?? null,
    }
  } catch {
    return null
  }
}

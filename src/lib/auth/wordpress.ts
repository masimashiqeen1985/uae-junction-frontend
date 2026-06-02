// WordPress credential authentication via the WPGraphQL JWT login mutation.
// GATED + best-effort: returns null on ANY failure (missing JWT plugin, the
// known request-time container→CMS connectivity issue, bad credentials) so the
// sign-in flow degrades gracefully and never throws at request time.
//
// ⚠️ INFRA: live credential login requires (1) a WPGraphQL JWT auth plugin on
// cms.theuaejunction.cloud and (2) the runtime container→CMS fetch fix. Until
// both are approved + in place, this returns null and the UI shows a friendly
// "sign-in temporarily unavailable" state. No fake auth is performed.

const ENDPOINT = process.env.WP_GRAPHQL_ENDPOINT || process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT

export type WpAuthUser = {
  id: string
  name: string
  email: string
  image?: string | null
}

const LOGIN = `mutation LoginUser($username:String!,$password:String!){
  login(input:{clientMutationId:"web-signin",username:$username,password:$password}){
    authToken
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
    const u = json?.data?.login?.user
    if (!u || json?.errors) return null
    return {
      id: String(u.databaseId),
      name: u.name as string,
      email: u.email as string,
      image: u.avatar?.url ?? null,
    }
  } catch {
    return null
  }
}

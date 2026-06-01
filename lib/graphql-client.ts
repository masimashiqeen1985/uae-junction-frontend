const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!

/**
 * Centralised GraphQL fetcher — all WPGraphQL calls go through here.
 * Uses Next.js 15 fetch with ISR revalidation.
 * @param revalidate  Seconds until cache expires. Pass `false` to never revalidate.
 */
export async function fetchGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>,
  revalidate: number | false = 3600
): Promise<T> {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    next: { revalidate },
  })

  if (!res.ok) {
    throw new Error(`WPGraphQL fetch failed: ${res.status} ${res.statusText}`)
  }

  const json = await res.json()

  if (json.errors?.length) {
    console.error('WPGraphQL errors:', JSON.stringify(json.errors, null, 2))
    throw new Error(json.errors[0].message ?? 'WPGraphQL error')
  }

  return json.data as T
}

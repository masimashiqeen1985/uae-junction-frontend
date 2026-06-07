import { NextResponse } from 'next/server'
import { fetchGraphQL } from '@/lib/graphql-client'
import { MEDIA_FIELDS } from '@/lib/queries/fragments'

// Always run on request — search is user-driven and must not be cached per build.
export const dynamic = 'force-dynamic'

const SEARCH_ALL = `query SearchAll($term:String!,$first:Int=8){destinations(first:3,where:{search:$term,hideEmpty:true}){nodes{name slug count parent{node{name}}}}products(first:$first,where:{search:$term,status:"publish"}){nodes{databaseId slug name onSale image{${MEDIA_FIELDS}} ... on SimpleProduct{regularPrice salePrice price}}}}`

type ProductNode = {
  databaseId: number
  slug: string
  name: string
  onSale: boolean | null
  image: { sourceUrl: string; altText: string | null } | null
  regularPrice?: string | null
  salePrice?: string | null
  price?: string | null
}

type DestinationNode = {
  name: string
  slug: string
  count: number | null
  parent?: { node: { name: string } } | null
}

export type SearchResult = {
  id: number
  slug: string
  name: string
  onSale: boolean
  price: string | null
  regularPrice: string | null
  image: { sourceUrl: string; altText: string } | null
}

export type DestinationResult = {
  slug: string
  name: string
  count: number
  country: string | null
}

export async function GET(req: Request): Promise<Response> {
  const term = new URL(req.url).searchParams.get('q')?.trim() ?? ''
  if (term.length < 2)
    return NextResponse.json({ results: [] as SearchResult[], destinations: [] as DestinationResult[] })

  try {
    const data = await fetchGraphQL<{
      destinations: { nodes: DestinationNode[] } | null
      products: { nodes: ProductNode[] } | null
    }>(SEARCH_ALL, { term, first: 8 }, false)

    const destinations: DestinationResult[] = (data.destinations?.nodes ?? [])
      .filter((d) => (d.count ?? 0) > 0)
      .map((d) => ({
        slug: d.slug,
        name: d.name,
        count: d.count ?? 0,
        country: d.parent?.node?.name ?? null,
      }))

    const results: SearchResult[] = (data.products?.nodes ?? []).map((n) => ({
      id: n.databaseId,
      slug: n.slug,
      name: n.name,
      onSale: Boolean(n.onSale),
      price: n.price ?? n.regularPrice ?? null,
      regularPrice: n.regularPrice ?? null,
      image: n.image?.sourceUrl
        ? { sourceUrl: n.image.sourceUrl, altText: n.image.altText || n.name }
        : null,
    }))
    return NextResponse.json({ results, destinations })
  } catch {
    // Defensive: never surface a 500 to the header — return an empty, flagged payload.
    return NextResponse.json({ results: [] as SearchResult[], destinations: [] as DestinationResult[], error: 'search_failed' })
  }
}

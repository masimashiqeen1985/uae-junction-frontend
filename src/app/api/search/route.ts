import { NextResponse } from 'next/server'
import { fetchGraphQL } from '@/lib/graphql-client'
import { MEDIA_FIELDS } from '@/lib/queries/fragments'

// Always run on request — search is user-driven and must not be cached per build.
export const dynamic = 'force-dynamic'

const SEARCH_PRODUCTS = `query SearchProducts($term:String!,$first:Int=8){products(first:$first,where:{search:$term,status:"publish"}){nodes{databaseId slug name onSale image{${MEDIA_FIELDS}} ... on SimpleProduct{regularPrice salePrice price}}}}`

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

export type SearchResult = {
  id: number
  slug: string
  name: string
  onSale: boolean
  price: string | null
  regularPrice: string | null
  image: { sourceUrl: string; altText: string } | null
}

export async function GET(req: Request): Promise<Response> {
  const term = new URL(req.url).searchParams.get('q')?.trim() ?? ''
  if (term.length < 2) return NextResponse.json({ results: [] as SearchResult[] })

  try {
    const data = await fetchGraphQL<{ products: { nodes: ProductNode[] } | null }>(
      SEARCH_PRODUCTS,
      { term, first: 8 },
      false,
    )
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
    return NextResponse.json({ results })
  } catch {
    // Defensive: never surface a 500 to the header — return an empty, flagged payload.
    return NextResponse.json({ results: [] as SearchResult[], error: 'search_failed' })
  }
}

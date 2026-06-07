import type { Metadata } from 'next'
import { VibrantHome } from '@/components/home/VibrantHome'
import type { HeroCountry } from '@/components/home/HeroSearch'
import { fetchGraphQL } from '@/lib/graphql-client'
import { GET_DESTINATIONS } from '@/lib/queries/destinations'

export const metadata: Metadata = {
  title: 'The UAE Junction — Travel Deals with 2.5% Cashback',
  description:
    'Book theme parks, desert safari, dhow cruise, hotels & flights in the UAE. Get 2.5% cashback on every booking.',
}
export const revalidate = 3600

type DestNode = {
  databaseId: number
  name: string
  slug: string
  count: number | null
  parentDatabaseId: number | null
  children: { nodes: { name: string; slug: string; count: number | null }[] } | null
}

/** Country -> City tree for the hero search WHERE field. Defensive: on any
 *  failure return [] and HeroSearch falls back to its hardcoded list. */
async function getHeroDestinations(): Promise<HeroCountry[]> {
  try {
    const data = await fetchGraphQL<{ destinations: { nodes: DestNode[] } | null }>(GET_DESTINATIONS, {}, 3600)
    return (data.destinations?.nodes ?? [])
      .filter((n) => !n.parentDatabaseId)
      .map((c) => ({
        name: c.name,
        slug: c.slug,
        cities: (c.children?.nodes ?? [])
          .map((x) => ({ name: x.name, slug: x.slug, count: x.count ?? 0 }))
          .sort((a, b) => b.count - a.count),
      }))
      .sort((a, b) => (b.cities.reduce((s, x) => s + x.count, 0)) - (a.cities.reduce((s, x) => s + x.count, 0)))
  } catch {
    return []
  }
}

export default async function HomePage() {
  const destinations = await getHeroDestinations()
  return <VibrantHome destinations={destinations} />
}

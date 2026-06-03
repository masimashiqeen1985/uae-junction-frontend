import { fetchGraphQL } from '@/lib/graphql-client'
import { authProviderFlags } from '@/auth'
import { HeaderClient } from './HeaderClient'
import type { NavItem } from './nav-types'

// Hardcoded fallback — used if WordPress / WPGraphQL is unreachable or returns no menu.
const FALLBACK_NAV: NavItem[] = [
  { label: 'Hot Deals', href: '/promotion' },
  {
    label: 'Explore & Book', href: '#', children: [
      { label: 'Theme Parks', href: '/theme-parks' },
      { label: 'Water Parks', href: '/water-parks' },
      { label: 'Desert Safari', href: '/desert-safari' },
      { label: 'Dhow Cruise', href: '/dhow-cruise' },
      { label: 'Experiences', href: '/experiences' },
      { label: 'UAE City Tours', href: '/uae-city-tours' },
      { label: 'Hotel Booking', href: '/hotel-booking' },
      { label: 'Flight Booking', href: '/flight-booking' },
      { label: 'Umrah Packages', href: '/umrah-packages' },
    ],
  },
  { label: 'Around the World', href: '/#countries' },
  { label: 'Blogs', href: '/blogs' },
]

const PRIMARY_MENU_QUERY = `query PrimaryMenu {
  menuItems(where: { location: PRIMARY, parentDatabaseId: 0 }, first: 50) {
    nodes {
      label
      uri
      childItems { nodes { label uri } }
    }
  }
}`

type MenuResponse = {
  menuItems: {
    nodes: {
      label: string
      uri: string | null
      childItems: { nodes: { label: string; uri: string | null }[] }
    }[]
  }
}

async function getNav(): Promise<NavItem[]> {
  try {
    const data = await fetchGraphQL<MenuResponse>(PRIMARY_MENU_QUERY)
    const nodes = data?.menuItems?.nodes ?? []
    if (!nodes.length) return FALLBACK_NAV
    return nodes.map((n) => {
      const children = n.childItems?.nodes ?? []
      return {
        label: n.label,
        href: n.uri || '#',
        children: children.length
          ? children.map((c) => ({ label: c.label, href: c.uri || '#' }))
          : undefined,
      }
    })
  } catch {
    return FALLBACK_NAV
  }
}

export async function Header() {
  const nav = await getNav()
  return (
    <HeaderClient
      nav={nav}
      providers={{ google: authProviderFlags.google, facebook: authProviderFlags.facebook }}
      authConfigured={authProviderFlags.configured}
    />
  )
}

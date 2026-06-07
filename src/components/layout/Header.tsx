import { fetchGraphQL } from '@/lib/graphql-client'
import { authProviderFlags } from '@/auth'
import { HeaderClient } from './HeaderClient'
import type { NavItem } from './nav-types'

// Product categories live at /category/<slug>. Code-controlled (tied to fixed
// routes) so the menu is reliable whether or not the WP menu lists them.
const CATEGORY_NAV: NavItem = {
  label: 'Categories',
  href: '/category',
  children: [
    { label: 'Theme Parks & Attractions', href: '/category/theme-parks-attractions' },
    { label: 'Water Parks', href: '/category/water-parks' },
    { label: 'Adventure & Thrill', href: '/category/adventure-thrill' },
    { label: 'Landmarks & Views', href: '/category/landmarks-views' },
    { label: 'Gardens & Nature', href: '/category/gardens-nature' },
    { label: 'Museums & Culture', href: '/category/museums-culture-immersive' },
    { label: 'Desert Safari', href: '/category/desert-safari' },
    { label: 'City Tours', href: '/category/city-tours' },
    { label: 'Cruises', href: '/category/cruises' },
    { label: 'Combo Passes', href: '/category/combo-passes' },
    { label: 'Staycations & Hotels', href: '/category/staycations-hotels' },
    { label: 'Umrah Packages', href: '/category/umrah-packages' },
    { label: 'International Tours', href: '/category/international-tours' },
  ],
}

// Hardcoded fallback — used if WordPress / WPGraphQL is unreachable or returns no menu.
const FALLBACK_NAV: NavItem[] = [
  { label: 'Hot Deals', href: '/promotions' },
  // Not a dropdown: clicking scrolls to the category slider on the homepage.
  { label: 'Explore & Book', href: '/#explore-book' },
  CATEGORY_NAV,
  { label: 'Around the World', href: '/#countries' },
  { label: 'Blogs', href: '/blogs' },
]

// Ensure the Categories mega-menu is present exactly once, placed after
// "Explore & Book" when that item exists, otherwise appended near the end.
function withCategories(items: NavItem[]): NavItem[] {
  if (items.some((i) => i.label?.toLowerCase() === 'categories')) return items
  const out = [...items]
  const idx = out.findIndex((i) => i.label?.toLowerCase().startsWith('explore'))
  if (idx >= 0) out.splice(idx + 1, 0, CATEGORY_NAV)
  else out.push(CATEGORY_NAV)
  return out
}

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
    const data = await fetchGraphQL<MenuResponse>(PRIMARY_MENU_QUERY, undefined, 0)
    const nodes = data?.menuItems?.nodes ?? []
    if (!nodes.length) return FALLBACK_NAV
    const mapped = nodes.map((n) => {
      // "Explore & Book" is intentionally a scroll-to-slider link, never a dropdown.
      if (n.label?.toLowerCase().startsWith('explore')) {
        return { label: n.label, href: '/#explore-book' }
      }
      const children = n.childItems?.nodes ?? []
      return {
        label: n.label,
        href: n.uri || '#',
        children: children.length
          ? children.map((c) => ({ label: c.label, href: c.uri || '#' }))
          : undefined,
      }
    })
    return withCategories(mapped)
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

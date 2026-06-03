import type { MetadataRoute } from 'next'

const B = 'https://www.theuaejunction.cloud'
const now = new Date()

// Static, indexable routes. Dynamic product/blog routes are appended in a later
// phase once the CMS supplies them. Account/cart/checkout are excluded (see robots).
const routes: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }> = [
  { path: '', changeFrequency: 'daily', priority: 1 },
  { path: '/theme-parks', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/water-parks', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/desert-safari', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/dhow-cruise', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/experiences', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/uae-city-tours', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/umrah-packages', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/hotel-booking', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/flight-booking', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/group-corporate-bookings', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/promotions', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/blogs', changeFrequency: 'daily', priority: 0.7 },
  { path: '/about-us', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/contact-us', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/careers', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms-and-conditions', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/rewards-policy', changeFrequency: 'yearly', priority: 0.3 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({
    url: B + r.path,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))
}

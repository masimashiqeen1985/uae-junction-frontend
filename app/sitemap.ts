import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://theuaejunction.cloud'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '/',
    '/about-us',
    '/contact-us',
    '/promotion',
    '/blogs',
    '/career',
    '/privacy-policy',
    '/terms-and-conditions',
    '/rewards-policy',
    '/group-corporate-bookings',
    '/theme-parks',
    '/water-park-tickets',
    '/desert-safari-packages',
    '/dubai-dhow-cruise',
    '/experiences',
    '/uae-city-tours',
    '/hotel-booking',
    '/flight-booking',
    '/umrah-packages',
  ]

  return staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/' ? 'daily' : 'weekly',
    priority: route === '/' ? 1 : 0.8,
  }))
}

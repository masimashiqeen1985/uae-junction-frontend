import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/my-account/', '/cart/', '/checkout/'],
    },
    sitemap: 'https://www.theuaejunction.cloud/sitemap.xml',
    host: 'https://www.theuaejunction.cloud',
  }
}

import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cms.theuaejunction.cloud', pathname: '/**' },
      { protocol: 'https', hostname: 'theuaejunction.cloud', pathname: '/**' },
      { protocol: 'https', hostname: 'theuaejunction.com', pathname: '/**' },
      { protocol: 'https', hostname: 'i0.wp.com', pathname: '/**' },
      { protocol: 'https', hostname: 'i1.wp.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
}
export default nextConfig
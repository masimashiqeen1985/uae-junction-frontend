import type { NextConfig } from 'next'
const nextConfig: NextConfig = { images: { remotePatterns: [{protocol:'https',hostname:'cms.theuaejunction.cloud',pathname:'/**'},{protocol:'https',hostname:'theuaejunction.cloud',pathname:'/**'},{protocol:'https',hostname:'i0.wp.com',pathname:'/**'}], formats:['image/avif','image/webp'] } }
export default nextConfig
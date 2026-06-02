import type { Metadata } from 'next'
import { Poppins, Inter } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://theuaejunction.cloud'
  ),
  title: {
    default: 'The UAE Junction — Your Journey Is Our Passion',
    template: '%s | The UAE Junction',
  },
  description:
    'Book theme parks, desert safaris, dhow cruises, water parks, and more in the UAE. Earn 4% cashback on every booking.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://theuaejunction.cloud',
    siteName: 'The UAE Junction',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'The UAE Junction',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@UAEJunction',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}

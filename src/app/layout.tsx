import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppButton } from '@/components/layout/WhatsAppButton'
import { GroupCorporateTab } from '@/components/layout/GroupCorporateTab'
import { SiteChrome } from '@/components/layout/SiteChrome'
import { SessionWrapper } from '@/components/providers/SessionWrapper'
import { CartProvider } from '@/components/cart/CartProvider'
import { authProviderFlags } from '@/auth'

const SITE_URL = 'https://www.theuaejunction.cloud'
const SITE_DESC =
  'The UAE Junction provides flights, hotels, theme park tickets, desert safari, dhow cruise & holiday packages with 4% cashback.'

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'The UAE Junction',
  url: SITE_URL,
  description: SITE_DESC,
}
const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'The UAE Junction',
  url: SITE_URL,
  inLanguage: 'en-AE',
}

export const metadata: Metadata = {
  title: {
    default: 'The UAE Junction — Travel Deals with 4% Cashback',
    template: '%s | The UAE Junction',
  },
  description: SITE_DESC,
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
  openGraph: {
    siteName: 'The UAE Junction',
    locale: 'en_AE',
    type: 'website',
    url: SITE_URL,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const body = (
    <SiteChrome
      header={<Header />}
      footer={<Footer />}
      extras={<><WhatsAppButton /><GroupCorporateTab /></>}
    >
      {children}
    </SiteChrome>
  )
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
        {/* SessionProvider only mounts when auth is configured (AUTH_SECRET present),
            so the live site never polls /api/auth/session before secrets exist. */}
        <CartProvider>{authProviderFlags.configured ? <SessionWrapper>{body}</SessionWrapper> : body}</CartProvider>
      </body>
    </html>
  )
}

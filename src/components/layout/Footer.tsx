import Link from 'next/link'
import { fetchGraphQL } from '@/lib/graphql-client'
import { FOOTER_MENUS_QUERY, FOOTER_OPTIONS_QUERY } from '@/lib/queries/footer'

type FooterLink = { label: string; href: string; external?: boolean }

// ---------- Hardcoded fallbacks (current footer content) ----------
const FALLBACK_QUICK: FooterLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about-us' },
  { label: 'Contact Us', href: '/contact-us' },
  { label: 'Blogs', href: '/blogs' },
  { label: 'Careers', href: '/careers' },
]
const FALLBACK_PACKAGES: FooterLink[] = [
  { label: 'Theme Parks', href: '/theme-parks' },
  { label: 'Water Parks', href: '/water-parks' },
  { label: 'Desert Safari', href: '/desert-safari' },
  { label: 'Dhow Cruise', href: '/dhow-cruise' },
  { label: 'Experiences', href: '/experiences' },
  { label: 'Hotel Booking', href: '/hotel-booking' },
  { label: 'Flight Booking', href: '/flight-booking' },
  { label: 'Umrah Packages', href: '/umrah-packages' },
]
const FALLBACK_LEGAL: FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms-and-conditions' },
  { label: 'Rewards Policy', href: '/rewards-policy' },
]
const FALLBACK_OPTIONS = {
  phoneNumber: '+971 58 589 8221',
  emailAddress: 'sales@theuaejunction.com',
  whatsappNumber: '971585898221',
  footerTagline:
    'Your gateway to global exploration. 4% Cashback on all travel bookings.',
  socialLinks: [
    { platform: 'Facebook', url: '#' },
    { platform: 'LinkedIn', url: '#' },
    { platform: 'YouTube', url: '#' },
    { platform: 'TikTok', url: '#' },
  ] as { platform: string; url: string }[],
}

const SOCIAL_ABBR: Record<string, string> = {
  facebook: 'f', linkedin: 'in', youtube: 'yt', tiktok: 'tt',
  instagram: 'ig', twitter: 'x', x: 'x', whatsapp: 'wa',
}

// ---------- CMS fetch (best-effort, independent fallbacks) ----------
type MenuNode = { name: string; menuItems: { nodes: { label: string; uri: string | null; target: string | null }[] } }
type MenusResponse = { menus: { nodes: MenuNode[] } }
type OptionsResponse = { siteOptions: typeof FALLBACK_OPTIONS | null }

function toLinks(node?: MenuNode): FooterLink[] | null {
  const items = node?.menuItems?.nodes ?? []
  if (!items.length) return null
  return items.map((i) => {
    const href = i.uri || '#'
    return { label: i.label, href, external: i.target === '_blank' || /^https?:\/\//.test(href) }
  })
}

async function getMenus() {
  try {
    const data = await fetchGraphQL<MenusResponse>(FOOTER_MENUS_QUERY)
    const nodes = data?.menus?.nodes ?? []
    const find = (name: string) =>
      nodes.find((n) => n.name?.trim().toLowerCase() === name)
    return {
      quick: toLinks(find('footer quick links')) ?? FALLBACK_QUICK,
      packages: toLinks(find('footer packages')) ?? FALLBACK_PACKAGES,
      legal: toLinks(find('footer legal')) ?? FALLBACK_LEGAL,
    }
  } catch {
    return { quick: FALLBACK_QUICK, packages: FALLBACK_PACKAGES, legal: FALLBACK_LEGAL }
  }
}

async function getOptions() {
  try {
    const data = await fetchGraphQL<OptionsResponse>(FOOTER_OPTIONS_QUERY)
    const o = data?.siteOptions
    if (!o) return FALLBACK_OPTIONS
    return {
      phoneNumber: o.phoneNumber || FALLBACK_OPTIONS.phoneNumber,
      emailAddress: o.emailAddress || FALLBACK_OPTIONS.emailAddress,
      whatsappNumber: o.whatsappNumber || FALLBACK_OPTIONS.whatsappNumber,
      footerTagline: o.footerTagline || FALLBACK_OPTIONS.footerTagline,
      socialLinks: o.socialLinks?.length ? o.socialLinks : FALLBACK_OPTIONS.socialLinks,
    }
  } catch {
    return FALLBACK_OPTIONS
  }
}

function FooterLinks({ links }: { links: FooterLink[] }) {
  return (
    <ul className="space-y-2">
      {links.map((l) =>
        l.external ? (
          <li key={l.label + l.href}>
            <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary transition-colors">{l.label}</a>
          </li>
        ) : (
          <li key={l.label + l.href}>
            <Link href={l.href} className="text-sm hover:text-primary transition-colors">{l.label}</Link>
          </li>
        )
      )}
    </ul>
  )
}

export async function Footer() {
  const [menus, opt] = await Promise.all([getMenus(), getOptions()])
  const telHref = `tel:${opt.phoneNumber.replace(/[^+\d]/g, '')}`
  const waDigits = opt.whatsappNumber.replace(/[^\d]/g, '')

  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="container-xl py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="font-display font-bold text-xl text-white mb-4">THE UAE <span className="text-primary">JUNCTION</span></div>
            <p className="text-sm text-neutral-400 mb-6 leading-relaxed">{opt.footerTagline}</p>
            <div className="space-y-2 text-sm">
              <a href={telHref} className="block hover:text-primary transition-colors">📞 {opt.phoneNumber}</a>
              <a href={`mailto:${opt.emailAddress}`} className="block hover:text-primary transition-colors">✉️ {opt.emailAddress}</a>
            </div>
          </div>
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Quick Links</h3>
            <FooterLinks links={menus.quick} />
          </div>
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Our Packages</h3>
            <FooterLinks links={menus.packages} />
          </div>
          <div>
            <h3 className="font-display font-semibold text-white mb-4">Connect With Us</h3>
            <div className="flex gap-3 mb-6">
              {opt.socialLinks.map((s) => (
                <a
                  key={s.platform + s.url}
                  href={s.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.platform}
                  className="w-9 h-9 rounded-full bg-neutral-700 hover:bg-primary flex items-center justify-center text-xs transition-colors"
                >
                  {SOCIAL_ABBR[s.platform?.toLowerCase()] ?? s.platform?.slice(0, 2).toLowerCase()}
                </a>
              ))}
            </div>
            <a href={`https://wa.me/${waDigits}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-btn text-sm font-semibold transition-colors">💬 WhatsApp Us</a>
          </div>
        </div>
        <div className="border-t border-neutral-700 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
          <p>© {new Date().getFullYear()} The UAE Junction. All rights reserved.</p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {menus.legal.map((l) => (
              <li key={l.label + l.href}>
                <Link href={l.href} className="hover:text-primary transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}

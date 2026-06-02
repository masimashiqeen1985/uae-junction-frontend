import Link from 'next/link'
import { Phone, Mail, MapPin, MessageCircle, Facebook, Instagram, Youtube, Linkedin, Twitter, Music2 } from 'lucide-react'
import { fetchGraphQL } from '@/lib/graphql-client'
import { FOOTER_MENUS_QUERY, FOOTER_OPTIONS_QUERY } from '@/lib/queries/footer'
import { Reveal } from '@/components/motion/Reveal'
import { NewsletterForm } from './NewsletterForm'

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
    'Your gateway to global exploration. Earn 4% cashback on every flight, hotel, tour and ticket you book with us.',
  socialLinks: [
    { platform: 'Facebook', url: '#' },
    { platform: 'Instagram', url: '#' },
    { platform: 'LinkedIn', url: '#' },
    { platform: 'YouTube', url: '#' },
  ] as { platform: string; url: string }[],
}

const SOCIAL_ICON: Record<string, typeof Facebook> = {
  facebook: Facebook, instagram: Instagram, youtube: Youtube,
  linkedin: Linkedin, twitter: Twitter, x: Twitter, tiktok: Music2,
}

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
    const find = (name: string) => nodes.find((n) => n.name?.trim().toLowerCase() === name)
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
    <ul className="space-y-2.5">
      {links.map((l) => (
        <li key={l.label + l.href}>
          {l.external ? (
            <a href={l.href} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center text-sm text-neutral-400 transition-colors hover:text-[var(--c-primary)]">
              <span className="mr-0 h-px w-0 bg-[var(--c-primary)] transition-all duration-300 group-hover:mr-2 group-hover:w-3" />
              {l.label}
            </a>
          ) : (
            <Link href={l.href} className="group inline-flex items-center text-sm text-neutral-400 transition-colors hover:text-[var(--c-primary)]">
              <span className="mr-0 h-px w-0 bg-[var(--c-primary)] transition-all duration-300 group-hover:mr-2 group-hover:w-3" />
              {l.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  )
}

export async function Footer() {
  const [menus, opt] = await Promise.all([getMenus(), getOptions()])
  const telHref = `tel:${opt.phoneNumber.replace(/[^+\d]/g, '')}`
  const waDigits = opt.whatsappNumber.replace(/[^\d]/g, '')

  return (
    <footer className="relative overflow-hidden bg-[#0E1726] text-neutral-300">
      {/* decorative glow */}
      <div className="pointer-events-none absolute -top-32 left-1/4 h-64 w-64 rounded-full bg-[var(--c-secondary)]/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-[var(--c-primary)]/10 blur-3xl" aria-hidden="true" />

      <div className="container-xl relative py-14 lg:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand + contact */}
          <Reveal className="lg:col-span-4">
            <div className="mb-4 font-display text-2xl font-extrabold text-white">
              THE UAE <span className="text-[var(--c-primary)]">JUNCTION</span>
            </div>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-neutral-400">{opt.footerTagline}</p>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={telHref} className="inline-flex items-center gap-3 transition-colors hover:text-[var(--c-primary)]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5"><Phone className="h-4 w-4" /></span>
                  {opt.phoneNumber}
                </a>
              </li>
              <li>
                <a href={`mailto:${opt.emailAddress}`} className="inline-flex items-center gap-3 transition-colors hover:text-[var(--c-primary)]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5"><Mail className="h-4 w-4" /></span>
                  {opt.emailAddress}
                </a>
              </li>
              <li className="inline-flex items-center gap-3 text-neutral-400">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5"><MapPin className="h-4 w-4" /></span>
                Dubai, United Arab Emirates
              </li>
            </ul>
          </Reveal>

          {/* Quick links */}
          <Reveal className="lg:col-span-2" delay={0.05}>
            <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-white">Company</h3>
            <FooterLinks links={menus.quick} />
          </Reveal>

          {/* Packages */}
          <Reveal className="lg:col-span-3" delay={0.1}>
            <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-white">Packages</h3>
            <FooterLinks links={menus.packages} />
          </Reveal>

          {/* Newsletter + social */}
          <Reveal className="lg:col-span-3" delay={0.15}>
            <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-white">Stay in the loop</h3>
            <p className="mb-3 text-sm text-neutral-400">Exclusive deals &amp; cashback drops, straight to your inbox.</p>
            <NewsletterForm />
            <div className="mt-6 flex gap-2.5">
              {opt.socialLinks.map((s) => {
                const Icon = SOCIAL_ICON[s.platform?.toLowerCase()] ?? MessageCircle
                return (
                  <a
                    key={s.platform + s.url}
                    href={s.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.platform}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-neutral-300 transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--c-primary)] hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
            </div>
            <a
              href={`https://wa.me/${waDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shine mt-5 inline-flex items-center gap-2 rounded-[10px] bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700"
            >
              <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
            </a>
          </Reveal>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-neutral-500 sm:flex-row">
          <p>© {new Date().getFullYear()} The UAE Junction. All rights reserved.</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {menus.legal.map((l) => (
              <li key={l.label + l.href}>
                <Link href={l.href} className="transition-colors hover:text-[var(--c-primary)]">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}

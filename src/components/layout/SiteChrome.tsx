'use client'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/**
 * The homepage ("/") ships its own self-contained nav + footer (Vibrant Junction).
 * Every other route keeps the global site chrome. This wrapper renders the global
 * Header/Footer/extras everywhere EXCEPT on "/", with no hydration flash because
 * usePathname is resolved during SSR in the App Router.
 */
export function SiteChrome({
  header, footer, extras, children,
}: { header: ReactNode; footer: ReactNode; extras: ReactNode; children: ReactNode }) {
  const isHome = usePathname() === '/'
  return (
    <>
      {!isHome && header}
      <main>{children}</main>
      {!isHome && footer}
      {!isHome && extras}
    </>
  )
}

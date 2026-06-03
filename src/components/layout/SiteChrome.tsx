'use client'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/**
 * The shared (Vibrant-skinned) Header renders on EVERY route, including "/", so the
 * site has ONE unified header. The homepage still ships its own footer, so the global
 * Footer/extras stay gated to non-home routes. usePathname resolves during SSR in the
 * App Router, so there is no hydration flash.
 */
export function SiteChrome({
  header, footer, extras, children,
}: { header: ReactNode; footer: ReactNode; extras: ReactNode; children: ReactNode }) {
  const isHome = usePathname() === '/'
  return (
    <>
      {/* Unified Vibrant header renders on EVERY route, incl. '/' (it is homepage-aware:
          transparent over the hero, solid after scroll). Footer/extras stay gated because
          the homepage ships its own footer. */}
      {header}
      <main>{children}</main>
      {!isHome && footer}
      {!isHome && extras}
    </>
  )
}

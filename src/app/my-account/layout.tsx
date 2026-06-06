// /my-account segment layout — Phase 5.
// Pass-through on purpose: the hub page keeps its Phase-4 presentation with
// ZERO visual regression. The shared two-pane account shell lives in the
// (sub) route group layout and wraps only the sub-pages (orders / profile /
// rewards). This layout's job is a single safety net: the whole account
// segment is noindex even if a future nested page forgets to say so.
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function MyAccountSegmentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

'use client'
import { SessionProvider } from 'next-auth/react'
import type { ReactNode } from 'react'

// Wraps the app so client components (header auth menu) can use useSession().
// refetchOnWindowFocus disabled to avoid noisy refetches on a content site.
export function SessionWrapper({ children }: { children: ReactNode }) {
  return <SessionProvider refetchOnWindowFocus={false}>{children}</SessionProvider>
}

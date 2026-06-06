// /my-account/register → /my-account?tab=register
// The old stub linked here; the hub's Create Account tab is the destination.
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default function RegisterRedirect() {
  redirect('/my-account?tab=register')
}

// /login → /my-account (kills the live 404; canonical account URL is /my-account).
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default function LoginRedirect() {
  redirect('/my-account')
}

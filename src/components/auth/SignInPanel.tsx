'use client'
import { type FormEvent, type RefObject } from 'react'
import Link from 'next/link'
import { Mail, Lock, Loader2, X } from 'lucide-react'
import { GoogleIcon, FacebookIcon } from './icons'

type Props = {
  providers: { google: boolean; facebook: boolean }
  busy: null | 'credentials' | 'google' | 'facebook'
  error: string | null
  firstFieldRef: RefObject<HTMLInputElement | null>
  onClose: () => void
  onSocial: (p: 'google' | 'facebook') => void
  onCredentials: (e: FormEvent<HTMLFormElement>) => void
}

// Presentational sign-in panel (no session hooks). Reused by both the live and
// the static (not-yet-configured) dropdown variants.
export function SignInPanel({ providers, busy, error, firstFieldRef, onClose, onSocial, onCredentials }: Props) {
  return (
    <div className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-neutral-900">Welcome back</h2>
        <button type="button" onClick={onClose} aria-label="Close" className="focus-ring rounded p-1 text-neutral-400 hover:text-neutral-700">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-2">
        <button type="button" disabled={!providers.google || busy !== null} onClick={() => onSocial('google')} className="focus-ring flex items-center justify-center gap-2 rounded-[10px] border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50">
          {busy === 'google' ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
          Continue with Google
        </button>
        <button type="button" disabled={!providers.facebook || busy !== null} onClick={() => onSocial('facebook')} className="focus-ring flex items-center justify-center gap-2 rounded-[10px] bg-[#1877F2] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1568d8] disabled:cursor-not-allowed disabled:opacity-50">
          {busy === 'facebook' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FacebookIcon />}
          Continue with Facebook
        </button>
      </div>

      {(!providers.google || !providers.facebook) && (
        <p className="mt-2 text-center text-[11px] leading-tight text-neutral-400">Social sign-in is being configured. Email sign-in below.</p>
      )}

      <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-wider text-neutral-400">
        <span className="h-px flex-1 bg-neutral-200" /> or <span className="h-px flex-1 bg-neutral-200" />
      </div>

      <form onSubmit={onCredentials} className="grid gap-3">
        <label className="block">
          <span className="sr-only">Email</span>
          <span className="relative block">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input ref={firstFieldRef} name="email" type="email" required autoComplete="email" placeholder="you@email.com" className="focus-ring w-full rounded-[10px] border border-neutral-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--c-primary)]" />
          </span>
        </label>
        <label className="block">
          <span className="sr-only">Password</span>
          <span className="relative block">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input name="password" type="password" required autoComplete="current-password" placeholder="Password" className="focus-ring w-full rounded-[10px] border border-neutral-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--c-primary)]" />
          </span>
        </label>

        {error && <p role="alert" className="text-xs leading-snug text-red-600">{error}</p>}

        <button type="submit" disabled={busy !== null} className="focus-ring mt-1 flex items-center justify-center gap-2 rounded-[10px] bg-[var(--c-secondary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--c-secondary-dark)] disabled:opacity-60">
          {busy === 'credentials' && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
        <Link href="/my-account" className="hover:text-[var(--c-primary)]" onClick={onClose}>Forgot password?</Link>
        <Link href="/my-account" className="font-semibold text-[var(--c-primary)] hover:underline" onClick={onClose}>Create account</Link>
      </div>
    </div>
  )
}

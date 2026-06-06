'use client'
// Presentational Create-account panel for the header dropdown.
// Deliberately minimal (name, email, password) — extended traveller details
// (nationality, residency, gender, WhatsApp) are collected progressively on
// /my-account/profile (optional) and at checkout (mandatory).
import { type FormEvent, type RefObject } from 'react'
import { Mail, Lock, User, Loader2, ShieldCheck } from 'lucide-react'
import { BenefitsStrip } from './BenefitsStrip'

type Props = {
  busy: boolean
  error: string | null
  firstFieldRef: RefObject<HTMLInputElement | null>
  onRegister: (e: FormEvent<HTMLFormElement>) => void
  onSwitchToSignIn: () => void
}

export function RegisterPanel({ busy, error, firstFieldRef, onRegister, onSwitchToSignIn }: Props) {
  return (
    <div className="px-5 pb-5 pt-4">
      <BenefitsStrip />

      <form onSubmit={onRegister} className="grid gap-3">
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="sr-only">First name</span>
            <span className="relative block">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input ref={firstFieldRef} name="firstName" type="text" required autoComplete="given-name" placeholder="First name" className="focus-ring w-full rounded-[10px] border border-neutral-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--c-primary)]" />
            </span>
          </label>
          <label className="block">
            <span className="sr-only">Last name</span>
            <input name="lastName" type="text" required autoComplete="family-name" placeholder="Last name" className="focus-ring w-full rounded-[10px] border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-[var(--c-primary)]" />
          </label>
        </div>
        <label className="block">
          <span className="sr-only">Email</span>
          <span className="relative block">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input name="email" type="email" required autoComplete="email" placeholder="you@email.com" className="focus-ring w-full rounded-[10px] border border-neutral-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--c-primary)]" />
          </span>
        </label>
        <label className="block">
          <span className="sr-only">Password</span>
          <span className="relative block">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="Password (8+ characters)" className="focus-ring w-full rounded-[10px] border border-neutral-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--c-primary)]" />
          </span>
        </label>

        {error && <p role="alert" className="text-xs leading-snug text-red-600">{error}</p>}

        <button type="submit" disabled={busy} className="focus-ring mt-1 flex items-center justify-center gap-2 rounded-[10px] bg-[var(--c-primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--c-primary-dark)] disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </button>
      </form>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Your details are encrypted and never shared.
      </p>

      <p className="mt-3 text-center text-xs text-neutral-500">
        Already a member?{' '}
        <button type="button" onClick={onSwitchToSignIn} className="focus-ring rounded font-semibold text-[var(--c-primary)] hover:underline">
          Sign in
        </button>
      </p>
    </div>
  )
}

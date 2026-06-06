'use client'
// Signed-out /my-account view — tabbed Sign In / Create Account card.
// Mirrors AuthDropdown behaviour exactly: Live mode calls
// signIn('credentials',{redirect:false}); unconfigured (Static) mode renders
// the full UI but performs ZERO network calls and shows the launching-soon
// notice on submit. Generic, non-enumerating error copy throughout.
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Mail, Lock, User, Loader2, Eye, EyeOff, ShieldCheck, MessageCircle,
  CalendarCheck, Wallet, Zap,
} from 'lucide-react'

type Tab = 'signin' | 'register'

const LAUNCHING_SOON =
  'Accounts are launching soon. For bookings now, message us on WhatsApp at +971 58 589 8221.'
const GENERIC_SIGNIN_FAIL =
  'That email and password combination didn’t work. Please check and try again.'

function Field({
  label, name, type, autoComplete, placeholder, icon, inputRef, invalid, describedBy, minLength,
}: {
  label: string
  name: string
  type: string
  autoComplete: string
  placeholder: string
  icon: React.ReactNode
  inputRef?: React.RefObject<HTMLInputElement | null>
  invalid?: boolean
  describedBy?: string
  minLength?: number
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">{icon}</span>
        <input
          ref={inputRef}
          name={name}
          type={type}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className="focus-ring w-full rounded-btn border border-neutral-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-primary"
        />
      </span>
    </label>
  )
}

function PasswordField({ name, autoComplete, label, hint }: { name: string; autoComplete: string; label: string; hint?: string }) {
  const [show, setShow] = useState(false)
  const hintId = hint ? `${name}-hint` : undefined
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</span>
      <span className="relative block">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          name={name}
          type={show ? 'text' : 'password'}
          required
          minLength={8}
          autoComplete={autoComplete}
          placeholder="••••••••"
          aria-describedby={hintId}
          className="focus-ring w-full rounded-btn border border-neutral-200 py-3 pl-10 pr-11 text-sm outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-pressed={show}
          className="focus-ring absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-neutral-400 hover:text-neutral-700"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
      {hint && <span id={hintId} className="mt-1 block text-[11px] text-neutral-400">{hint}</span>}
    </label>
  )
}

export function AuthPanel({ configured, providers }: { configured: boolean; providers: { google: boolean; facebook: boolean } }) {
  const router = useRouter()
  const search = useSearchParams()
  const reduce = useReducedMotion()
  const [tab, setTab] = useState<Tab>(search.get('tab') === 'register' ? 'register' : 'signin')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const errorRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (error) errorRef.current?.focus()
  }, [error])

  function switchTab(next: Tab) {
    setTab(next)
    setError(null)
    setTimeout(() => firstFieldRef.current?.focus(), 50)
  }

  async function onSignIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (!configured) {
      setError(LAUNCHING_SOON)
      return
    }
    setBusy(true)
    const form = new FormData(e.currentTarget)
    const res = await signIn('credentials', {
      email: String(form.get('email') || ''),
      password: String(form.get('password') || ''),
      redirect: false,
    }).catch(() => null)
    setBusy(false)
    if (!res || res.error) {
      setError(GENERIC_SIGNIN_FAIL)
      return
    }
    router.refresh() // server gate re-renders → dashboard
  }

  async function onRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (!configured) {
      setError(LAUNCHING_SOON)
      return
    }
    setBusy(true)
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') || '')
    const password = String(form.get('password') || '')
    try {
      const res = await fetch('/api/account/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: String(form.get('firstName') || ''),
          lastName: String(form.get('lastName') || ''),
          email,
          password,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.ok) {
        setError(typeof json?.message === 'string' ? json.message : GENERIC_SIGNIN_FAIL)
        setBusy(false)
        return
      }
      // Register-then-login (the CMS doesn't issue tokens on register).
      const login = await signIn('credentials', { email, password, redirect: false }).catch(() => null)
      setBusy(false)
      if (!login || login.error) {
        switchTab('signin')
        setError('Your account was created — please sign in.')
        return
      }
      router.refresh()
    } catch {
      setBusy(false)
      setError(GENERIC_SIGNIN_FAIL)
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'signin', label: 'Sign in' },
    { id: 'register', label: 'Create account' },
  ]

  return (
    <div className="bg-gradient-to-b from-amber-50/60 to-white">
      <div className="container-xl flex min-h-[70vh] items-center justify-center py-14 sm:py-20">
        <div className="w-full max-w-md">
          <h1 className="font-display mb-2 text-center text-3xl font-bold text-secondary">My Account</h1>
          <p className="mb-7 text-center text-sm text-neutral-500">
            Track bookings, earn 2.5% cashback and check out faster.
          </p>

          <div className="rounded-card bg-white p-6 shadow-card sm:p-8">
            {/* Tabs */}
            <div role="tablist" aria-label="Account access" className="relative mb-6 grid grid-cols-2 rounded-btn bg-neutral-100 p-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  id={`tab-${t.id}`}
                  aria-selected={tab === t.id}
                  aria-controls={`panel-${t.id}`}
                  tabIndex={tab === t.id ? 0 : -1}
                  onClick={() => switchTab(t.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                      switchTab(t.id === 'signin' ? 'register' : 'signin')
                    }
                  }}
                  className={`focus-ring relative z-10 rounded-[8px] px-3 py-2 text-sm font-semibold transition-colors ${
                    tab === t.id ? 'text-secondary' : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  {tab === t.id && (
                    <motion.span
                      layoutId={reduce ? undefined : 'authTabPill'}
                      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
                      className="absolute inset-0 -z-10 rounded-[8px] bg-white shadow-sm"
                    />
                  )}
                  {t.label}
                </button>
              ))}
            </div>

            {/* Social (only when configured per provider) */}
            {(providers.google || providers.facebook) && (
              <div className="mb-5 grid gap-2">
                {providers.google && (
                  <button type="button" disabled={busy} onClick={() => void signIn('google', { callbackUrl: '/my-account' })} className="focus-ring rounded-btn border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50">
                    Continue with Google
                  </button>
                )}
                {providers.facebook && (
                  <button type="button" disabled={busy} onClick={() => void signIn('facebook', { callbackUrl: '/my-account' })} className="focus-ring rounded-btn bg-[#1877F2] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1568d8] disabled:opacity-50">
                    Continue with Facebook
                  </button>
                )}
                <div className="my-1 flex items-center gap-3 text-[11px] uppercase tracking-wider text-neutral-400">
                  <span className="h-px flex-1 bg-neutral-200" /> or <span className="h-px flex-1 bg-neutral-200" />
                </div>
              </div>
            )}

            {/* Error / notice */}
            <div aria-live="polite">
              {error && (
                <p ref={errorRef} tabIndex={-1} role="alert" className="mb-4 rounded-btn bg-red-50 px-3 py-2.5 text-xs leading-snug text-red-700 outline-none">
                  {error}
                </p>
              )}
            </div>

            {/* Sign in */}
            {tab === 'signin' && (
              <form id="panel-signin" role="tabpanel" aria-labelledby="tab-signin" onSubmit={onSignIn} className="grid gap-4">
                <Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@email.com" icon={<Mail className="h-4 w-4" />} inputRef={firstFieldRef} />
                <PasswordField name="password" autoComplete="current-password" label="Password" />
                <button type="submit" disabled={busy} className="focus-ring mt-1 flex items-center justify-center gap-2 rounded-btn bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60">
                  {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                  Sign in
                </button>
              </form>
            )}

            {/* Create account */}
            {tab === 'register' && (
              <form id="panel-register" role="tabpanel" aria-labelledby="tab-register" onSubmit={onRegister} className="grid gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First name" name="firstName" type="text" autoComplete="given-name" placeholder="First name" icon={<User className="h-4 w-4" />} inputRef={firstFieldRef} />
                  <Field label="Last name" name="lastName" type="text" autoComplete="family-name" placeholder="Last name" icon={<User className="h-4 w-4" />} />
                </div>
                <Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@email.com" icon={<Mail className="h-4 w-4" />} />
                <PasswordField name="password" autoComplete="new-password" label="Password" hint="At least 8 characters." />
                <button type="submit" disabled={busy} className="focus-ring mt-1 flex items-center justify-center gap-2 rounded-btn bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-60">
                  {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                  Create account
                </button>
              </form>
            )}

            {/* Trust row */}
            <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Your details are encrypted and never shared.
            </p>
          </div>

          {/* Why create an account? */}
          <ul className="mt-7 grid grid-cols-3 gap-3 text-center">
            {[
              { icon: <CalendarCheck className="mx-auto h-5 w-5 text-primary" aria-hidden />, label: 'Track bookings' },
              { icon: <Wallet className="mx-auto h-5 w-5 text-primary" aria-hidden />, label: '2.5% cashback wallet' },
              { icon: <Zap className="mx-auto h-5 w-5 text-primary" aria-hidden />, label: 'Faster checkout' },
            ].map((b) => (
              <li key={b.label} className="rounded-card bg-white/70 px-2 py-3 text-xs font-medium text-neutral-600 shadow-sm">
                {b.icon}
                <span className="mt-1.5 block">{b.label}</span>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-center text-xs text-neutral-500">
            Need help?{' '}
            <a href="https://wa.me/971585898221" target="_blank" rel="noopener noreferrer" className="focus-ring inline-flex items-center gap-1 font-semibold text-primary hover:underline">
              <MessageCircle className="h-3.5 w-3.5" aria-hidden /> WhatsApp us
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

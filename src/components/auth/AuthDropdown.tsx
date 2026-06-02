'use client'
import { useEffect, useRef, useState, useCallback, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { User, LogOut, Mail, Lock, Loader2, X, ChevronDown } from 'lucide-react'

type Props = {
  providers: { google: boolean; facebook: boolean }
}

const panelMotion = {
  initial: { opacity: 0, y: 10, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.98 },
  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
}

export function AuthDropdown({ providers }: Props) {
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<null | 'credentials' | 'google' | 'facebook'>(null)
  const [error, setError] = useState<string | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const reduce = useReducedMotion()

  const close = useCallback(() => setOpen(false), [])

  // Close on outside click + Escape; focus first field on open.
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    const t = setTimeout(() => firstFieldRef.current?.focus(), 60)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
      clearTimeout(t)
    }
  }, [open, close])

  async function onCredentials(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setBusy('credentials')
    const form = new FormData(e.currentTarget)
    const res = await signIn('credentials', {
      email: String(form.get('email') || ''),
      password: String(form.get('password') || ''),
      redirect: false,
    }).catch(() => null)
    setBusy(null)
    if (!res || res.error) {
      setError('Sign-in is being finalised on our side. Please try a social login or try again shortly.')
      return
    }
    close()
  }

  function social(provider: 'google' | 'facebook') {
    setBusy(provider)
    // Full redirect flow handled by NextAuth.
    void signIn(provider, { callbackUrl: '/' })
  }

  const signedIn = status === 'authenticated' && session?.user
  const label = signedIn ? session.user?.name?.split(' ')[0] || 'Account' : 'Sign in'

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="focus-ring inline-flex items-center gap-2 rounded-[10px] bg-[var(--c-primary)] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-transform hover:-translate-y-0.5 hover:bg-[var(--c-primary-dark)]"
      >
        {signedIn && session.user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={session.user.image} alt="" className="h-5 w-5 rounded-full object-cover" />
        ) : (
          <User className="h-4 w-4" />
        )}
        <span className="max-w-[8rem] truncate">{label}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label={signedIn ? 'Account menu' : 'Sign in'}
            {...(reduce ? {} : panelMotion)}
            className="absolute right-0 top-[calc(100%+12px)] z-[60] w-[20rem] origin-top-right overflow-hidden rounded-2xl border border-black/5 bg-white shadow-2xl"
          >
            {signedIn ? (
              <AccountMenu
                name={session.user?.name}
                email={session.user?.email}
                onSignOut={() => {
                  void signOut({ callbackUrl: '/' })
                }}
              />
            ) : (
              <div className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-neutral-900">Welcome back</h2>
                  <button type="button" onClick={close} aria-label="Close" className="focus-ring rounded p-1 text-neutral-400 hover:text-neutral-700">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-2">
                  <button
                    type="button"
                    disabled={!providers.google || busy !== null}
                    onClick={() => social('google')}
                    className="focus-ring flex items-center justify-center gap-2 rounded-[10px] border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy === 'google' ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                    Continue with Google
                  </button>
                  <button
                    type="button"
                    disabled={!providers.facebook || busy !== null}
                    onClick={() => social('facebook')}
                    className="focus-ring flex items-center justify-center gap-2 rounded-[10px] bg-[#1877F2] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1568d8] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy === 'facebook' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FacebookIcon />}
                    Continue with Facebook
                  </button>
                </div>

                {(!providers.google || !providers.facebook) && (
                  <p className="mt-2 text-center text-[11px] leading-tight text-neutral-400">
                    Social sign-in is being configured. Email sign-in below.
                  </p>
                )}

                <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-wider text-neutral-400">
                  <span className="h-px flex-1 bg-neutral-200" /> or <span className="h-px flex-1 bg-neutral-200" />
                </div>

                <form onSubmit={onCredentials} className="grid gap-3">
                  <label className="block">
                    <span className="sr-only">Email</span>
                    <span className="relative block">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                      <input
                        ref={firstFieldRef}
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@email.com"
                        className="focus-ring w-full rounded-[10px] border border-neutral-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--c-primary)]"
                      />
                    </span>
                  </label>
                  <label className="block">
                    <span className="sr-only">Password</span>
                    <span className="relative block">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                      <input
                        name="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        placeholder="Password"
                        className="focus-ring w-full rounded-[10px] border border-neutral-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--c-primary)]"
                      />
                    </span>
                  </label>

                  {error && <p role="alert" className="text-xs leading-snug text-red-600">{error}</p>}

                  <button
                    type="submit"
                    disabled={busy !== null}
                    className="focus-ring mt-1 flex items-center justify-center gap-2 rounded-[10px] bg-[var(--c-secondary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--c-secondary-dark)] disabled:opacity-60"
                  >
                    {busy === 'credentials' && <Loader2 className="h-4 w-4 animate-spin" />}
                    Sign in
                  </button>
                </form>

                <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
                  <Link href="/my-account" className="hover:text-[var(--c-primary)]" onClick={close}>Forgot password?</Link>
                  <Link href="/my-account" className="font-semibold text-[var(--c-primary)] hover:underline" onClick={close}>Create account</Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function AccountMenu({ name, email, onSignOut }: { name?: string | null; email?: string | null; onSignOut: () => void }) {
  return (
    <div className="p-2">
      <div className="flex items-center gap-3 rounded-xl bg-neutral-50 px-3 py-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--c-primary)] text-white">
          <User className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-neutral-900">{name || 'Traveller'}</span>
          {email && <span className="block truncate text-xs text-neutral-500">{email}</span>}
        </span>
      </div>
      <nav className="mt-1 grid">
        <Link href="/my-account" className="rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50">My account</Link>
        <Link href="/my-account?tab=bookings" className="rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50">My bookings</Link>
        <Link href="/my-account?tab=rewards" className="rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50">Cashback &amp; rewards</Link>
      </nav>
      <button
        type="button"
        onClick={onSignOut}
        className="focus-ring mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3 1.79-4.67 4.53-4.67 1.31 0 2.69.24 2.69.24v2.95h-1.52c-1.49 0-1.96.93-1.96 1.88V12h3.33l-.53 3.47h-2.8v8.38A12 12 0 0 0 24 12Z" />
    </svg>
  )
}

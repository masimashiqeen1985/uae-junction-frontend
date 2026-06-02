'use client'
import { useEffect, useRef, useState, useCallback, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { User, LogOut, ChevronDown } from 'lucide-react'
import { SignInPanel } from './SignInPanel'

type Providers = { google: boolean; facebook: boolean }

const panelMotion = {
  initial: { opacity: 0, y: 10, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.98 },
  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
}

// Shared open/close + outside-click + Esc behaviour.
function useDropdown() {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    const t = setTimeout(() => firstFieldRef.current?.focus(), 60)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
      clearTimeout(t)
    }
  }, [open, close])
  return { open, setOpen, close, wrapRef, firstFieldRef }
}

function Trigger({ open, onClick, label, image }: { open: boolean; onClick: () => void; label: string; image?: string | null }) {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={onClick}
      className="focus-ring inline-flex items-center gap-2 rounded-[10px] bg-[var(--c-primary)] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-transform hover:-translate-y-0.5 hover:bg-[var(--c-primary-dark)]"
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="h-5 w-5 rounded-full object-cover" />
      ) : (
        <User className="h-4 w-4" />
      )}
      <span className="max-w-[8rem] truncate">{label}</span>
      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
  )
}

function Panel({ children, label }: { children: React.ReactNode; label: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      role="dialog"
      aria-label={label}
      {...(reduce ? {} : panelMotion)}
      className="absolute right-0 top-[calc(100%+12px)] z-[60] w-[20rem] origin-top-right overflow-hidden rounded-2xl border border-black/5 bg-white shadow-2xl"
    >
      {children}
    </motion.div>
  )
}

function AccountMenu({ name, email, onSignOut }: { name?: string | null; email?: string | null; onSignOut: () => void }) {
  return (
    <div className="p-2">
      <div className="flex items-center gap-3 rounded-xl bg-neutral-50 px-3 py-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--c-primary)] text-white"><User className="h-5 w-5" /></span>
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
      <button type="button" onClick={onSignOut} className="focus-ring mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  )
}

// LIVE variant — auth is configured (AUTH_SECRET present + SessionProvider mounted).
function LiveDropdown({ providers }: { providers: Providers }) {
  const { data: session, status } = useSession()
  const { open, setOpen, close, wrapRef, firstFieldRef } = useDropdown()
  const [busy, setBusy] = useState<null | 'credentials' | 'google' | 'facebook'>(null)
  const [error, setError] = useState<string | null>(null)

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
  function onSocial(p: 'google' | 'facebook') {
    setBusy(p)
    void signIn(p, { callbackUrl: '/' })
  }

  const signedIn = status === 'authenticated' && session?.user
  const label = signedIn ? session.user?.name?.split(' ')[0] || 'Account' : 'Sign in'

  return (
    <div ref={wrapRef} className="relative">
      <Trigger open={open} onClick={() => setOpen((v) => !v)} label={label} image={signedIn ? session.user?.image : null} />
      <AnimatePresence>
        {open && (
          <Panel label={signedIn ? 'Account menu' : 'Sign in'}>
            {signedIn ? (
              <AccountMenu name={session.user?.name} email={session.user?.email} onSignOut={() => void signOut({ callbackUrl: '/' })} />
            ) : (
              <SignInPanel providers={providers} busy={busy} error={error} firstFieldRef={firstFieldRef} onClose={close} onSocial={onSocial} onCredentials={onCredentials} />
            )}
          </Panel>
        )}
      </AnimatePresence>
    </div>
  )
}

// STATIC variant — auth not configured yet (no AUTH_SECRET). Renders the full
// sign-in UI but never calls the network, so the live site stays 500-free.
function StaticDropdown({ providers }: { providers: Providers }) {
  const { open, setOpen, close, wrapRef, firstFieldRef } = useDropdown()
  const [error, setError] = useState<string | null>(null)
  function onCredentials(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('Accounts are launching soon. For bookings now, message us on WhatsApp at +971 58 589 8221.')
  }
  return (
    <div ref={wrapRef} className="relative">
      <Trigger open={open} onClick={() => setOpen((v) => !v)} label="Sign in" />
      <AnimatePresence>
        {open && (
          <Panel label="Sign in">
            <SignInPanel providers={providers} busy={null} error={error} firstFieldRef={firstFieldRef} onClose={close} onSocial={() => {}} onCredentials={onCredentials} />
          </Panel>
        )}
      </AnimatePresence>
    </div>
  )
}

export function AuthDropdown({ providers, configured }: { providers: Providers; configured: boolean }) {
  return configured ? <LiveDropdown providers={providers} /> : <StaticDropdown providers={providers} />
}

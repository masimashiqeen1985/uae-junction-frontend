'use client'
// Header auth dropdown — ONE panel for both Sign in and Create account
// (segmented tabs), with a benefits strip selling membership (2.5% cashback,
// joining bonus, referral bonus). Signed-in: the trigger becomes the
// customer's first name and opens a mini account menu. Register uses the
// proven Phase-4 path: POST /api/account/register → signIn('credentials').
import { useEffect, useRef, useState, useCallback, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { User, LogOut, ChevronDown, X, CalendarCheck, Wallet } from 'lucide-react'
import { SignInPanel } from './SignInPanel'
import { RegisterPanel } from './RegisterPanel'

type Providers = { google: boolean; facebook: boolean }
type Tab = 'signin' | 'register'

const LAUNCHING_SOON =
  'Accounts are launching soon. For bookings now, message us on WhatsApp at +971 58 589 8221.'
const GENERIC_SIGNIN_FAIL =
  'That email and password combination didn’t work. Please check and try again.'
const GENERIC_REGISTER_FAIL =
  'We couldn’t create your account. Please check your details and try again.'

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
      className="absolute right-0 top-[calc(100%+12px)] z-[60] w-[22rem] origin-top-right overflow-hidden rounded-2xl border border-black/5 bg-white shadow-2xl"
    >
      {children}
    </motion.div>
  )
}

// Segmented Sign in / Create account control + close button (shared header
// of the signed-out panel).
function TabsHeader({ tab, onTab, onClose }: { tab: Tab; onTab: (t: Tab) => void; onClose: () => void }) {
  const reduce = useReducedMotion()
  const tabs: { id: Tab; label: string }[] = [
    { id: 'signin', label: 'Sign in' },
    { id: 'register', label: 'Create account' },
  ]
  return (
    <div className="flex items-center gap-2 px-5 pt-4">
      <div role="tablist" aria-label="Account access" className="relative grid flex-1 grid-cols-2 rounded-[10px] bg-neutral-100 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`dd-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`dd-panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => onTab(t.id)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') onTab(t.id === 'signin' ? 'register' : 'signin')
            }}
            className={`focus-ring relative z-10 rounded-[8px] px-2 py-1.5 text-xs font-semibold transition-colors ${
              tab === t.id ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {tab === t.id && (
              <motion.span
                layoutId={reduce ? undefined : 'ddAuthTabPill'}
                transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
                className="absolute inset-0 -z-10 rounded-[8px] bg-white shadow-sm"
              />
            )}
            {t.label}
          </button>
        ))}
      </div>
      <button type="button" onClick={onClose} aria-label="Close" className="focus-ring rounded p-1 text-neutral-400 hover:text-neutral-700">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

function AccountMenu({ name, email, onSignOut, onClose }: { name?: string | null; email?: string | null; onSignOut: () => void; onClose: () => void }) {
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
        <Link href="/my-account" onClick={onClose} className="rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50">My account</Link>
        <Link href="/my-account/orders" onClick={onClose} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
          <CalendarCheck className="h-4 w-4 text-neutral-400" /> My bookings
        </Link>
        <Link href="/my-account/rewards" onClick={onClose} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
          <Wallet className="h-4 w-4 text-neutral-400" /> Cashback &amp; rewards
        </Link>
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
  const router = useRouter()
  const { open, setOpen, close, wrapRef, firstFieldRef } = useDropdown()
  const [tab, setTab] = useState<Tab>('signin')
  const [busy, setBusy] = useState<null | 'credentials' | 'google' | 'facebook' | 'register'>(null)
  const [error, setError] = useState<string | null>(null)

  function switchTab(next: Tab) {
    setTab(next)
    setError(null)
    setTimeout(() => firstFieldRef.current?.focus(), 50)
  }

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
      setError(GENERIC_SIGNIN_FAIL)
      return
    }
    close()
    router.refresh() // header chip + server gates re-render with the session
  }

  async function onRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setBusy('register')
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
        setBusy(null)
        setError(typeof json?.message === 'string' ? json.message : GENERIC_REGISTER_FAIL)
        return
      }
      // Register-then-login (the CMS doesn't issue tokens on register).
      const login = await signIn('credentials', { email, password, redirect: false }).catch(() => null)
      setBusy(null)
      if (!login || login.error) {
        switchTab('signin')
        setError('Your account was created — please sign in.')
        return
      }
      close()
      router.refresh()
    } catch {
      setBusy(null)
      setError(GENERIC_REGISTER_FAIL)
    }
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
          <Panel label={signedIn ? 'Account menu' : 'Sign in or create account'}>
            {signedIn ? (
              <AccountMenu name={session.user?.name} email={session.user?.email} onClose={close} onSignOut={() => void signOut({ callbackUrl: '/' })} />
            ) : (
              <>
                <TabsHeader tab={tab} onTab={switchTab} onClose={close} />
                {tab === 'signin' ? (
                  <div id="dd-panel-signin" role="tabpanel" aria-labelledby="dd-tab-signin">
                    <SignInPanel providers={providers} busy={busy === 'register' ? null : busy} error={error} firstFieldRef={firstFieldRef} onClose={close} onSocial={onSocial} onCredentials={onCredentials} onSwitchToRegister={() => switchTab('register')} />
                  </div>
                ) : (
                  <div id="dd-panel-register" role="tabpanel" aria-labelledby="dd-tab-register">
                    <RegisterPanel busy={busy === 'register'} error={error} firstFieldRef={firstFieldRef} onRegister={onRegister} onSwitchToSignIn={() => switchTab('signin')} />
                  </div>
                )}
              </>
            )}
          </Panel>
        )}
      </AnimatePresence>
    </div>
  )
}

// STATIC variant — auth not configured yet (no AUTH_SECRET). Renders the full
// tabbed UI but never calls the network, so the live site stays 500-free.
function StaticDropdown({ providers }: { providers: Providers }) {
  const { open, setOpen, close, wrapRef, firstFieldRef } = useDropdown()
  const [tab, setTab] = useState<Tab>('signin')
  const [error, setError] = useState<string | null>(null)
  function switchTab(next: Tab) {
    setTab(next)
    setError(null)
  }
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(LAUNCHING_SOON)
  }
  return (
    <div ref={wrapRef} className="relative">
      <Trigger open={open} onClick={() => setOpen((v) => !v)} label="Sign in" />
      <AnimatePresence>
        {open && (
          <Panel label="Sign in or create account">
            <TabsHeader tab={tab} onTab={switchTab} onClose={close} />
            {tab === 'signin' ? (
              <div id="dd-panel-signin" role="tabpanel" aria-labelledby="dd-tab-signin">
                <SignInPanel providers={providers} busy={null} error={error} firstFieldRef={firstFieldRef} onClose={close} onSocial={() => {}} onCredentials={onSubmit} onSwitchToRegister={() => switchTab('register')} />
              </div>
            ) : (
              <div id="dd-panel-register" role="tabpanel" aria-labelledby="dd-tab-register">
                <RegisterPanel busy={false} error={error} firstFieldRef={firstFieldRef} onRegister={onSubmit} onSwitchToSignIn={() => switchTab('signin')} />
              </div>
            )}
          </Panel>
        )}
      </AnimatePresence>
    </div>
  )
}

export function AuthDropdown({ providers, configured }: { providers: Providers; configured: boolean }) {
  return configured ? <LiveDropdown providers={providers} /> : <StaticDropdown providers={providers} />
}

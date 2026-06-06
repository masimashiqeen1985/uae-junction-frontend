'use client'
import Link from 'next/link'
import { useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { ChevronDown, X, Phone, MessageCircle, User } from 'lucide-react'
import type { NavItem } from './nav-types'
import { Logo } from './Logo'

type Props = {
  open: boolean
  onClose: () => void
  nav: NavItem[]
  phone?: string
  whatsapp?: string
  /** When true, the account button shows the signed-in customer's name
   *  (SessionProvider is only mounted when auth is configured). */
  authConfigured?: boolean
}

const accountBtnCls =
  'mb-3 flex w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--c-primary)] py-3 text-center font-semibold text-white'

// Live variant — safe to call useSession (provider mounted upstream).
function LiveAccountLink({ onClose }: { onClose: () => void }) {
  const { data: session, status } = useSession()
  const firstName =
    status === 'authenticated' ? session?.user?.name?.split(' ')[0] || null : null
  return (
    <Link href="/my-account" onClick={onClose} className={accountBtnCls}>
      <User className="h-4 w-4 shrink-0" aria-hidden />
      <span className="max-w-[14rem] truncate">{firstName ? `Hi, ${firstName} — My account` : 'Sign in / Register'}</span>
    </Link>
  )
}

export function MobileMenu({ open, onClose, nav, phone = '+971 58 589 8221', whatsapp = '971585898221', authConfigured = false }: Props) {
  const reduce = useReducedMotion()

  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] lg:hidden" initial="hidden" animate="show" exit="hidden">
          <motion.div
            className="absolute inset-0 bg-black/50"
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
            onClick={onClose}
          />
          <motion.aside
            className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-white shadow-2xl"
            variants={{
              hidden: { x: reduce ? 0 : '100%', opacity: reduce ? 0 : 1 },
              show: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 320, damping: 34 } },
            }}
            role="dialog"
            aria-label="Menu"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
              <span className="text-neutral-900">
                <Logo className="h-8" />
              </span>
              <button type="button" onClick={onClose} aria-label="Close menu" className="focus-ring rounded p-1.5 text-neutral-500 hover:text-neutral-900">
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              {nav.map((item) =>
                item.children?.length ? (
                  <details key={item.label} className="group border-b border-neutral-50">
                    <summary className="flex cursor-pointer list-none items-center justify-between px-2 py-3 font-medium text-neutral-800">
                      {item.label}
                      <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="grid pb-2 pl-3">
                      {item.children.map((c) => (
                        <Link
                          key={c.href + c.label}
                          href={c.href}
                          onClick={onClose}
                          className="rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-[var(--c-primary)]"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  </details>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onClose}
                    className="block border-b border-neutral-50 px-2 py-3 font-medium text-neutral-800 hover:text-[var(--c-primary)]"
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>

            <div className="border-t border-neutral-100 p-4">
              {authConfigured ? (
                <LiveAccountLink onClose={onClose} />
              ) : (
                <Link href="/my-account" onClick={onClose} className={accountBtnCls}>
                  <User className="h-4 w-4 shrink-0" aria-hidden />
                  Sign in / Register
                </Link>
              )}
              <div className="flex gap-2">
                <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-neutral-200 py-2.5 text-sm font-medium text-neutral-700">
                  <Phone className="h-4 w-4" /> Call
                </a>
                <a href={`https://wa.me/${whatsapp.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-green-600 py-2.5 text-sm font-medium text-white">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

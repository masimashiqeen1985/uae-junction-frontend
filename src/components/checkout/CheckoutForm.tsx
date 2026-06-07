'use client'
// Checkout form — guest + signed-in. Submits to /api/checkout which creates a
// real Woo order via the `bacs` (Direct Account Transfer) method. Cart is
// preserved on any recoverable failure; on success the provider refreshes
// (server cart is emptied by Woo) and we route to /order-confirmation.
//
// Traveller-details gate (2026-06-07): nationality, UAE residency and gender
// are MANDATORY here (optional on profile — progressive profiling). For
// signed-in customers the form prefills from the saved profile via
// GET /api/account/profile (guests get a silent 401 → blank form), and
// anything entered here is saved back server-side so it's asked once.
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { useCart } from '@/components/cart/CartProvider'
import { formatBookingDate } from '@/lib/utils'
import { OrderSummary } from '@/components/commerce/OrderSummary'
import { PaymentMethods } from '@/components/checkout/PaymentMethods'
import { ORDER_SNAPSHOT_KEY, type OrderSnapshot } from '@/components/checkout/OrderConfirmation'
import type { CheckoutResult } from '@/lib/queries/checkout'
import { COUNTRIES } from '@/lib/countries'
import { GENDER_OPTIONS, RESIDENCY_OPTIONS, isGender, isNationality, isResidency } from '@/lib/profile-fields'

type Fields = {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  nationality: string
  residency: string
  gender: string
  note: string
}
type Errors = Partial<Record<keyof Fields, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^\+?[0-9 ()-]{7,20}$/

const REQUIRED_KEYS = ['firstName', 'lastName', 'email', 'phone', 'nationality', 'residency', 'gender'] as const

function validateField(name: keyof Fields, value: string): string {
  switch (name) {
    case 'firstName': return value.trim() ? '' : 'First name is required'
    case 'lastName': return value.trim() ? '' : 'Last name is required'
    case 'email': return EMAIL_RE.test(value.trim()) ? '' : 'Enter a valid email address'
    case 'phone': return PHONE_RE.test(value.trim()) ? '' : 'Enter a valid phone number (e.g. +971 5x xxx xxxx)'
    case 'nationality': return isNationality(value) ? '' : 'Select your nationality'
    case 'residency': return isResidency(value) ? '' : 'Tell us if you are a UAE resident'
    case 'gender': return isGender(value) ? '' : 'Select an option'
    default: return ''
  }
}

const ERROR_COPY: Record<string, string> = {
  'empty-cart': 'Your cart session expired. Please add your experiences again.',
  'payment-method-unavailable': 'Account transfer is temporarily unavailable. Please contact us on WhatsApp and we will reserve your booking manually.',
  'checkout-failed': 'We could not place your booking. Please check your details and try again.',
  'checkout-unavailable': 'Our booking service is briefly unavailable. Your cart is safe — please try again in a moment.',
  validation: 'Please correct the highlighted fields.',
}

function Field({
  id, label, error, children,
}: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-secondary">{label}</label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export function CheckoutForm() {
  const { cart, status, refresh, bookingDates } = useCart()
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const [fields, setFields] = useState<Fields>({
    firstName: '', lastName: '', email: '', phone: '', country: 'AE',
    nationality: '', residency: '', gender: '', note: '',
  })
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [prefilled, setPrefilled] = useState(false)
  const submittedRef = useRef(false)

  // Signed-in prefill — fills only fields the visitor hasn't typed into yet.
  // Guests receive a silent 401 and the form stays blank.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/account/profile', { method: 'GET', cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json().catch(() => null)
        const p = json?.profile
        if (!p || cancelled) return
        let filled = false
        setFields((f) => {
          const next = { ...f }
          ;(['firstName', 'lastName', 'email', 'phone', 'nationality', 'residency', 'gender'] as const).forEach((k) => {
            if (!next[k] && typeof p[k] === 'string' && p[k]) {
              next[k] = p[k]
              filled = true
            }
          })
          if (f.country === 'AE' && typeof p.country === 'string' && /^[A-Z]{2}$/.test(p.country)) next.country = p.country
          return next
        })
        if (filled) setPrefilled(true)
      } catch {
        /* guest / offline — ignore */
      }
    })()
    return () => { cancelled = true }
  }, [])

  const set = useCallback((name: keyof Fields, value: string) => {
    setFields((f) => ({ ...f, [name]: value }))
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e))
  }, [])

  const blur = useCallback((name: keyof Fields) => {
    setErrors((e) => ({ ...e, [name]: validateField(name, fields[name]) || undefined }))
  }, [fields])

  const allValid = REQUIRED_KEYS.every((k) => !validateField(k, fields[k]))

  const onSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting || submittedRef.current) return
    const nextErrors: Errors = {}
    REQUIRED_KEYS.forEach((k) => {
      const msg = validateField(k, fields[k])
      if (msg) nextErrors[k] = msg
    })
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setFormError(ERROR_COPY.validation)
      return
    }
    setSubmitting(true)
    setFormError(null)
    // Fold per-line travel dates into the order's customer note (frontend-only;
    // no Woo cart item-meta). Shows in Woo admin + the confirmation snapshot.
    const dateLines = (cart?.contents?.nodes ?? [])
      .map((n) => { const d = bookingDates[n.product.node.databaseId]; return d ? `• ${n.product.node.name}${n.quantity > 1 ? ` ×${n.quantity}` : ''} — ${formatBookingDate(d)}` : null })
      .filter(Boolean)
    const noteWithDates = [fields.note?.trim(), dateLines.length ? `Travel dates:\n${dateLines.join('\n')}` : '']
      .filter(Boolean).join('\n\n')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, note: noteWithDates, website: '' }),
      })
      const data = (await res.json().catch(() => ({}))) as Partial<CheckoutResult> & { error?: string }
      if (!res.ok || !data.order?.orderNumber) {
        setFormError(ERROR_COPY[data.error || ''] || ERROR_COPY['checkout-failed'])
        setSubmitting(false)
        return
      }
      submittedRef.current = true
      // Snapshot for the confirmation page (sessionStorage only — dies with
      // the tab, never sent anywhere). Best-effort: the page degrades to a
      // reference-only state if this fails.
      try {
        const snapshot: OrderSnapshot = {
          ref: data.order.orderNumber,
          total: data.order.total || '',
          status: data.order.status || '',
          firstName: fields.firstName,
          subtotal: cart?.subtotal,
          items: cart?.contents?.nodes?.map((n) => ({
            name: n.product.node.name, qty: n.quantity, total: n.total,
            date: bookingDates[n.product.node.databaseId] || undefined,
          })),
          placedAt: Date.now(),
        }
        sessionStorage.setItem(ORDER_SNAPSHOT_KEY, JSON.stringify(snapshot))
      } catch { /* non-fatal */ }
      void refresh() // server cart already emptied by Woo checkout
      router.push(`/order-confirmation?ref=${encodeURIComponent(data.order.orderNumber)}&total=${encodeURIComponent(data.order.total || '')}`)
    } catch {
      setFormError(ERROR_COPY['checkout-unavailable'])
      setSubmitting(false)
    }
  }, [fields, submitting, refresh, router, cart, bookingDates])

  // ---- Empty cart guard ----
  if (status === 'loading' && !cart) {
    return (
      <div className="py-24 text-center text-neutral-500" role="status" aria-live="polite">
        Loading your cart…
      </div>
    )
  }
  if (!cart || cart.isEmpty || (cart.contents?.itemCount ?? 0) === 0) {
    return (
      <div className="py-20 text-center">
        <p className="font-display text-2xl font-bold text-secondary mb-3">Your cart is empty</p>
        <p className="text-neutral-500 mb-8">Add an experience to your cart before checking out.</p>
        <Link href="/" className="inline-block rounded-btn bg-primary px-8 py-3.5 font-semibold text-white hover:bg-primary-dark focus-ring">
          Browse experiences
        </Link>
      </div>
    )
  }

  const inputCls =
    'w-full rounded-btn border border-neutral-200 bg-white px-4 py-3 text-secondary placeholder:text-neutral-400 focus-ring'

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start"
    >
      <form onSubmit={onSubmit} noValidate className="space-y-10">
        {formError && (
          <div role="alert" aria-live="assertive" className="rounded-card border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {formError}
          </div>
        )}

        {prefilled && (
          <p className="rounded-card bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            Welcome back — we’ve filled in your saved details. Please review and complete anything missing.
          </p>
        )}

        <section aria-labelledby="contact-heading" className="space-y-5">
          <h2 id="contact-heading" className="font-display font-semibold text-lg text-secondary">
            Contact &amp; traveller details
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="firstName" label="First name" error={errors.firstName}>
              <input id="firstName" name="firstName" autoComplete="given-name" required
                value={fields.firstName} onChange={(e) => set('firstName', e.target.value)} onBlur={() => blur('firstName')}
                aria-invalid={!!errors.firstName} aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                className={inputCls} placeholder="e.g. Ahmed" />
            </Field>
            <Field id="lastName" label="Last name" error={errors.lastName}>
              <input id="lastName" name="lastName" autoComplete="family-name" required
                value={fields.lastName} onChange={(e) => set('lastName', e.target.value)} onBlur={() => blur('lastName')}
                aria-invalid={!!errors.lastName} aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                className={inputCls} placeholder="e.g. Al Mansoori" />
            </Field>
          </div>
          <Field id="email" label="Email address" error={errors.email}>
            <input id="email" name="email" type="email" autoComplete="email" inputMode="email" required
              value={fields.email} onChange={(e) => set('email', e.target.value)} onBlur={() => blur('email')}
              aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined}
              className={inputCls} placeholder="you@example.com" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="phone" label="Mobile (WhatsApp)" error={errors.phone}>
              <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" required
                value={fields.phone} onChange={(e) => set('phone', e.target.value)} onBlur={() => blur('phone')}
                aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'phone-error' : undefined}
                className={inputCls} placeholder="+971 5x xxx xxxx" />
            </Field>
            <Field id="country" label="Country of residence">
              <select id="country" name="country" autoComplete="country"
                value={fields.country} onChange={(e) => set('country', e.target.value)} className={inputCls}>
                {COUNTRIES.map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="nationality" label="Nationality" error={errors.nationality}>
              <select id="nationality" name="nationality" required
                value={fields.nationality} onChange={(e) => set('nationality', e.target.value)} onBlur={() => blur('nationality')}
                aria-invalid={!!errors.nationality} aria-describedby={errors.nationality ? 'nationality-error' : undefined}
                className={inputCls}>
                <option value="">Select nationality…</option>
                {COUNTRIES.map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </Field>
            <Field id="gender" label="Gender" error={errors.gender}>
              <select id="gender" name="gender" required
                value={fields.gender} onChange={(e) => set('gender', e.target.value)} onBlur={() => blur('gender')}
                aria-invalid={!!errors.gender} aria-describedby={errors.gender ? 'gender-error' : undefined}
                className={inputCls}>
                <option value="">Select…</option>
                {GENDER_OPTIONS.map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field id="residency" label="Are you a UAE resident?" error={errors.residency}>
            <div role="radiogroup" aria-labelledby="residency" className="grid grid-cols-2 gap-2">
              {RESIDENCY_OPTIONS.map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={fields.residency === k}
                  onClick={() => set('residency', k)}
                  className={`focus-ring rounded-btn border px-4 py-3 text-sm font-semibold transition-colors ${
                    fields.residency === k
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>
          <Field id="note" label="Special requests (optional)">
            <textarea id="note" name="note" rows={3} maxLength={500}
              value={fields.note} onChange={(e) => set('note', e.target.value)}
              className={inputCls} placeholder="Pick-up point, preferred date or time, dietary needs…" />
          </Field>
          {/* Honeypot — hidden from real users, bots tend to fill it. */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
          </div>
        </section>

        <section aria-labelledby="payment-heading">
          <PaymentMethods />
        </section>

        <div className="space-y-4">
          <button
            type="submit"
            disabled={submitting || !allValid}
            className="w-full rounded-btn bg-primary px-8 py-4 font-display font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50 focus-ring"
          >
            {submitting ? 'Placing your booking…' : 'Reserve my booking'}
          </button>
          <p aria-live="polite" className="sr-only">{submitting ? 'Placing your booking, please wait' : ''}</p>
          <p className="text-center text-sm text-neutral-500">
            Need help? {' '}
            <a href="https://wa.me/971585898221" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline focus-ring">
              WhatsApp us at +971 58 589 8221
            </a>
          </p>
        </div>
      </form>

      <div className="lg:sticky lg:top-24">
        <OrderSummary cart={cart}>
          <p className="flex items-start gap-2 text-xs text-neutral-500">
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="mt-0.5 shrink-0"><path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5Zm-3 8V6a3 3 0 1 1 6 0v3H9Z"/></svg>
            Secure booking — no payment taken online today. Pay by bank transfer with your pre-booking reference.
          </p>
        </OrderSummary>
      </div>
    </motion.div>
  )
}

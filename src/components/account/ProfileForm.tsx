'use client'
// Profile form — Phase 5. Dirty-state aware (Save disabled until changed,
// unsaved-changes warning on tab close), inline validation with
// aria-invalid/aria-describedby, aria-live toasts, double-submit guard,
// and an optional change-password section that always requires the current
// password (verified server-side — see /api/account/profile).
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Loader2, Eye, EyeOff, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react'
import { cn } from '@/lib/utils'

type Values = { firstName: string; lastName: string; email: string; phone: string; country: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^\+?[0-9 ()-]{6,20}$/

const COUNTRIES: Array<[string, string]> = [
  ['AE', 'United Arab Emirates'], ['SA', 'Saudi Arabia'], ['QA', 'Qatar'], ['KW', 'Kuwait'],
  ['BH', 'Bahrain'], ['OM', 'Oman'], ['EG', 'Egypt'], ['JO', 'Jordan'], ['LB', 'Lebanon'],
  ['IN', 'India'], ['PK', 'Pakistan'], ['PH', 'Philippines'], ['GB', 'United Kingdom'],
  ['US', 'United States'], ['DE', 'Germany'], ['FR', 'France'], ['RU', 'Russia'], ['CN', 'China'],
]

function Field({
  id, label, error, children,
}: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-secondary">{label}</label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-red-600">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden /> {error}
        </p>
      )}
    </div>
  )
}

const inputCls = (invalid?: boolean) =>
  cn(
    'focus-ring w-full rounded-btn border bg-white px-3.5 py-2.5 text-sm text-secondary placeholder:text-neutral-400',
    invalid ? 'border-red-400' : 'border-neutral-200',
  )

export function ProfileForm({ initial }: { initial: Values }) {
  const reduce = useReducedMotion()
  const [values, setValues] = useState<Values>(initial)
  const [saved, setSaved] = useState<Values>(initial)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const toastRef = useRef<HTMLDivElement>(null)

  const dirty =
    JSON.stringify(values) !== JSON.stringify(saved) || newPassword.length > 0

  // Unsaved-changes warning (tab close / hard navigation).
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const errors = useMemo(() => {
    const e: Partial<Record<keyof Values | 'newPassword' | 'currentPassword', string>> = {}
    if (!values.firstName.trim()) e.firstName = 'Please add your first name.'
    if (!values.lastName.trim()) e.lastName = 'Please add your last name.'
    if (!EMAIL_RE.test(values.email.trim())) e.email = 'Please enter a valid email address.'
    if (values.phone.trim() && !PHONE_RE.test(values.phone.trim())) e.phone = 'Please enter a valid phone number.'
    if (newPassword && newPassword.length < 8) e.newPassword = 'At least 8 characters.'
    if (newPassword && !currentPassword) e.currentPassword = 'Enter your current password to confirm.'
    return e
  }, [values, newPassword, currentPassword])

  const set = (k: keyof Values) => (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setValues((v) => ({ ...v, [k]: ev.target.value }))

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (busy || !dirty || Object.keys(errors).length > 0) return
    setBusy(true)
    setToast(null)
    try {
      const res = await fetch('/api/account/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          ...(newPassword ? { currentPassword, newPassword } : {}),
        }),
      })
      const json = await res.json().catch(() => null)
      if (json?.ok) {
        const next: Values = {
          firstName: json.customer?.firstName ?? values.firstName,
          lastName: json.customer?.lastName ?? values.lastName,
          email: json.customer?.email ?? values.email,
          phone: json.customer?.billing?.phone ?? values.phone,
          country: json.customer?.billing?.country ?? values.country,
        }
        setValues(next)
        setSaved(next)
        setCurrentPassword('')
        setNewPassword('')
        setToast({
          kind: 'ok',
          text: json.passwordChanged
            ? 'Profile saved and password updated.'
            : json.emailChanged
              ? 'Profile saved. Use your new email next time you sign in.'
              : 'Profile saved.',
        })
      } else {
        setToast({ kind: 'err', text: json?.message || 'We couldn’t save your changes. Please try again.' })
      }
    } catch {
      setToast({ kind: 'err', text: 'We couldn’t save your changes. Please check your connection and try again.' })
    } finally {
      setBusy(false)
      // Move SR + keyboard attention to the result.
      requestAnimationFrame(() => toastRef.current?.focus())
    }
  }

  return (
    <motion.form
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onSubmit={onSubmit}
      noValidate
      className="rounded-card bg-white p-5 shadow-card sm:p-6"
    >
      <h2 className="font-display mb-5 text-lg font-bold text-secondary">Personal details</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="pf-first" label="First name" error={errors.firstName}>
          <input id="pf-first" autoComplete="given-name" value={values.firstName} onChange={set('firstName')}
            aria-invalid={Boolean(errors.firstName)} aria-describedby={errors.firstName ? 'pf-first-error' : undefined}
            className={inputCls(Boolean(errors.firstName))} />
        </Field>
        <Field id="pf-last" label="Last name" error={errors.lastName}>
          <input id="pf-last" autoComplete="family-name" value={values.lastName} onChange={set('lastName')}
            aria-invalid={Boolean(errors.lastName)} aria-describedby={errors.lastName ? 'pf-last-error' : undefined}
            className={inputCls(Boolean(errors.lastName))} />
        </Field>
        <Field id="pf-email" label="Email" error={errors.email}>
          <input id="pf-email" type="email" autoComplete="email" value={values.email} onChange={set('email')}
            aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'pf-email-error' : undefined}
            className={inputCls(Boolean(errors.email))} />
        </Field>
        <Field id="pf-phone" label="Phone (WhatsApp preferred)" error={errors.phone}>
          <input id="pf-phone" type="tel" autoComplete="tel" placeholder="+971 5x xxx xxxx" value={values.phone} onChange={set('phone')}
            aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'pf-phone-error' : undefined}
            className={inputCls(Boolean(errors.phone))} />
        </Field>
        <Field id="pf-country" label="Country">
          <select id="pf-country" autoComplete="country" value={values.country} onChange={set('country')} className={inputCls()}>
            {COUNTRIES.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
            {!COUNTRIES.some(([c]) => c === values.country) && values.country && (
              <option value={values.country}>{values.country}</option>
            )}
          </select>
        </Field>
      </div>

      {/* Change password (optional) */}
      <fieldset className="mt-7 rounded-btn border border-neutral-100 bg-neutral-50/60 p-4">
        <legend className="flex items-center gap-2 px-1 text-sm font-bold text-secondary">
          <KeyRound className="h-4 w-4 text-primary" aria-hidden /> Change password
          <span className="font-normal text-neutral-400">(optional)</span>
        </legend>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <Field id="pf-curpw" label="Current password" error={errors.currentPassword}>
            <input id="pf-curpw" type="password" autoComplete="current-password" value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              aria-invalid={Boolean(errors.currentPassword)}
              aria-describedby={errors.currentPassword ? 'pf-curpw-error' : undefined}
              className={inputCls(Boolean(errors.currentPassword))} />
          </Field>
          <Field id="pf-newpw" label="New password" error={errors.newPassword}>
            <div className="relative">
              <input id="pf-newpw" type={showPw ? 'text' : 'password'} autoComplete="new-password" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                aria-invalid={Boolean(errors.newPassword)}
                aria-describedby={errors.newPassword ? 'pf-newpw-error' : undefined}
                className={cn(inputCls(Boolean(errors.newPassword)), 'pr-11')} />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? 'Hide new password' : 'Show new password'}
                className="focus-ring absolute right-2 top-1/2 -translate-y-1/2 rounded-btn p-1.5 text-neutral-400 hover:text-secondary">
                {showPw ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
              </button>
            </div>
          </Field>
        </div>
      </fieldset>

      {/* Result toast — focusable so SR/keyboard users land on it */}
      <div ref={toastRef} tabIndex={-1} aria-live="polite" className="outline-none">
        {toast && (
          <p className={cn(
            'mt-4 flex items-center gap-2 rounded-btn px-3.5 py-2.5 text-sm font-semibold',
            toast.kind === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600',
          )}>
            {toast.kind === 'ok'
              ? <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
              : <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />}
            {toast.text}
          </p>
        )}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          disabled={busy || !dirty || Object.keys(errors).length > 0}
          className="focus-ring inline-flex items-center gap-2 rounded-btn bg-primary px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {busy ? 'Saving…' : 'Save changes'}
        </button>
        {dirty && !busy && <span className="text-xs text-neutral-400">You have unsaved changes</span>}
      </div>
    </motion.form>
  )
}

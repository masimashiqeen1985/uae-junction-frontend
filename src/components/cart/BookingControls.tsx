'use client'
/**
 * BookingControls — PDP buy-box: Select Date (required) + Quantity stepper + CTA.
 *
 * Additive, risk-free: quantity flows natively as the Woo cart line quantity;
 * the travel date is held in frontend cart state (CartProvider.bookingDates,
 * localStorage) and folded into the order's customer note at checkout — no Woo
 * cart item-meta or CMS changes. Built entirely on .cloud design tokens.
 */
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Calendar, Check, ChevronLeft, ChevronRight, Loader2, Minus, Plus, ShoppingCart, X } from 'lucide-react'
import { useCart } from './CartProvider'
import { formatBookingDate, isoOf, minBookingDate, maxBookingDate } from '@/lib/utils'

const QTY_MIN = 1
const QTY_MAX = 10
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function parseISO(iso: string) { const [y, m, d] = iso.split('-').map(Number); return { y, m, d } }
function daysInMonth(y: number, m: number) { return new Date(Date.UTC(y, m, 0)).getUTCDate() }
// Monday-first weekday index (0=Mon..6=Sun) of the 1st of the month.
function firstWeekday(y: number, m: number) { return (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7 }

interface Props { productId: number; productName: string }

export function BookingControls({ productId, productName }: Props) {
  const { addToCart, status, error, setBookingDate, bookingDates } = useCart()
  const router = useRouter()
  const reduce = useReducedMotion()

  const min = useMemo(() => minBookingDate(), [])
  const max = useMemo(() => maxBookingDate(), [])

  const [date, setDate] = useState<string>(() => bookingDates[productId] || '')
  const [qty, setQty] = useState(QTY_MIN)
  const [open, setOpen] = useState(false)
  const [dateError, setDateError] = useState(false)
  const [done, setDone] = useState(false)
  // Month shown in the calendar popover (defaults to the min-allowed month).
  const [view, setView] = useState(() => { const { y, m } = parseISO(bookingDates[productId] || min); return { y, m } })

  const busy = status === 'mutating'
  const fieldId = useId()
  const popRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Close popover on outside click + Esc; restore focus to the trigger.
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus() } }
    function onClick(e: MouseEvent) {
      if (popRef.current && !popRef.current.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick) }
  }, [open])

  const pickDate = useCallback((iso: string) => {
    setDate(iso); setDateError(false); setOpen(false); triggerRef.current?.focus()
  }, [])

  const clearDate = useCallback((e: React.MouseEvent) => { e.stopPropagation(); setDate(''); }, [])

  const setQtyClamped = useCallback((n: number) => setQty(Math.max(QTY_MIN, Math.min(QTY_MAX, Math.floor(n) || QTY_MIN))), [])

  const onAdd = useCallback(async () => {
    if (!date) { setDateError(true); setOpen(true); return }
    setDone(false)
    setBookingDate(productId, date)
    const ok = await addToCart(productId, qty)
    if (ok) { setDone(true); setTimeout(() => router.push('/cart'), 500) }
  }, [date, qty, productId, addToCart, setBookingDate, router])

  // Build the calendar grid for the viewed month.
  const grid = useMemo(() => {
    const lead = firstWeekday(view.y, view.m)
    const total = daysInMonth(view.y, view.m)
    const cells: ({ iso: string; day: number; disabled: boolean } | null)[] = []
    for (let i = 0; i < lead; i++) cells.push(null)
    for (let d = 1; d <= total; d++) { const iso = isoOf(view.y, view.m, d); cells.push({ iso, day: d, disabled: iso < min || iso > max }) }
    return cells
  }, [view, min, max])

  const canPrev = isoOf(view.y, view.m, daysInMonth(view.y, view.m)) >= min && !(view.y === parseISO(min).y && view.m <= parseISO(min).m)
  const canNext = isoOf(view.y, view.m, 1) < max && !(view.y === parseISO(max).y && view.m >= parseISO(max).m)
  const shiftMonth = (delta: number) => setView((v) => { const idx = v.m - 1 + delta; return { y: v.y + Math.floor(idx / 12), m: ((idx % 12) + 12) % 12 + 1 } })

  return (
    <div className="space-y-5">
      {/* Date */}
      <div>
        <label htmlFor={fieldId} className="block text-sm font-semibold text-neutral-800 mb-1.5">
          Select Date <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <div className="relative">
          <button
            ref={triggerRef} id={fieldId} type="button"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="dialog" aria-expanded={open} aria-required="true" aria-invalid={dateError}
            aria-label={`Select travel date for ${productName}`}
            aria-describedby={dateError ? `${fieldId}-err` : undefined}
            className={`focus-ring flex w-full items-center justify-between rounded-btn border bg-white px-4 py-3.5 text-left transition-colors ${dateError ? 'border-red-400 ring-1 ring-red-300' : 'border-neutral-200 hover:border-primary'}`}
          >
            <span className={`flex items-center gap-2 ${date ? 'text-neutral-900' : 'text-neutral-400'}`}>
              <Calendar className="h-5 w-5 text-primary" aria-hidden="true" />
              {date ? formatBookingDate(date) : 'Choose your travel date'}
            </span>
            {date
              ? <span role="button" tabIndex={0} aria-label="Clear date" onClick={clearDate}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setDate('') } }}
                  className="grid h-6 w-6 place-items-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"><X className="h-4 w-4" /></span>
              : <ChevronRight className="h-4 w-4 text-neutral-300" aria-hidden="true" />}
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                ref={popRef} role="dialog" aria-label="Choose travel date"
                initial={reduce ? false : { opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="absolute left-0 right-0 z-30 mt-2 rounded-card border border-neutral-100 bg-white p-4 shadow-card sm:max-w-xs"
              >
                <div className="mb-3 flex items-center justify-between">
                  <button type="button" onClick={() => shiftMonth(-1)} disabled={!canPrev} aria-label="Previous month"
                    className="focus-ring grid h-8 w-8 place-items-center rounded-btn text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
                  <span aria-live="polite" className="font-display text-sm font-bold text-secondary">{MONTHS[view.m - 1]} {view.y}</span>
                  <button type="button" onClick={() => shiftMonth(1)} disabled={!canNext} aria-label="Next month"
                    className="focus-ring grid h-8 w-8 place-items-center rounded-btn text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
                </div>
                <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[0.68rem] font-semibold text-neutral-400">
                  {WEEKDAYS.map((w) => <span key={w}>{w}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {grid.map((c, i) => c === null
                    ? <span key={`e${i}`} />
                    : <button key={c.iso} type="button" disabled={c.disabled} onClick={() => pickDate(c.iso)}
                        aria-label={formatBookingDate(c.iso)} aria-pressed={date === c.iso}
                        className={`focus-ring grid h-9 place-items-center rounded-btn text-sm transition-colors ${
                          date === c.iso ? 'bg-primary font-bold text-white'
                          : c.disabled ? 'cursor-not-allowed text-neutral-300'
                          : 'text-neutral-700 hover:bg-primary/10 hover:text-primary-dark'}`}>{c.day}</button>)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Reserve height to avoid CLS when the error appears. */}
        <p id={`${fieldId}-err`} aria-live="polite" className="mt-1.5 min-h-[1.1rem] text-sm text-red-600">
          {dateError ? 'Please choose your travel date to continue.' : ''}
        </p>
      </div>

      {/* Quantity */}
      <div>
        <span className="block text-sm font-semibold text-neutral-800 mb-1.5">Quantity</span>
        <div className="inline-flex items-center rounded-btn border border-neutral-200 bg-white">
          <motion.button whileTap={reduce ? undefined : { scale: 0.9 }} type="button" aria-label="Decrease quantity"
            onClick={() => setQtyClamped(qty - 1)} disabled={qty <= QTY_MIN}
            className="focus-ring grid h-11 w-11 place-items-center text-primary hover:bg-primary/5 disabled:opacity-30"><Minus className="h-5 w-5" /></motion.button>
          <input type="text" inputMode="numeric" aria-label="Quantity" value={qty}
            onChange={(e) => setQtyClamped(Number(e.target.value.replace(/\D/g, '')))}
            className="h-11 w-12 border-x border-neutral-200 text-center text-base font-semibold text-neutral-900 focus-ring" />
          <motion.button whileTap={reduce ? undefined : { scale: 0.9 }} type="button" aria-label="Increase quantity"
            onClick={() => setQtyClamped(qty + 1)} disabled={qty >= QTY_MAX}
            className="focus-ring grid h-11 w-11 place-items-center text-primary hover:bg-primary/5 disabled:opacity-30"><Plus className="h-5 w-5" /></motion.button>
          <span className="sr-only" aria-live="polite">Quantity {qty}</span>
        </div>
      </div>

      {/* CTA */}
      <div>
        <button type="button" onClick={onAdd} disabled={busy} aria-live="polite"
          className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-btn bg-primary py-4 text-lg font-bold text-white transition-colors hover:bg-primary-dark disabled:opacity-70">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : done ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
          {busy ? 'Adding…' : done ? 'Added to basket' : 'Add to basket'}
        </button>
        {error && status === 'error' && (
          <p className="mt-2 text-sm text-red-600">Couldn’t add to basket. Please try again or message us on WhatsApp.</p>
        )}
      </div>
    </div>
  )
}

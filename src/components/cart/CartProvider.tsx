'use client'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Cart } from '@/lib/queries/cart'

type Status = 'idle' | 'loading' | 'mutating' | 'error'
interface CartCtx {
  cart: Cart | null
  itemCount: number
  status: Status
  error: string | null
  refresh: () => Promise<void>
  addToCart: (productId: number, quantity?: number) => Promise<boolean>
  updateQty: (key: string, quantity: number) => Promise<void>
  removeItem: (key: string) => Promise<void>
  clearCart: () => Promise<void>
  bookingDates: Record<number, string>
  setBookingDate: (productId: number, isoDate: string) => void
}

const Ctx = createContext<CartCtx | null>(null)

async function post(action: string, payload: Record<string, unknown> = {}) {
  const res = await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || 'cart-error')
  return (await res.json()) as { cart: Cart | null }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [bookingDates, setBookingDates] = useState<Record<number, string>>({})

  // Travel dates are a frontend-only concern (no Woo cart item-meta change):
  // persisted per productId in localStorage and folded into the order's
  // customer note at checkout. Survives guest sessions and reloads.
  useEffect(() => {
    try {
      const raw = localStorage.getItem('uaej:booking-dates')
      if (raw) setBookingDates(JSON.parse(raw) as Record<number, string>)
    } catch { /* ignore corrupt/unavailable storage */ }
  }, [])

  const setBookingDate = useCallback((productId: number, isoDate: string) => {
    setBookingDates((prev) => {
      const next = { ...prev, [productId]: isoDate }
      try { localStorage.setItem('uaej:booking-dates', JSON.stringify(next)) } catch { /* non-fatal */ }
      return next
    })
  }, [])

  const refresh = useCallback(async () => {
    setStatus('loading')
    try {
      const res = await fetch('/api/cart', { cache: 'no-store' })
      const data = (await res.json()) as { cart: Cart | null }
      setCart(data.cart ?? null)
      setStatus('idle')
      setError(null)
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const run = useCallback(async (action: string, payload: Record<string, unknown>) => {
    setStatus('mutating'); setError(null)
    try {
      const { cart: next } = await post(action, payload)
      setCart(next ?? null)
      setStatus('idle')
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setStatus('error')
      void refresh()
      return false
    }
  }, [refresh])

  const addToCart = useCallback((productId: number, quantity = 1) => run('add', { productId, quantity }), [run])
  const updateQty = useCallback(async (key: string, quantity: number) => { await run('update', { key, quantity }) }, [run])
  const removeItem = useCallback(async (key: string) => { await run('remove', { key }) }, [run])
  const clearCart = useCallback(async () => { await run('clear', {}) }, [run])

  const itemCount = cart?.contents?.itemCount ?? 0

  return (
    <Ctx.Provider value={{ cart, itemCount, status, error, refresh, addToCart, updateQty, removeItem, clearCart, bookingDates, setBookingDate }}>
      {children}
    </Ctx.Provider>
  )
}

export function useCart(): CartCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

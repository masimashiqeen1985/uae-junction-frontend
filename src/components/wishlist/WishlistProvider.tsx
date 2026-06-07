'use client'
// Global wishlist state — single source of truth for every heart on the site.
// Auth detection is done by probing GET /api/account/wishlist (401 = guest),
// deliberately NOT via useSession: the provider must also work when auth is
// unconfigured (it mounts outside SessionWrapper in the root layout).
// Guest hearts persist in localStorage and are MERGED into the account on the
// first authenticated sync after sign-in (then the local copy is cleared).
import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
} from 'react'

const GUEST_KEY = 'uaej_wishlist_guest'
const MAX = 100

type WishlistCtx = {
  ids: number[]
  count: number
  ready: boolean
  authed: boolean
  has: (id: number) => boolean
  toggle: (id: number) => void
}

const Ctx = createContext<WishlistCtx | null>(null)

function readGuest(): number[] {
  try {
    const raw = window.localStorage.getItem(GUEST_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr)
      ? [...new Set(arr.map(Number).filter((n) => Number.isInteger(n) && n > 0))].slice(0, MAX)
      : []
  } catch {
    return []
  }
}

function writeGuest(ids: number[]) {
  try {
    window.localStorage.setItem(GUEST_KEY, JSON.stringify(ids.slice(0, MAX)))
  } catch {
    /* storage unavailable — session-only hearts, never an error */
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<number[]>([])
  const [ready, setReady] = useState(false)
  const [authed, setAuthed] = useState(false)
  const syncing = useRef(false)

  const sync = useCallback(async () => {
    if (syncing.current) return
    syncing.current = true
    try {
      const res = await fetch('/api/account/wishlist', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json().catch(() => null)
        let server: number[] = Array.isArray(json?.ids) ? json.ids : []
        // One-time merge of guest hearts into the account.
        const guest = readGuest().filter((id) => !server.includes(id))
        if (guest.length) {
          const m = await fetch('/api/account/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productIds: guest }),
          })
          if (m.ok) {
            const mj = await m.json().catch(() => null)
            if (Array.isArray(mj?.ids)) server = mj.ids
            try { window.localStorage.removeItem(GUEST_KEY) } catch { /* noop */ }
          }
        }
        setAuthed(true)
        setIds(server)
      } else {
        // 401 (guest) or upstream issue — run on the local copy, lose nothing.
        setAuthed(false)
        setIds(readGuest())
      }
    } catch {
      setAuthed(false)
      setIds(readGuest())
    } finally {
      syncing.current = false
      setReady(true)
    }
  }, [])

  useEffect(() => {
    void sync()
    const onFocus = () => void sync()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [sync])

  const toggle = useCallback(
    (id: number) => {
      if (!Number.isInteger(id) || id <= 0) return
      const saved = ids.includes(id)
      const next = saved ? ids.filter((x) => x !== id) : [...ids, id].slice(0, MAX)
      setIds(next) // optimistic — rollback below on API failure
      if (!authed) {
        writeGuest(next)
        return
      }
      void fetch('/api/account/wishlist', {
        method: saved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: [id] }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('wishlist write failed')
          const json = await res.json().catch(() => null)
          if (Array.isArray(json?.ids)) setIds(json.ids)
        })
        .catch(() => setIds(ids)) // rollback to pre-toggle state
    },
    [ids, authed],
  )

  const has = useCallback((id: number) => ids.includes(id), [ids])

  return (
    <Ctx.Provider value={{ ids, count: ids.length, ready, authed, has, toggle }}>
      {children}
    </Ctx.Provider>
  )
}

export function useWishlist(): WishlistCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useWishlist must be used inside <WishlistProvider>')
  return ctx
}

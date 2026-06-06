'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, useCallback, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Search, X, Loader2, ArrowRight, SearchX } from 'lucide-react'
import type { SearchResult } from '@/app/api/search/route'

type Props = {
  open: boolean
  onClose: () => void
}

export function SearchOverlay({ open, onClose }: Props) {
  const reduce = useReducedMotion()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [term, setTerm] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState(false)
  const [active, setActive] = useState(-1)

  // Reset state whenever the overlay is opened, and focus the field.
  useEffect(() => {
    if (!open) return
    setTerm('')
    setResults([])
    setTouched(false)
    setActive(-1)
    const id = window.setTimeout(() => inputRef.current?.focus(), 60)
    return () => window.clearTimeout(id)
  }, [open])

  // Lock background scroll while open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Debounced search against the server route (avoids browser->CMS CORS).
  useEffect(() => {
    if (!open) return
    const q = term.trim()
    if (q.length < 2) {
      setResults([])
      setLoading(false)
      setTouched(q.length > 0)
      return
    }
    setLoading(true)
    setTouched(true)
    const ctrl = new AbortController()
    const id = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        const json = (await res.json()) as { results?: SearchResult[] }
        setResults(Array.isArray(json.results) ? json.results : [])
        setActive(-1)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => {
      ctrl.abort()
      window.clearTimeout(id)
    }
  }, [term, open])

  const go = useCallback(
    (slug: string) => {
      onClose()
      router.push(`/product/${slug}`)
    },
    [onClose, router],
  )

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
      return
    }
    if (!results.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1))
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault()
      go(results[active].slug)
    }
  }

  const showEmpty = touched && !loading && term.trim().length >= 2 && results.length === 0

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label="Search products"
          onKeyDown={onKeyDown}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close search"
            onClick={onClose}
            className="absolute inset-0 h-full w-full cursor-default bg-neutral-900/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            className="relative mx-4 mt-[12vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-black/5 bg-white shadow-2xl"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: reduce ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Input row */}
            <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3 sm:px-5">
              <Search className="h-5 w-5 shrink-0 text-[var(--c-primary)]" aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search experiences, tours, attractions…"
                aria-label="Search experiences"
                aria-controls="search-results"
                className="w-full bg-transparent text-base text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
                autoComplete="off"
                spellCheck={false}
              />
              {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-neutral-400" aria-hidden="true" />}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close search"
                className="focus-ring rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Results */}
            <div id="search-results" role="listbox" aria-label="Search results" className="max-h-[60vh] overflow-y-auto">
              {results.map((r, i) => (
                <Link
                  key={r.id}
                  href={`/product/${r.slug}`}
                  role="option"
                  aria-selected={active === i}
                  onClick={onClose}
                  onMouseEnter={() => setActive(i)}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors sm:px-5 ${
                    active === i ? 'bg-[#e7faf7]' : 'hover:bg-neutral-50'
                  }`}
                >
                  <span className="flex h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                    {r.image?.sourceUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.image.sourceUrl}
                        alt={r.image.altText}
                        width={48}
                        height={48}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-neutral-300">
                        <Search className="h-4 w-4" />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-neutral-800">{r.name}</span>
                    {r.price && (
                      <span className="mt-0.5 flex items-center gap-2 text-xs">
                        <span className="font-bold text-[var(--c-primary-dark)]">{r.price}</span>
                        {r.onSale && r.regularPrice && (
                          <span className="text-neutral-400 line-through">{r.regularPrice}</span>
                        )}
                      </span>
                    )}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-neutral-300" aria-hidden="true" />
                </Link>
              ))}

              {showEmpty && (
                <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                    <SearchX className="h-6 w-6" />
                  </span>
                  <p className="text-sm font-semibold text-neutral-700">
                    No experiences match “{term.trim()}”
                  </p>
                  <p className="text-xs text-neutral-400">Try a different keyword — like “desert”, “cruise”, or “theme park”.</p>
                </div>
              )}

              {!touched && (
                <div className="px-6 py-10 text-center">
                  <p className="text-sm text-neutral-500">Start typing to find experiences across the UAE.</p>
                  <p className="mt-1 text-xs text-neutral-400">Every booking earns 2.5% cashback.</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

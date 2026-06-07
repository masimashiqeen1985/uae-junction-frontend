'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

/** Hero search bar — WHERE (destination combobox) + WHEN (calendar, defaults to tomorrow). */

export type HeroCity = { name: string; slug: string; count: number }
export type HeroCountry = { name: string; slug: string; cities: HeroCity[] }

/** Hardcoded mirror of the live CMS Destination taxonomy — used only if the
 *  server-side fetch fails, so the search bar never renders empty. */
const FALLBACK: HeroCountry[] = [
  {
    name: 'United Arab Emirates',
    slug: 'united-arab-emirates',
    cities: [
      { name: 'Dubai', slug: 'dubai', count: 68 },
      { name: 'Abu Dhabi', slug: 'abu-dhabi', count: 15 },
      { name: 'Sharjah', slug: 'sharjah', count: 2 },
      { name: 'Ras Al Khaimah', slug: 'ras-al-khaimah', count: 2 },
      { name: 'Al Ain', slug: 'al-ain', count: 1 },
      { name: 'Fujairah', slug: 'fujairah', count: 1 },
    ],
  },
  { name: 'Saudi Arabia', slug: 'saudi-arabia', cities: [{ name: 'Makkah', slug: 'makkah', count: 6 }] },
  { name: 'Oman', slug: 'oman', cities: [{ name: 'Musandam', slug: 'musandam', count: 2 }] },
  { name: 'Georgia', slug: 'georgia', cities: [{ name: 'Tbilisi', slug: 'tbilisi', count: 1 }] },
]

type Pick_ = { name: string; slug: string }

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DOW = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
function tomorrow(): Date {
  const d = startOfDay(new Date())
  d.setDate(d.getDate() + 1)
  return d
}
function isoDate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}
function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
function dateLabel(d: Date): string {
  const today = startOfDay(new Date())
  if (sameDay(d, today)) return 'Today'
  if (sameDay(d, tomorrow())) return 'Tomorrow'
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

const TAB_PH: Record<string, [string, string]> = {
  Experiences: ['Desert safari, Aquaventure…', 'This weekend'],
  Staycations: ['Resort, beach hotel, spa…', 'Choose your dates'],
  Packages: ['Umrah, holiday, city break…', 'Flexible dates'],
}
const TABS = Object.keys(TAB_PH)

export function HeroSearch({ destinations = [] }: { destinations?: HeroCountry[] }) {
  const router = useRouter()
  const rootRef = useRef<HTMLDivElement>(null)
  const whereInputRef = useRef<HTMLInputElement>(null)

  const data = destinations.length > 0 ? destinations : FALLBACK

  const [tab, setTab] = useState('Experiences')
  const [query, setQuery] = useState('')
  const [dest, setDest] = useState<Pick_ | null>(null)
  const [whereText, setWhereText] = useState('')
  const [date, setDate] = useState<Date | null>(null)
  const [open, setOpen] = useState<'where' | 'when' | null>(null)
  const [active, setActive] = useState(-1)
  const [view, setView] = useState<{ y: number; m: number } | null>(null)
  const [hint, setHint] = useState(false)

  // Default WHEN to tomorrow — client-only so SSR markup stays stable (no hydration mismatch).
  useEffect(() => {
    setDate(tomorrow())
  }, [])

  // Close popovers on outside click / Escape.
  useEffect(() => {
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('touchstart', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('touchstart', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  // Flattened, filtered option list: country headers + city rows.
  const options = useMemo(() => {
    const f = whereText.trim().toLowerCase()
    const out: { kind: 'group' | 'city'; name: string; slug: string; country?: string; count?: number }[] = []
    for (const c of data) {
      const cities = c.cities.filter((x) => x.count > 0 && (!f || x.name.toLowerCase().includes(f) || c.name.toLowerCase().includes(f)))
      const countryMatches = !f || c.name.toLowerCase().includes(f)
      if (cities.length === 0 && !countryMatches) continue
      out.push({ kind: 'group', name: c.name, slug: c.slug })
      for (const x of cities) out.push({ kind: 'city', name: x.name, slug: x.slug, country: c.name, count: x.count })
    }
    return out
  }, [data, whereText])

  const selectable = useMemo(() => options.map((o, i) => ({ o, i })).filter(({ o }) => o.kind === 'city'), [options])

  const pickDest = useCallback((p: Pick_) => {
    setDest(p)
    setWhereText(p.name)
    setOpen(null)
    setActive(-1)
    setHint(false)
  }, [])

  const openWhen = () => {
    // Recompute "tomorrow" at open time (handles tabs left open across midnight).
    const base = date && startOfDay(date) >= startOfDay(new Date()) ? date : tomorrow()
    if (!date || startOfDay(date) < startOfDay(new Date())) setDate(base)
    setView({ y: base.getFullYear(), m: base.getMonth() })
    setOpen(open === 'when' ? null : 'when')
  }

  const onWhereKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (open !== 'where') setOpen('where')
      if (selectable.length === 0) return
      const pos = selectable.findIndex(({ i }) => i === active)
      const next = e.key === 'ArrowDown' ? Math.min(pos + 1, selectable.length - 1) : Math.max(pos - 1, 0)
      setActive(selectable[next].i)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const hit = options[active]
      if (open === 'where' && hit && hit.kind === 'city') pickDest({ name: hit.name, slug: hit.slug })
      else doSearch()
    }
  }

  const doSearch = () => {
    const params = new URLSearchParams()
    if (date) params.set('date', isoDate(date))
    const q = query.trim()
    if (q) params.set('q', q)
    if (dest) {
      router.push(`/destinations/${dest.slug}${params.toString() ? `?${params.toString()}` : ''}`)
    } else if (q) {
      router.push(`/experiences?${params.toString()}`)
    } else {
      setHint(true)
      setOpen('where')
      whereInputRef.current?.focus()
    }
  }

  // ---- calendar grid for the viewed month ----
  const today = startOfDay(new Date())
  const cal = useMemo(() => {
    if (!view) return null
    const first = new Date(view.y, view.m, 1)
    const lead = (first.getDay() + 6) % 7 // Monday-first offset
    const days = new Date(view.y, view.m + 1, 0).getDate()
    const cells: (Date | null)[] = []
    for (let i = 0; i < lead; i++) cells.push(null)
    for (let d = 1; d <= days; d++) cells.push(new Date(view.y, view.m, d))
    return cells
  }, [view])

  const canPrev = view ? new Date(view.y, view.m, 1) > new Date(today.getFullYear(), today.getMonth(), 1) : false

  return (
    <div className="searchwrap" ref={rootRef}>
      <div className="search-tabs" role="tablist" aria-label="Search category">
        {TABS.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} className={tab === t ? 'active' : undefined} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      <div className="searchbar">
        <label className="field">
          <span className="ic">🔍</span>
          <span style={{ minWidth: '0', flex: '1' }}>
            <small>What to do</small>
            <input
              type="text"
              placeholder={TAB_PH[tab][0]}
              aria-label="Search experiences"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); doSearch() } }}
            />
          </span>
        </label>
        <div className={`field sb-anchor${hint ? ' sb-hint' : ''}`}>
          <span className="ic">📍</span>
          <span style={{ minWidth: '0', flex: '1' }}>
            <small id="hs-where-label">Where</small>
            <input
              ref={whereInputRef}
              type="text"
              placeholder="Dubai"
              role="combobox"
              aria-label="Destination"
              aria-expanded={open === 'where'}
              aria-controls="hs-where-list"
              aria-autocomplete="list"
              aria-activedescendant={active >= 0 ? `hs-opt-${active}` : undefined}
              value={whereText}
              onFocus={() => { setOpen('where'); setHint(false) }}
              onClick={() => setOpen('where')}
              onChange={(e) => { setWhereText(e.target.value); setDest(null); setOpen('where'); setActive(-1) }}
              onKeyDown={onWhereKey}
            />
          </span>
          {open === 'where' && (
            <div className="sb-pop" role="presentation">
              <ul id="hs-where-list" role="listbox" aria-labelledby="hs-where-label" className="sb-opts">
                {options.length === 0 && <li className="sb-empty">No destinations match “{whereText.trim()}”</li>}
                {options.map((o, i) =>
                  o.kind === 'group' ? (
                    <li key={`g-${o.slug}`} className="sb-group" role="presentation">{o.name}</li>
                  ) : (
                    <li
                      key={o.slug}
                      id={`hs-opt-${i}`}
                      role="option"
                      aria-selected={dest?.slug === o.slug}
                      className={`sb-opt${i === active ? ' is-active' : ''}`}
                      onMouseEnter={() => setActive(i)}
                      onMouseDown={(e) => { e.preventDefault(); pickDest({ name: o.name, slug: o.slug }) }}
                    >
                      <span className="sb-opt-ic" aria-hidden="true">📍</span>
                      <span className="sb-opt-name">{o.name}</span>
                      <span className="sb-opt-count">{o.count} {o.count === 1 ? 'activity' : 'activities'}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}
        </div>
        <div className="field sb-anchor">
          <span className="ic">📅</span>
          <button type="button" className="sb-when" aria-haspopup="dialog" aria-expanded={open === 'when'} onClick={openWhen}>
            <small>When</small>
            <span className="sb-when-val">{date ? dateLabel(date) : 'Tomorrow'}</span>
          </button>
          {open === 'when' && view && cal && (
            <div className="sb-pop sb-cal" role="dialog" aria-label="Choose a date">
              <div className="sb-cal-head">
                <button type="button" className="sb-cal-nav" aria-label="Previous month" disabled={!canPrev} onClick={() => setView((v) => v && (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }))}>‹</button>
                <strong>{MONTHS[view.m]} {view.y}</strong>
                <button type="button" className="sb-cal-nav" aria-label="Next month" onClick={() => setView((v) => v && (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }))}>›</button>
              </div>
              <div className="sb-cal-grid" role="grid">
                {DOW.map((d) => (
                  <span key={d} className="sb-cal-dow" role="columnheader" aria-label={d}>{d}</span>
                ))}
                {cal.map((d, i) =>
                  d ? (
                    <button
                      key={i}
                      type="button"
                      role="gridcell"
                      className={`sb-cal-day${date && sameDay(d, date) ? ' is-sel' : ''}${sameDay(d, today) ? ' is-today' : ''}`}
                      disabled={d < today}
                      aria-label={d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      aria-pressed={Boolean(date && sameDay(d, date))}
                      onClick={() => { setDate(d); setOpen(null) }}
                    >
                      {d.getDate()}
                    </button>
                  ) : (
                    <span key={i} aria-hidden="true" />
                  ),
                )}
              </div>
              <div className="sb-cal-foot">
                <button type="button" onClick={() => { setDate(startOfDay(new Date())); setOpen(null) }}>Today</button>
                <button type="button" onClick={() => { setDate(tomorrow()); setOpen(null) }}>Tomorrow</button>
              </div>
            </div>
          )}
        </div>
        <button type="button" className="btn btn-grad search-go" aria-label="Search" onClick={doSearch}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          Search
        </button>
      </div>
    </div>
  )
}

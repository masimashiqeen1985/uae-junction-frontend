'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { COUNTRIES } from '@/lib/countries'
import type {
  Board,
  Cabin,
  EnquiryPayload,
  FlightTrip,
  StarTier,
  TripType,
} from '@/lib/enquiry'
import { buildSummary } from '@/lib/enquiry'
import './enquiry.css'

const STEPS = ['Travellers', 'Destination', 'Trip details', 'Preferences', 'Contact'] as const

const todayISO = () => new Date().toISOString().slice(0, 10)
const tomorrowISO = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}
const plusDaysISO = (base: string, days: number) => {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

type Form = EnquiryPayload

const DEFAULTS: Form = {
  tripType: 'both',
  adults: 1,
  childrenAges: [],
  infants: 0,
  country: '',
  city: '',
  flightTrip: 'round',
  departDate: tomorrowISO(),
  returnDate: plusDaysISO(tomorrowISO(), 7),
  cabin: 'economy',
  baggage: 'Checked bag(s)',
  checkIn: tomorrowISO(),
  checkOut: plusDaysISO(tomorrowISO(), 7),
  starTier: undefined,
  rooms: 1,
  board: 'breakfast',
  bed: 'No preference',
  addOns: [],
  contactMethod: 'whatsapp',
  name: '',
  email: '',
  mobile: '',
  contactConsent: false,
  marketingConsent: false,
}

const STORAGE_KEY = 'uaej_enquiry_draft_v1'

const ADDONS = [
  'Airport transfers',
  'Visa assistance',
  'Travel insurance',
  'Tours & activities',
  'SIM / eSIM',
  'Car rental',
]

/* ------------------------- Airport autocomplete ------------------------- */
type AirportResult = { iata: string; name: string; city: string; country: string }

function AirportField({
  label,
  value,
  onChange,
  invalid,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  invalid?: boolean
}) {
  const [q, setQ] = useState(value)
  const [results, setResults] = useState<AirportResult[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => setQ(value), [value])

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    const ctrl = new AbortController()
    const id = setTimeout(() => {
      fetch(`/api/airports?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => {
          setResults(d.results || [])
          setActive(-1)
        })
        .catch(() => {})
    }, 250)
    return () => {
      clearTimeout(id)
      ctrl.abort()
    }
  }, [q])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const pick = (a: AirportResult) => {
    const label = `${a.city} (${a.iata})`
    setQ(label)
    onChange(label)
    setOpen(false)
  }

  return (
    <div className="enqw-field enqw-ac" ref={boxRef}>
      <label>
        {label} <span className="req">*</span>
      </label>
      <input
        type="text"
        value={q}
        autoComplete="off"
        aria-invalid={invalid || undefined}
        placeholder="City, airport or IATA code"
        onChange={(e) => {
          setQ(e.target.value)
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => results.length && setOpen(true)}
        onKeyDown={(e) => {
          if (!open) return
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActive((i) => Math.min(i + 1, results.length - 1))
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActive((i) => Math.max(i - 1, 0))
          } else if (e.key === 'Enter' && active >= 0) {
            e.preventDefault()
            pick(results[active])
          } else if (e.key === 'Escape') {
            setOpen(false)
          }
        }}
      />
      {open && results.length > 0 && (
        <ul role="listbox">
          {results.map((a, i) => (
            <li
              key={a.iata + a.city}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault()
                pick(a)
              }}
            >
              <span className="ac-code">{a.iata}</span>
              {a.city}
              <span className="ac-meta">
                {' '}
                — {a.name}, {a.country}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ------------------------------ Stepper UI ------------------------------ */
function Stepper({
  value,
  min,
  max,
  onChange,
  label,
}: {
  value: number
  min: number
  max: number
  onChange: (v: number) => void
  label: string
}) {
  return (
    <div className="enqw-stepper" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Decrease ${label}`}>
        −
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`Increase ${label}`}>
        +
      </button>
    </div>
  )
}

/* ------------------------------ Main wizard ----------------------------- */
export default function EnquiryWizard() {
  const [form, setForm] = useState<Form>(DEFAULTS)
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState<{ summary: string; whatsappUrl: string } | null>(null)
  const [hp, setHp] = useState('') // honeypot

  // Restore draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setForm({ ...DEFAULTS, ...JSON.parse(raw) })
    } catch {}
  }, [])
  // Persist draft
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    } catch {}
  }, [form])

  const set = useCallback(<K extends keyof Form>(key: K, val: Form[K]) => {
    setForm((f) => ({ ...f, [key]: val }))
  }, [])

  const wantsFlights = form.tripType === 'flights' || form.tripType === 'both'
  const wantsHotels = form.tripType === 'hotels' || form.tripType === 'both'

  // Keep child ages array sized to the children count
  const setChildren = (n: number) => {
    setForm((f) => {
      const ages = f.childrenAges.slice(0, n)
      while (ages.length < n) ages.push(6)
      return { ...f, childrenAges: ages }
    })
  }

  const stepValid = useMemo(() => {
    switch (step) {
      case 0:
        return form.adults >= 1 && form.childrenAges.every((a) => a >= 2 && a <= 11) && form.infants <= form.adults
      case 1:
        return !!form.country && !!form.city.trim()
      case 2: {
        let ok = true
        if (wantsFlights && form.flightTrip !== 'multi') {
          ok =
            ok &&
            !!form.departAirport &&
            !!form.arriveAirport &&
            !!form.departDate &&
            (form.flightTrip !== 'round' || (!!form.returnDate && form.returnDate >= (form.departDate || '')))
        }
        if (wantsHotels) {
          ok = ok && !!form.checkIn && !!form.checkOut && form.checkOut >= form.checkIn && !!form.starTier
        }
        return ok
      }
      case 3:
        return true
      case 4: {
        const hasEmail = !!form.email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)
        const hasMobile = !!form.mobile && form.mobile.replace(/\D/g, '').length >= 7
        return !!form.name.trim() && (hasEmail || hasMobile) && !!form.contactConsent
      }
      default:
        return true
    }
  }, [step, form, wantsFlights, wantsHotels])

  const next = () => {
    if (!stepValid) {
      setError('Please complete the required fields to continue.')
      return
    }
    setError('')
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }
  const back = () => {
    setError('')
    setStep((s) => Math.max(s - 1, 0))
  }

  const submit = async () => {
    if (!stepValid) {
      setError('Please complete the required fields.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, website: hp }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data.message || 'Something went wrong. Please try again or WhatsApp us.')
        setSubmitting(false)
        return
      }
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {}
      setDone({ summary: buildSummary(form), whatsappUrl: data.whatsappUrl })
    } catch {
      setError('Network error. Please try again or message us on WhatsApp.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="enqw enqw-success">
        <h2>Thanks, {form.name.split(' ')[0] || 'traveller'} 🎉</h2>
        <p>
          Our UAE travel desk is hand-pricing your trip and will send your quote shortly —
          no callback needed unless you ask for one.
        </p>
        <a className="enqw-btn primary" href={done.whatsappUrl} target="_blank" rel="noopener noreferrer">
          Send it on WhatsApp now
        </a>
        <pre style={{ marginTop: 20 }}>{done.summary}</pre>
      </div>
    )
  }

  return (
    <div className="enqw">
      {/* Trip type */}
      <div className="enqw-field" style={{ marginBottom: 20 }}>
        <label>What can we arrange for you?</label>
        <div className="enqw-seg" role="group" aria-label="Trip type">
          {(
            [
              ['flights', 'Flights'],
              ['hotels', 'Hotel'],
              ['both', 'Flights + Hotel'],
            ] as [TripType, string][]
          ).map(([val, lbl]) => (
            <button key={val} type="button" aria-pressed={form.tripType === val} onClick={() => set('tripType', val)}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      <ol className="enqw-progress">
        {STEPS.map((s, i) => (
          <li key={s} data-state={i === step ? 'active' : i < step ? 'done' : ''}>
            {s}
          </li>
        ))}
      </ol>

      {/* Honeypot */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
        aria-hidden="true"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="enqw-step"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.22 }}
        >
          {step === 0 && (
            <>
              <h2>Who’s travelling?</h2>
              <p className="enqw-sub">Please use ages as of your travel date — airlines and hotels price by age.</p>
              <div className="enqw-grid">
                <div className="enqw-field">
                  <label>Adults (12+) <span className="req">*</span></label>
                  <Stepper value={form.adults} min={1} max={20} onChange={(v) => set('adults', v)} label="Adults" />
                </div>
                <div className="enqw-field">
                  <label>Children (2–11)</label>
                  <Stepper value={form.childrenAges.length} min={0} max={10} onChange={setChildren} label="Children" />
                </div>
                <div className="enqw-field">
                  <label>Infants (under 2, on lap)</label>
                  <Stepper value={form.infants} min={0} max={form.adults} onChange={(v) => set('infants', v)} label="Infants" />
                </div>
              </div>
              {form.childrenAges.length > 0 && (
                <div className="enqw-children">
                  {form.childrenAges.map((age, i) => (
                    <div className="enqw-field" key={i}>
                      <label>Child {i + 1} age <span className="req">*</span></label>
                      <select
                        value={age}
                        onChange={(e) => {
                          const ages = form.childrenAges.slice()
                          ages[i] = Number(e.target.value)
                          set('childrenAges', ages)
                        }}
                      >
                        {Array.from({ length: 10 }, (_, k) => k + 2).map((a) => (
                          <option key={a} value={a}>
                            {a} years
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
              {form.infants > form.adults && (
                <p className="enqw-error">Each infant needs an accompanying adult.</p>
              )}
            </>
          )}

          {step === 1 && (
            <>
              <h2>Where to?</h2>
              <p className="enqw-sub">Tell us your destination so we can match the right options.</p>
              <div className="enqw-grid">
                <div className="enqw-field">
                  <label>Destination country <span className="req">*</span></label>
                  <select value={form.country} onChange={(e) => set('country', e.target.value)} aria-invalid={!form.country || undefined}>
                    <option value="">Select a country…</option>
                    {COUNTRIES.map(([code, name]) => (
                      <option key={code} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="enqw-field">
                  <label>City <span className="req">*</span></label>
                  <input type="text" value={form.city} placeholder="e.g. Dubai" onChange={(e) => set('city', e.target.value)} aria-invalid={!form.city.trim() || undefined} />
                </div>
                <div className="enqw-field full">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="checkbox" style={{ width: 'auto', minHeight: 0 }} checked={!!form.flexibleDestination} onChange={(e) => set('flexibleDestination', e.target.checked)} />
                    My plans are flexible / multiple cities
                  </label>
                </div>
                {form.flexibleDestination && (
                  <div className="enqw-field full">
                    <label>Tell us your route or cities</label>
                    <textarea value={form.routeNotes || ''} onChange={(e) => set('routeNotes', e.target.value)} placeholder="e.g. Dubai then Abu Dhabi, or open to suggestions" />
                  </div>
                )}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2>Trip details</h2>
              <p className="enqw-sub">A few specifics so your quote is accurate.</p>

              {wantsFlights && (
                <fieldset style={{ border: 0, padding: 0, margin: '0 0 22px' }}>
                  <legend style={{ fontWeight: 800, marginBottom: 12 }}>Flights</legend>
                  <div className="enqw-field" style={{ marginBottom: 12 }}>
                    <label>Trip type</label>
                    <div className="enqw-seg">
                      {(
                        [
                          ['round', 'Round trip'],
                          ['oneway', 'One way'],
                          ['multi', 'Multi-city'],
                        ] as [FlightTrip, string][]
                      ).map(([v, l]) => (
                        <button key={v} type="button" aria-pressed={form.flightTrip === v} onClick={() => set('flightTrip', v)}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {form.flightTrip === 'multi' ? (
                    <p className="enqw-sub">
                      Multi-city — add your route in the “flexible / cities” notes on the previous step, or message us on
                      WhatsApp after submitting and we’ll map each leg.
                    </p>
                  ) : (
                    <div className="enqw-grid">
                      <AirportField label="Flying from" value={form.departAirport || ''} onChange={(v) => set('departAirport', v)} invalid={!form.departAirport} />
                      <AirportField label="Flying to" value={form.arriveAirport || ''} onChange={(v) => set('arriveAirport', v)} invalid={!form.arriveAirport} />
                      <div className="enqw-field">
                        <label>Departure date <span className="req">*</span></label>
                        <input type="date" min={todayISO()} value={form.departDate || ''} onChange={(e) => set('departDate', e.target.value)} />
                      </div>
                      {form.flightTrip === 'round' && (
                        <div className="enqw-field">
                          <label>Return date <span className="req">*</span></label>
                          <input type="date" min={form.departDate || todayISO()} value={form.returnDate || ''} onChange={(e) => set('returnDate', e.target.value)} />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="enqw-grid" style={{ marginTop: 14 }}>
                    <div className="enqw-field">
                      <label>Cabin class</label>
                      <select value={form.cabin} onChange={(e) => set('cabin', e.target.value as Cabin)}>
                        <option value="economy">Economy</option>
                        <option value="premium">Premium Economy</option>
                        <option value="business">Business</option>
                        <option value="first">First</option>
                      </select>
                    </div>
                    <div className="enqw-field">
                      <label>Baggage</label>
                      <select value={form.baggage} onChange={(e) => set('baggage', e.target.value)}>
                        <option>Hand baggage only</option>
                        <option>Checked bag(s)</option>
                      </select>
                    </div>
                    <div className="enqw-field full">
                      <label style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                          <input type="checkbox" style={{ width: 'auto', minHeight: 0 }} checked={!!form.directOnly} onChange={(e) => set('directOnly', e.target.checked)} /> Direct flights only
                        </span>
                        <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                          <input type="checkbox" style={{ width: 'auto', minHeight: 0 }} checked={!!form.flexibleDates} onChange={(e) => set('flexibleDates', e.target.checked)} /> My dates are flexible (± a few days)
                        </span>
                      </label>
                    </div>
                  </div>
                </fieldset>
              )}

              {wantsHotels && (
                <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                  <legend style={{ fontWeight: 800, marginBottom: 12 }}>Hotel</legend>
                  <div className="enqw-grid">
                    <div className="enqw-field">
                      <label>Check-in <span className="req">*</span></label>
                      <input type="date" min={todayISO()} value={form.checkIn || ''} onChange={(e) => set('checkIn', e.target.value)} />
                    </div>
                    <div className="enqw-field">
                      <label>Check-out <span className="req">*</span></label>
                      <input type="date" min={form.checkIn || todayISO()} value={form.checkOut || ''} onChange={(e) => set('checkOut', e.target.value)} />
                    </div>
                  </div>
                  <div className="enqw-field" style={{ marginTop: 14 }}>
                    <label>Hotel standard <span className="req">*</span></label>
                    <div className="enqw-chips">
                      {(
                        [
                          ['cheapest', 'Cheapest available'],
                          ['3', '3★'],
                          ['4', '4★'],
                          ['5', '5★'],
                          ['luxury', 'Luxury (5★+)'],
                        ] as [StarTier, string][]
                      ).map(([v, l]) => (
                        <button key={v} type="button" aria-pressed={form.starTier === v} onClick={() => set('starTier', v)}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="enqw-grid" style={{ marginTop: 14 }}>
                    <div className="enqw-field">
                      <label>Rooms</label>
                      <Stepper value={form.rooms || 1} min={1} max={10} onChange={(v) => set('rooms', v)} label="Rooms" />
                    </div>
                    <div className="enqw-field">
                      <label>Meal plan</label>
                      <select value={form.board} onChange={(e) => set('board', e.target.value as Board)}>
                        <option value="room">Room only</option>
                        <option value="breakfast">Breakfast</option>
                        <option value="half">Half board</option>
                        <option value="full">Full board</option>
                        <option value="allinclusive">All-inclusive</option>
                      </select>
                    </div>
                    <div className="enqw-field">
                      <label>Bed preference</label>
                      <select value={form.bed} onChange={(e) => set('bed', e.target.value)}>
                        <option>No preference</option>
                        <option>Twin</option>
                        <option>Double</option>
                      </select>
                    </div>
                    <div className="enqw-field">
                      <label>Room configuration</label>
                      <input type="text" value={form.roomConfig || ''} placeholder="e.g. 2 adults + 1 child" onChange={(e) => set('roomConfig', e.target.value)} />
                    </div>
                    <div className="enqw-field full">
                      <label>Area or hotel preference</label>
                      <input type="text" value={form.areaPreference || ''} placeholder="e.g. near the beach, Downtown, or a specific hotel" onChange={(e) => set('areaPreference', e.target.value)} />
                    </div>
                  </div>
                </fieldset>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <h2>Anything else that helps us tailor your quote?</h2>
              <p className="enqw-sub">All optional — skip anything that doesn’t apply.</p>
              <div className="enqw-grid">
                <div className="enqw-field">
                  <label>Trip purpose</label>
                  <select value={form.purpose || ''} onChange={(e) => set('purpose', e.target.value)}>
                    <option value="">—</option>
                    <option>Leisure</option>
                    <option>Family</option>
                    <option>Honeymoon</option>
                    <option>Business</option>
                    <option>Group / Event</option>
                  </select>
                </div>
                <div className="enqw-field">
                  <label>Approx. total budget (AED)</label>
                  <input type="text" inputMode="numeric" value={form.budget || ''} placeholder="Optional — helps us match options" onChange={(e) => set('budget', e.target.value)} />
                  <span className="hint">Helps us match the right options — not a commitment.</span>
                </div>
                <div className="enqw-field full">
                  <label>Add to my trip</label>
                  <div className="enqw-checks">
                    {ADDONS.map((a) => {
                      const checked = form.addOns?.includes(a)
                      return (
                        <label key={a}>
                          <input
                            type="checkbox"
                            checked={!!checked}
                            onChange={(e) => {
                              const cur = new Set(form.addOns || [])
                              if (e.target.checked) cur.add(a)
                              else cur.delete(a)
                              set('addOns', Array.from(cur))
                            }}
                          />
                          {a}
                        </label>
                      )
                    })}
                  </div>
                </div>
                <div className="enqw-field full">
                  <label>Special requirements</label>
                  <textarea value={form.specialRequirements || ''} placeholder="Accessibility, dietary needs, adjoining rooms, late check-in…" onChange={(e) => set('specialRequirements', e.target.value)} />
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2>Your details</h2>
              <p className="enqw-sub">We’ll send your hand-priced quote here.</p>
              <div className="enqw-grid">
                <div className="enqw-field full">
                  <label>Full name <span className="req">*</span></label>
                  <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} aria-invalid={!form.name.trim() || undefined} autoComplete="name" />
                </div>
                <div className="enqw-field">
                  <label>Mobile (with country code)</label>
                  <input type="tel" value={form.mobile} placeholder="+971 5x xxx xxxx" onChange={(e) => set('mobile', e.target.value)} autoComplete="tel" />
                </div>
                <div className="enqw-field">
                  <label>Email</label>
                  <input type="email" value={form.email} placeholder="you@example.com" onChange={(e) => set('email', e.target.value)} autoComplete="email" />
                </div>
                <div className="enqw-field full">
                  <span className="hint">Please give at least one of mobile or email.</span>
                </div>
                <div className="enqw-field">
                  <label>Best way to reach you</label>
                  <select value={form.contactMethod} onChange={(e) => set('contactMethod', e.target.value as Form['contactMethod'])}>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="call">Call</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                <div className="enqw-field">
                  <label>When are you looking to travel?</label>
                  <input type="month" value={form.travelMonth || ''} disabled={!!form.flexibleTiming} onChange={(e) => set('travelMonth', e.target.value)} />
                  <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 500, marginTop: 4 }}>
                    <input type="checkbox" style={{ width: 'auto', minHeight: 0 }} checked={!!form.flexibleTiming} onChange={(e) => set('flexibleTiming', e.target.checked)} />
                    I’m flexible / not sure yet
                  </label>
                </div>
                <div className="enqw-field full">
                  <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontWeight: 500 }}>
                    <input type="checkbox" style={{ width: 'auto', minHeight: 0, marginTop: 3 }} checked={!!form.contactConsent} onChange={(e) => set('contactConsent', e.target.checked)} />
                    <span>
                      I agree to be contacted about this enquiry. <span className="req">*</span>{' '}
                      <a href="/privacy-policy" target="_blank" rel="noopener" style={{ color: '#b9b1ff' }}>
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                  <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontWeight: 500, marginTop: 8 }}>
                    <input type="checkbox" style={{ width: 'auto', minHeight: 0 }} checked={!!form.marketingConsent} onChange={(e) => set('marketingConsent', e.target.checked)} />
                    Keep me posted on deals &amp; offers
                  </label>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {error && (
        <p className="enqw-error" role="alert">
          {error}
        </p>
      )}

      <div className="enqw-nav">
        {step > 0 ? (
          <button type="button" className="enqw-btn ghost" onClick={back}>
            Back
          </button>
        ) : (
          <span />
        )}
        <span className="spacer" />
        {step < STEPS.length - 1 ? (
          <button type="button" className="enqw-btn primary" onClick={next} disabled={!stepValid}>
            Continue
          </button>
        ) : (
          <button type="button" className="enqw-btn primary" onClick={submit} disabled={!stepValid || submitting}>
            {submitting ? 'Sending…' : 'Get my hand-priced quote'}
          </button>
        )}
      </div>
    </div>
  )
}

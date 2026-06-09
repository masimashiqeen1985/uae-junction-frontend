// Server-only IATA airport search.
// The full dataset (~7,000 IATA airports) lives in airports.data.json and is
// imported ONLY here, inside server code. It is never sent to the browser bundle.
// The /api/airports route returns at most a handful of matches per query.
import data from './airports.data.json'

export type Airport = {
  iata: string
  name: string
  city: string
  country: string
}

// Stored compactly as [iata, name, city, country] tuples to keep the file small.
type Row = [string, string, string, string]
const ROWS = data as unknown as Row[]

// Major hubs surfaced first so the most likely choices rank at the top.
const PRIORITY = new Set<string>([
  'DXB', 'AUH', 'SHJ', 'DWC', 'DOH', 'RUH', 'JED', 'DMM', 'KWI', 'BAH', 'MCT',
  'LHR', 'LGW', 'CDG', 'FRA', 'AMS', 'IST', 'JFK', 'EWR', 'LAX', 'ORD',
  'BOM', 'DEL', 'BLR', 'MAA', 'COK', 'HYD', 'CCU', 'KHI', 'LHE', 'ISB',
  'SIN', 'BKK', 'HKG', 'KUL', 'CGK', 'NRT', 'HND', 'ICN', 'PEK', 'PVG',
  'SYD', 'MEL', 'CAI', 'JNB', 'CMB', 'MLE', 'TBS', 'GYD', 'BCN', 'MAD',
  'FCO', 'MUC', 'ZRH', 'VIE', 'TLV', 'YYZ', 'YVR', 'SFO', 'MIA', 'BOS',
])

function score(r: Row, q: string): number {
  const [iata, name, city] = r
  const code = iata.toLowerCase()
  const c = city.toLowerCase()
  const n = name.toLowerCase()
  let s = -1
  if (code === q) s = 100
  else if (code.startsWith(q)) s = 90
  else if (c === q) s = 80
  else if (c.startsWith(q)) s = 70
  else if (n.startsWith(q)) s = 55
  else if (c.includes(q)) s = 40
  else if (n.includes(q)) s = 30
  if (s >= 0 && PRIORITY.has(iata)) s += 8
  return s
}

export function searchAirports(query: string, limit = 8): Airport[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  const scored: Array<{ r: Row; s: number }> = []
  // ~7k rows: a full linear scan is sub-millisecond and runs server-side only.
  for (const r of ROWS) {
    const s = score(r, q)
    if (s >= 0) scored.push({ r, s })
  }
  scored.sort((a, b) => b.s - a.s || a.r[2].localeCompare(b.r[2]))
  return scored.slice(0, limit).map(({ r }) => ({
    iata: r[0],
    name: r[1],
    city: r[2],
    country: r[3],
  }))
}

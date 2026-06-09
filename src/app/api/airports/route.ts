import { NextResponse } from 'next/server'
import { searchAirports } from '@/lib/airports'

// Airport autocomplete. Returns at most ~8 matches for the typed query.
// The full IATA dataset stays server-side; the client only ever receives
// the small result set below, so the page bundle is unaffected.
export const runtime = 'nodejs'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').slice(0, 40)
  if (q.trim().length < 2) {
    return NextResponse.json({ results: [] })
  }
  const results = searchAirports(q, 8)
  return NextResponse.json(
    { results },
    {
      headers: {
        // Cache identical queries at the edge; results are static reference data.
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    },
  )
}

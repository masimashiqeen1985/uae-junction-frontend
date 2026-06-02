import { NextResponse } from 'next/server'

// Quote request capture. Forwards to QUOTE_WEBHOOK (CRM/email/n8n) when set,
// otherwise returns a graceful message pointing to WhatsApp — NO fake success.
export async function POST(req: Request) {
  let data: Record<string, unknown> = {}
  try {
    data = await req.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request.' }, { status: 400 })
  }
  const email = typeof data.email === 'string' ? data.email.trim() : ''
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ ok: false, message: 'Please enter a valid email.' }, { status: 422 })
  }
  const hook = process.env.QUOTE_WEBHOOK
  if (!hook) {
    return NextResponse.json(
      { ok: false, message: 'Thanks! Our quote desk isn’t wired to email yet — please message us on WhatsApp at +971 58 589 8221 for an instant reply.' },
      { status: 501 },
    )
  }
  try {
    const r = await fetch(hook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, source: 'quote-form' }),
    })
    if (!r.ok) throw new Error(String(r.status))
    return NextResponse.json({ ok: true, message: 'Thank you! Our team will get back within 24 hours.' })
  } catch {
    return NextResponse.json({ ok: false, message: 'Something went wrong. Please WhatsApp us at +971 58 589 8221.' }, { status: 502 })
  }
}

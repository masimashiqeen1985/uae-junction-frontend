import { NextResponse } from 'next/server'

// Newsletter capture. Forwards to an env-configured webhook (e.g. Mailchimp/
// Brevo/n8n) when present, otherwise responds honestly that subscriptions are
// not yet wired — NO fake success. Set NEWSLETTER_WEBHOOK in env to enable.
export async function POST(req: Request) {
  let email = ''
  try {
    const body = await req.json()
    email = typeof body?.email === 'string' ? body.email.trim() : ''
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request.' }, { status: 400 })
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ ok: false, message: 'Please enter a valid email.' }, { status: 422 })
  }

  const hook = process.env.NEWSLETTER_WEBHOOK
  if (!hook) {
    return NextResponse.json(
      { ok: false, message: 'Subscriptions open soon — thanks for your interest!' },
      { status: 501 },
    )
  }
  try {
    const r = await fetch(hook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source: 'footer' }),
    })
    if (!r.ok) throw new Error(String(r.status))
    return NextResponse.json({ ok: true, message: "You're in! Watch your inbox for deals." })
  } catch {
    return NextResponse.json({ ok: false, message: 'Something went wrong. Please try again.' }, { status: 502 })
  }
}

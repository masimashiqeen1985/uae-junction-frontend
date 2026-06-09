import { NextResponse } from 'next/server'
import { buildSummary, validateEnquiry, type EnquiryPayload } from '@/lib/enquiry'

export const runtime = 'nodejs'

// Official UAE travel-desk WhatsApp number (digits only for wa.me).
const WHATSAPP = '971585898221'

// Optional integrations, all env-gated so the route is safe with zero config:
//   ENQUIRY_WEBHOOK      -> POST full JSON payload (n8n / Zapier / email relay / CRM)
//   WP_ENQUIRY_ENDPOINT  -> WordPress REST endpoint that creates an "Enquiry" CPT
//   WP_ENQUIRY_TOKEN     -> bearer/app-password token for the endpoint above
// Even with none set, the customer always receives a working WhatsApp summary link,
// so an enquiry is never silently lost.

async function forwardWebhook(payload: EnquiryPayload, summary: string) {
  const hook = process.env.ENQUIRY_WEBHOOK
  if (!hook) return { sent: false as const }
  try {
    const r = await fetch(hook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'enquiry-form', summary, payload }),
    })
    return { sent: r.ok }
  } catch {
    return { sent: false }
  }
}

async function storeInCms(payload: EnquiryPayload, summary: string) {
  const endpoint = process.env.WP_ENQUIRY_ENDPOINT
  const token = process.env.WP_ENQUIRY_TOKEN
  if (!endpoint || !token) return { stored: false as const }
  try {
    const title = `${payload.name} — ${payload.city || payload.country} (${payload.tripType})`
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, status: 'private', summary, fields: payload }),
    })
    return { stored: r.ok }
  } catch {
    return { stored: false }
  }
}

export async function POST(req: Request) {
  let data: Partial<EnquiryPayload> & { website?: string }
  try {
    data = await req.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request.' }, { status: 400 })
  }

  // Honeypot: real users never fill the hidden "website" field.
  if (data.website) {
    return NextResponse.json({ ok: true, message: 'Thank you.' })
  }

  const error = validateEnquiry(data)
  if (error) {
    return NextResponse.json({ ok: false, message: error }, { status: 422 })
  }

  const payload = data as EnquiryPayload
  const summary = buildSummary(payload)
  const whatsappUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(summary)}`

  // Fire integrations in parallel; failures degrade gracefully.
  const [webhook, cms] = await Promise.all([
    forwardWebhook(payload, summary),
    storeInCms(payload, summary),
  ])

  return NextResponse.json({
    ok: true,
    message: 'Thanks! Our UAE travel desk is hand-pricing your trip and will send your quote shortly.',
    whatsappUrl,
    delivered: { webhook: webhook.sent, cms: cms.stored },
  })
}

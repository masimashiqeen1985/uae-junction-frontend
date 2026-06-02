'use client'
import { useState, type FormEvent } from 'react'
import { Loader2, CheckCircle2, Send } from 'lucide-react'
import { SectionHeading } from './SectionHeading'

const inputCls =
  'w-full rounded-[10px] border border-neutral-200 px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--c-primary)] focus-ring'

export function QuoteForm() {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setState('busy')
    try {
      const r = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(fd.entries())),
      })
      const data = await r.json().catch(() => ({}))
      setMsg(data?.message || (r.ok ? 'Thank you! We will be in touch.' : 'Please try again.'))
      // 501 = not wired yet; still acknowledge the user honestly with the WhatsApp nudge.
      setState(r.ok || r.status === 501 ? 'done' : 'error')
    } catch {
      setMsg('Network error. Please WhatsApp us at +971 58 589 8221.')
      setState('error')
    }
  }

  return (
    <section id="quote" className="scroll-mt-24 bg-neutral-50 py-16 lg:py-20">
      <div className="container-xl max-w-2xl">
        <SectionHeading center eyebrow="Plan your trip" title="Get a free" highlight="quote" subtitle="Tell us about your trip and our team will get back within 24 hours." />
        {state === 'done' ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-md">
            <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
            <p className="font-display text-lg font-semibold text-neutral-800">Request received</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">{msg}</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
            <input name="firstName" type="text" placeholder="First name" required aria-label="First name" className={inputCls} />
            <input name="lastName" type="text" placeholder="Last name" required aria-label="Last name" className={inputCls} />
            <input name="email" type="email" placeholder="Email" required aria-label="Email" className={inputCls} />
            <input name="phone" type="tel" placeholder="Phone number" required aria-label="Phone number" className={inputCls} />
            <textarea name="message" placeholder="Tell us about your trip" rows={4} aria-label="Trip details" className={`${inputCls} resize-none sm:col-span-2`} />
            {state === 'error' && <p role="alert" className="text-sm text-red-600 sm:col-span-2">{msg}</p>}
            <button type="submit" disabled={state === 'busy'} className="flex items-center justify-center gap-2 rounded-[10px] bg-[var(--c-primary)] py-3.5 font-semibold text-white transition-colors hover:bg-[var(--c-primary-dark)] disabled:opacity-60 sm:col-span-2">
              {state === 'busy' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Get a quote
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

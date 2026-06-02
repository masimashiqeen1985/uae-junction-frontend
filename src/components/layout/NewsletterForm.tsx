'use client'
import { useState, type FormEvent } from 'react'
import { Send, Loader2, CheckCircle2 } from 'lucide-react'

export function NewsletterForm() {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const email = String(new FormData(e.currentTarget).get('email') || '')
    setState('busy')
    try {
      const r = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await r.json().catch(() => ({}))
      setMsg(data?.message || (r.ok ? 'Subscribed!' : 'Please try again.'))
      setState(r.ok ? 'done' : 'error')
    } catch {
      setMsg('Network error. Please try again.')
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <p className="flex items-center gap-2 text-sm text-emerald-400">
        <CheckCircle2 className="h-4 w-4" /> {msg}
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2" noValidate>
      <div className="flex overflow-hidden rounded-[10px] border border-white/15 bg-white/5 focus-within:border-[var(--c-primary)]">
        <input
          name="email"
          type="email"
          required
          aria-label="Email address"
          placeholder="Your email for travel deals"
          className="focus-ring min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-neutral-400 outline-none"
        />
        <button
          type="submit"
          disabled={state === 'busy'}
          aria-label="Subscribe"
          className="flex items-center gap-1.5 bg-[var(--c-primary)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--c-primary-dark)] disabled:opacity-60"
        >
          {state === 'busy' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
      {state === 'error' && <p className="text-xs text-amber-400">{msg}</p>}
    </form>
  )
}

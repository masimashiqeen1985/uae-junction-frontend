// src/app/careers/CareersInteractive.tsx
'use client'

import { useState } from 'react'

const ROLES = [
  'Graphic Designer',
  'Social Media Sales & Marketing',
  'SEO Specialist',
  'Junior Web & App Developer',
  'Speculative / Other',
]

export default function CareersInteractive() {
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    if (fd.get('company')) return // honeypot

    const resume = fd.get('resume') as File | null
    if (resume && resume.size > 5 * 1024 * 1024) {
      setMsg({ text: 'Resume exceeds 5 MB. Please upload a smaller file.', ok: false })
      return
    }
    if (!form.checkValidity()) {
      setMsg({ text: 'Please complete all required fields.', ok: false })
      form.reportValidity()
      return
    }
    try {
      const res = await fetch('/api/careers/apply', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('bad status')
      setMsg({ text: "Thank you! Your application has been received. Our team will be in touch if there's a fit.", ok: true })
      form.reset()
    } catch {
      setMsg({ text: "Couldn't submit right now. Please email your CV to careers@theuaejunction.com.", ok: false })
    }
  }

  const inputCls =
    'w-full rounded-btn border-[1.5px] border-[#e8edf2] px-4 py-3.5 focus:border-primary focus:outline-none'

  return (
    <section id="apply" className="relative scroll-mt-24 overflow-hidden bg-ink py-20 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background:radial-gradient(40%_60%_at_100%_0,rgba(91,108,255,.4),transparent_55%),radial-gradient(34%_50%_at_0_100%,rgba(11,184,166,.35),transparent_55%)]" />
      <div className="container-xl relative z-10">
        <div className="mx-auto mb-12 max-w-[720px] text-center">
          <span className="eyebrow text-primary-light">Join Us</span>
          <h2 className="font-display mt-3 text-[clamp(1.9rem,4.2vw,2.8rem)] font-extrabold">Let&apos;s build extraordinary journeys together</h2>
          <p className="mt-4 text-lg text-white/80">Apply by email, or send your details through the form.</p>
        </div>

        <div className="grid items-start gap-8 md:grid-cols-[1fr_1.1fr]">
          <div className="rounded-card border border-white/15 bg-white/5 p-8">
            <h3 className="font-display mb-2.5 text-xl font-extrabold">Apply by email</h3>
            <p>
              Send your CV and a brief introduction to{' '}
              <a className="font-bold text-primary-light underline" href="mailto:careers@theuaejunction.com">careers@theuaejunction.com</a>.
            </p>
            <p className="mt-4 text-white/80">
              Don&apos;t see a role that fits? We welcome speculative applications across sales, customer
              experience, operations, content and technology — tell us where you&apos;d shine.
            </p>
            <div className="mt-4 space-y-3 text-white/85">
              <div>📞 +971 58 589 8221</div>
              <div>📍 Business Center, Sharjah Publishing City Free Zone, Sharjah, UAE</div>
              <div>💬 <a className="font-bold text-primary-light underline" href="https://wa.me/971585898221">Chat with us on WhatsApp</a></div>
            </div>
          </div>

          <form onSubmit={onSubmit} encType="multipart/form-data" noValidate aria-label="Job application form" className="rounded-card bg-white p-8 text-ink">
            <Field label="Select role" htmlFor="role">
              <select id="role" name="role" required defaultValue="" className={inputCls}>
                <option value="" disabled>Choose a role…</option>
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Full name" htmlFor="name">
              <input id="name" name="name" type="text" autoComplete="name" required className={inputCls} />
            </Field>
            <Field label="Email address" htmlFor="email">
              <input id="email" name="email" type="email" autoComplete="email" required className={inputCls} />
            </Field>
            <Field label="Mobile number" htmlFor="mobile">
              <input id="mobile" name="mobile" type="tel" inputMode="tel" autoComplete="tel" required className={inputCls} />
            </Field>
            <Field label="Upload your resume (PDF, DOC, DOCX · max 5 MB)" htmlFor="resume">
              <input id="resume" name="resume" type="file" required accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="w-full rounded-btn border-[1.5px] border-[#e8edf2] px-4 py-2.5" />
            </Field>

            {/* honeypot */}
            <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden>
              <label htmlFor="company">Company</label>
              <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <label className="mt-5 flex items-start gap-2.5 text-sm font-normal text-[#5a6b7b]">
              <input type="checkbox" name="consent" required className="mt-1" />
              <span>
                I agree to The UAE Junction processing my data for recruitment purposes in line with the{' '}
                <a className="text-secondary underline" href="https://www.theuaejunction.cloud/privacy-policy">Privacy Policy</a>.
              </span>
            </label>

            <button type="submit" className="uj-btn uj-btn-grad focus-ring mt-6 w-full">Submit application</button>
            {msg && (
              <p role="status" aria-live="polite" className={`mt-3.5 text-sm font-bold ${msg.ok ? 'text-primary-dark' : 'text-coral'}`}>{msg.text}</p>
            )}
          </form>
        </div>

        <div className="relative z-10 mx-auto mt-14 max-w-[700px] text-center">
          <h3 className="font-display text-2xl font-extrabold">You&apos;re not just building a career — you&apos;re shaping the future of travel<span className="text-amber">.</span></h3>
          <p className="mt-3 text-white/80">Become part of a team that values excellence, ambition, and creativity.</p>
        </div>
      </div>
    </section>
  )
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="mt-[18px] first:mt-0">
      <label htmlFor={htmlFor} className="mb-[7px] block text-sm font-bold">{label}</label>
      {children}
    </div>
  )
}

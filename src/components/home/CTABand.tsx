import Link from 'next/link'
import { Reveal } from '@/components/motion/Reveal'

export function CTABand() {
  return (
    <section className="relative overflow-hidden py-16">
      <div className="absolute inset-0 bg-sunset" />
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-12 right-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
      <Reveal className="container-xl relative text-center">
        <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">Get 2.5% cashback on every booking</h2>
        <p className="mx-auto mt-3 max-w-xl text-white/90">Register free and start earning rewards on every trip you take with us.</p>
        <Link href="/my-account" className="shine mt-7 inline-flex rounded-[10px] bg-white px-8 py-3.5 font-bold text-[var(--c-primary-dark)] shadow-xl transition-transform hover:-translate-y-0.5">
          Register Free
        </Link>
      </Reveal>
    </section>
  )
}

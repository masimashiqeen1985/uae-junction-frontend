import Link from 'next/link'
import { Reveal } from '@/components/motion/Reveal'

type Props = {
  eyebrow?: string
  title: string
  highlight?: string
  subtitle?: string
  linkLabel?: string
  linkHref?: string
  center?: boolean
}

export function SectionHeading({ eyebrow, title, highlight, subtitle, linkLabel, linkHref, center }: Props) {
  return (
    <Reveal className={`mb-10 flex flex-col gap-3 ${center ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between'}`}>
      <div className={center ? 'max-w-2xl' : ''}>
        {eyebrow && (
          <span className="mb-2 inline-block text-xs font-bold uppercase tracking-widest text-[var(--c-primary)]">{eyebrow}</span>
        )}
        <h2 className="font-display text-3xl font-bold text-[var(--c-secondary-dark)] sm:text-[2.1rem]">
          {title} {highlight && <span className="text-gradient-sunset">{highlight}</span>}
        </h2>
        {subtitle && <p className="mt-2 text-neutral-500">{subtitle}</p>}
      </div>
      {linkLabel && linkHref && (
        <Link href={linkHref} className="hidden whitespace-nowrap font-semibold text-[var(--c-primary)] transition-colors hover:text-[var(--c-primary-dark)] sm:inline">
          {linkLabel} →
        </Link>
      )}
    </Reveal>
  )
}

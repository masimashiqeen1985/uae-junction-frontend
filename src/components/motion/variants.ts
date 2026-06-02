// Reusable Framer Motion variants built on the shared token easing.
// Importing these keeps motion language identical across every section.
import type { Variants } from 'framer-motion'
import { easing, duration } from '@/lib/design/tokens'

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: duration.base, ease: easing.out } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: duration.base, ease: easing.out } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: duration.base, ease: easing.out } },
}

export const staggerParent = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
})

// Standard viewport config for scroll-reveal (reveal once, slightly early).
export const revealViewport = { once: true, amount: 0.25, margin: '0px 0px -80px 0px' } as const

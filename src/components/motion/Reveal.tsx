'use client'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'
import { fadeUp, revealViewport } from './variants'

type Props = {
  children: ReactNode
  variants?: Variants
  className?: string
  delay?: number
  as?: 'div' | 'section' | 'li' | 'article'
}

/**
 * Scroll-reveal wrapper. Reveals once on enter using the shared motion
 * language. Fully respects prefers-reduced-motion (renders static, no
 * transform) so it never causes layout jank for motion-sensitive users.
 */
export function Reveal({ children, variants = fadeUp, className, delay = 0, as = 'div' }: Props) {
  const reduce = useReducedMotion()
  const MotionTag = motion[as] as typeof motion.div
  if (reduce) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }
  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={revealViewport}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </MotionTag>
  )
}

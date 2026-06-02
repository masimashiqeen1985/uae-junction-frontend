// ───────────────────────────────────────────────────────────────────
// Shared design-token layer for the UAE Junction travel experience.
// One source of truth for colour, gradient, easing, spacing & timing so
// every section (header, hero, footer, homepage) stays visually consistent.
// Consumed by client components (Framer Motion, inline styles) and a few
// CSS custom properties mirrored in globals.css.
// ───────────────────────────────────────────────────────────────────

export const colors = {
  // Brand
  primary: '#FFA500',      // sunset amber
  primaryDark: '#E09000',
  primaryLight: '#FFB733',
  secondary: '#2D9D9D',    // lagoon teal
  secondaryDark: '#1E7070',
  secondaryLight: '#3BBABA',
  // Travel accents (wanderlust palette)
  coral: '#FF6B5E',
  sand: '#F6E7CE',
  dusk: '#3A2D6B',
  ink: '#0E1726',
  cloud: '#F8FAFC',
} as const

export const gradients = {
  sunset: 'linear-gradient(135deg,#FFB733 0%,#FF8A3D 45%,#FF6B5E 100%)',
  lagoon: 'linear-gradient(135deg,#3BBABA 0%,#2D9D9D 50%,#1E7070 100%)',
  dusk: 'linear-gradient(160deg,#0E1726 0%,#1E7070 60%,#2D9D9D 100%)',
  heroSky: 'linear-gradient(180deg,#0B1E3A 0%,#1E7070 55%,#2D9D9D 100%)',
  goldGlow: 'radial-gradient(circle at 30% 20%,rgba(255,165,0,.35),transparent 55%)',
} as const

// Brand easing curves (cubic-bezier) — used by Framer Motion & CSS.
export const easing = {
  out: [0.16, 1, 0.3, 1] as const,        // smooth deceleration (signature)
  inOut: [0.65, 0, 0.35, 1] as const,
  spring: { type: 'spring', stiffness: 120, damping: 18, mass: 0.9 } as const,
} as const

export const duration = {
  fast: 0.25,
  base: 0.5,
  slow: 0.8,
} as const

export const radius = { btn: '10px', card: '16px', pill: '9999px' } as const

export const z = { header: 50, dropdown: 60, overlay: 70, modal: 80 } as const

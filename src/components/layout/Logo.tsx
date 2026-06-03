type Props = { className?: string; iconOnly?: boolean }

/**
 * Brand logo — SVG recreation of "THE UAE JUNCTION" lockup.
 * The icon keeps fixed brand colours; the wordmark uses `currentColor` so it
 * reads white over the hero and dark when the header turns light on scroll.
 * Scalable + tiny (no image request). Swap freely for the official asset.
 */
export function Logo({ className = 'h-10', iconOnly = false }: Props) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} aria-label="The UAE Junction">
      <svg viewBox="0 0 64 72" className="h-full w-auto shrink-0" role="img" aria-hidden="true">
        <rect x="6" y="4" width="42" height="64" rx="21" fill="none" stroke="#0bb8a6" strokeWidth="5" />
        <circle cx="25" cy="23" r="6" fill="#E8852B" />
        <rect x="21.5" y="23" width="7" height="33" rx="3.5" fill="#E8852B" />
        <path d="M38 23 v19 a9 9 0 0 1 -9 9" fill="none" stroke="#0bb8a6" strokeWidth="5" strokeLinecap="round" />
      </svg>
      {!iconOnly && (
        <span className="font-serif leading-none" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
          <span className="block text-[0.62em] font-semibold tracking-[0.34em]">THE UAE</span>
          <span className="block text-[1.05em] font-semibold tracking-[0.16em]">JUNCTION</span>
        </span>
      )}
    </span>
  )
}

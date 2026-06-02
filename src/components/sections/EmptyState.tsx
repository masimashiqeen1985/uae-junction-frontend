import Link from'next/link'
// Graceful empty state — shown when a CMS-backed section has no data yet.
export function EmptyState({icon='✨',title,body}:{icon?:string;title:string;body:string}){
  return(
    <div className="text-center py-16 max-w-xl mx-auto">
      <p className="text-5xl mb-4" aria-hidden="true">{icon}</p>
      <h2 className="font-display font-semibold text-xl text-neutral-800 mb-2">{title}</h2>
      <p className="text-neutral-500 leading-relaxed">{body} Or <Link href="/contact-us" className="text-primary font-semibold hover:text-primary-dark">get in touch</Link> — we’re happy to help.</p>
    </div>
  )
}

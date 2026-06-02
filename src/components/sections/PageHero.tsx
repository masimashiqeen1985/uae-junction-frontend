import Link from'next/link'

export interface Crumb{label:string;href?:string}

// Reusable page header used across Phase-8 scaffolds. Mirrors the existing blog hero
// (secondary gradient + warm radial glow) so no new design language is introduced.
export function PageHero({title,subtitle,crumbs}:{title:string;subtitle?:string;crumbs?:Crumb[]}){
  return(
    <section className="relative overflow-hidden bg-gradient-to-br from-secondary-dark via-secondary to-neutral-900 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,165,0,0.22),transparent_45%)]"/>
      <div className="container-xl relative z-10 py-16 max-w-3xl">
        {crumbs&&crumbs.length>0&&(
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-white/70">
              {crumbs.map((c,i)=>(
                <li key={c.label} className="flex items-center gap-2">
                  {c.href&&i<crumbs.length-1
                    ?<Link href={c.href} className="hover:text-white transition-colors">{c.label}</Link>
                    :<span aria-current="page" className="text-white/90">{c.label}</span>}
                  {i<crumbs.length-1&&<span aria-hidden="true" className="text-white/40">/</span>}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl mb-4 leading-tight">{title}</h1>
        {subtitle&&<p className="text-neutral-100 text-lg leading-relaxed">{subtitle}</p>}
      </div>
    </section>
  )
}

// Build a schema.org BreadcrumbList from the same crumbs (absolute URLs).
export function breadcrumbJsonLd(crumbs:Crumb[],base='https://theuaejunction.cloud'){
  return{
    '@context':'https://schema.org',
    '@type':'BreadcrumbList',
    itemListElement:crumbs.map((c,i)=>({
      '@type':'ListItem',
      position:i+1,
      name:c.label,
      ...(c.href?{item:base+c.href}:{}),
    })),
  }
}

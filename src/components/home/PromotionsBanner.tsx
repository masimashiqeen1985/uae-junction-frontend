const PROMOS=[
  {title:'Theme Park Season Pass',desc:'Multi-park access across Dubai & Abu Dhabi',href:'/theme-parks',accent:'from-orange-500 to-primary'},
  {title:'Desert Safari Specials',desc:'Dune bashing, BBQ dinner & live shows',href:'/desert-safari',accent:'from-amber-600 to-orange-500'},
  {title:'Umrah Packages 2026',desc:'Curated spiritual journeys, all-inclusive',href:'/umrah-packages',accent:'from-secondary to-secondary-dark'},
]
export function PromotionsBanner(){
  return(
    <section className="py-12 bg-white">
      <div className="container-xl">
        <div className="flex gap-5 overflow-x-auto pb-3 snap-x [scrollbar-width:thin]">
          {PROMOS.map(p=>(
            <a key={p.title} href={p.href} className={`snap-start shrink-0 w-[85%] sm:w-[420px] rounded-card p-7 text-white bg-gradient-to-r ${p.accent} shadow-card hover:shadow-card-hover transition-shadow`}>
              <p className="text-xs font-bold uppercase tracking-widest text-white/80 mb-2">Featured Deal</p>
              <h3 className="font-display font-bold text-2xl mb-1.5">{p.title}</h3>
              <p className="text-white/90 text-sm mb-4">{p.desc}</p>
              <span className="inline-block bg-white/95 text-neutral-900 text-sm font-semibold px-5 py-2 rounded-btn">View Offer →</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

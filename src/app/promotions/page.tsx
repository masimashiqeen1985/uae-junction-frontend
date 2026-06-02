import type{Metadata}from'next'
import{fetchGraphQL}from'@/lib/graphql-client'
import{GET_HOMEPAGE}from'@/lib/queries/homepage'
import{ProductCard}from'@/components/ui/ProductCard'
import type{WPProduct}from'@/types/wordpress'

export const metadata:Metadata={
  title:'Promotions & Deals',
  description:'Current travel promotions from The UAE Junction — theme parks, desert safari, dhow cruise, Umrah and more, every booking with 4% cashback.',
}
export const revalidate=3600

const FEATURED=[
  {title:'Theme Park Season Pass',desc:'Unlimited multi-park access across Dubai & Abu Dhabi for a full season of thrills.',href:'/theme-parks',accent:'from-orange-500 to-primary',tag:'Best Value'},
  {title:'Desert Safari Specials',desc:'Dune bashing, BBQ dinner, live shows and a night under the stars.',href:'/desert-safari',accent:'from-amber-600 to-orange-500',tag:'Family Favourite'},
  {title:'Umrah Packages 2026',desc:'Curated, all-inclusive spiritual journeys handled end to end.',href:'/umrah-packages',accent:'from-secondary to-secondary-dark',tag:'Limited Slots'},
  {title:'Dhow Cruise Dinner',desc:'Sail Dubai Marina with a buffet dinner and live entertainment.',href:'/dhow-cruise',accent:'from-teal-600 to-secondary',tag:'Sunset Special'},
  {title:'Water Park Day Out',desc:'Beat the heat with full-day passes to the UAE’s top water parks.',href:'/water-parks',accent:'from-sky-500 to-secondary',tag:'Summer Deal'},
  {title:'City Tours & Sightseeing',desc:'See the icons of Dubai & Abu Dhabi with expert local guides.',href:'/uae-city-tours',accent:'from-orange-500 to-amber-600',tag:'Popular'},
]

async function getOnSale():Promise<WPProduct[]>{
  try{
    const d=await fetchGraphQL<{featuredProducts?:{nodes:WPProduct[]}}>(GET_HOMEPAGE,undefined,3600)
    return(d.featuredProducts?.nodes??[]).filter(p=>p.onSale)
  }catch{return[]}
}

export default async function PromotionsPage(){
  const onSale=await getOnSale()
  return(
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary-dark via-secondary to-neutral-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,165,0,0.22),transparent_45%)]"/>
        <div className="container-xl relative z-10 py-16 max-w-3xl">
          <span className="inline-block bg-primary/90 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">Limited-Time Offers</span>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl mb-4 leading-tight">Promotions &amp; Deals</h1>
          <p className="text-neutral-100 text-lg leading-relaxed">Hand-picked seasonal offers across the Emirates — and remember, every booking earns you 4% cashback.</p>
        </div>
      </section>

      <section className="py-16 bg-neutral-50">
        <div className="container-xl">
          <h2 className="font-display font-bold text-3xl text-secondary mb-8">Featured Offers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED.map(p=>(
              <a key={p.title} href={p.href} className={`block rounded-card p-7 text-white bg-gradient-to-br ${p.accent} shadow-card hover:shadow-card-hover transition-shadow`}>
                <p className="text-xs font-bold uppercase tracking-widest text-white/80 mb-2">{p.tag}</p>
                <h3 className="font-display font-bold text-2xl mb-2">{p.title}</h3>
                <p className="text-white/90 text-sm mb-5 leading-relaxed">{p.desc}</p>
                <span className="inline-block bg-white/95 text-neutral-900 text-sm font-semibold px-5 py-2 rounded-btn">View Offer →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {onSale.length>0&&(
        <section className="py-16 bg-white">
          <div className="container-xl">
            <h2 className="font-display font-bold text-3xl text-secondary mb-8">On Sale Now</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {onSale.slice(0,8).map(p=><ProductCard key={p.id} product={p}/>)}
            </div>
          </div>
        </section>
      )}

      <section className="py-14 bg-primary">
        <div className="container-xl text-center">
          <h2 className="font-display font-bold text-3xl text-white mb-3">Don’t see what you’re after?</h2>
          <p className="text-white/90 mb-7 max-w-xl mx-auto">Tell us your dates and budget — we’ll build a custom package with cashback included.</p>
          <a href="/contact-us" className="inline-block bg-white text-primary font-bold px-8 py-3.5 rounded-btn hover:bg-neutral-100 transition-colors">Request a Custom Quote</a>
        </div>
      </section>
    </div>
  )
}

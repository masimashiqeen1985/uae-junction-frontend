import{WPImage}from'@/components/ui/WPImage'
import type{WPCategory}from'@/types/wordpress'
const TILES=[
  {l:'Theme Parks',h:'/theme-parks',slug:'theme-parks',e:'🎢'},
  {l:'UAE City Tours',h:'/uae-city-tours',slug:'uae-city-tours',e:'🏙️'},
  {l:'Experiences',h:'/experiences',slug:'experiences',e:'✨'},
  {l:'Water Parks',h:'/water-parks',slug:'water-parks',e:'🌊'},
  {l:'Hotel Booking',h:'/hotel-booking',slug:'hotel-booking',e:'🏨'},
  {l:'Flight Booking',h:'/flight-booking',slug:'flight-booking',e:'✈️'},
  {l:'Umrah Packages',h:'/umrah-packages',slug:'umrah-packages',e:'🕌'},
  {l:'Desert Safari',h:'/desert-safari',slug:'desert-safari',e:'🐪'},
]
export function CategoryGrid({categories}:{categories:WPCategory[]}){
  const bySlug=new Map((categories||[]).map(c=>[c.slug,c]))
  return(
    <section className="py-16 bg-neutral-50">
      <div className="container-xl">
        <h2 className="font-display font-bold text-3xl text-center text-secondary mb-3">Discover Your Next Adventure</h2>
        <p className="text-neutral-500 text-center mb-12 max-w-2xl mx-auto">From thrilling theme parks to serene desert escapes — find the trip that fits you.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {TILES.map(t=>{
            const cat=bySlug.get(t.slug)
            const img=cat?.categoryFields?.categoryHeroImage
            return(
              <a key={t.h} href={t.h} className="group relative aspect-square rounded-card overflow-hidden flex flex-col items-center justify-center text-white p-4 bg-gradient-to-br from-secondary to-secondary-dark">
                {img?.sourceUrl&&<><WPImage image={img} fill className="object-cover group-hover:scale-110 transition-transform duration-500" sizes="(max-width:640px) 50vw,25vw"/><div className="absolute inset-0 bg-black/45 group-hover:bg-black/30 transition-colors"/></>}
                <span className="relative z-10 text-4xl mb-2">{t.e}</span>
                <span className="relative z-10 font-display font-semibold text-sm text-center">{t.l}</span>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

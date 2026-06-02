import type{Metadata}from'next'

export const metadata:Metadata={
  title:'About Us',
  description:'The UAE Junction is your trusted travel partner in the UAE — theme parks, desert safari, dhow cruise, hotels & flights, with 4% cashback on every booking.',
}
export const revalidate=3600

const STATS=[
  {n:'10K+',l:'Happy Travelers'},
  {n:'50+',l:'Curated Experiences'},
  {n:'4%',l:'Cashback Guaranteed'},
  {n:'24/7',l:'WhatsApp Support'},
]
const VALUES=[
  {i:'💎',t:'Affordable Luxury',d:'Premium tours and experiences that deliver real luxury without breaking the bank.'},
  {i:'🗺️',t:'Customized Itineraries',d:'Travel plans built around you — your pace, your budget, your kind of adventure.'},
  {i:'🤝',t:'Exclusive Local Deals',d:'Direct partnerships with UAE operators mean prices and access you won’t find elsewhere.'},
  {i:'🎁',t:'Rewards on Every Trip',d:'Every booking earns 4% cashback you can put toward your next journey.'},
]

export default function AboutPage(){
  return(
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary-dark via-secondary to-neutral-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,165,0,0.22),transparent_45%)]"/>
        <div className="container-xl relative z-10 py-20 max-w-3xl">
          <span className="inline-block bg-primary/90 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">Our Story</span>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl mb-5 leading-tight">Your Journey Is Our Passion</h1>
          <p className="text-neutral-100 text-lg leading-relaxed">The UAE Junction was born from a simple belief: exploring the Emirates should be effortless, rewarding, and unforgettable — for everyone, at every budget.</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-xl max-w-3xl">
          <h2 className="font-display font-bold text-3xl text-secondary mb-5">Who We Are</h2>
          <p className="text-neutral-600 text-lg leading-relaxed mb-5">We are a UAE-based travel company connecting visitors and residents to the very best of the Emirates — from heart-racing theme parks and desert safaris to serene dhow cruises, world-class hotels, and flights booked your way. We bring it all together in one junction.</p>
          <p className="text-neutral-600 text-lg leading-relaxed">What sets us apart is how we reward loyalty. Every single booking earns you 4% cashback — real value you can spend on your next adventure. No fine print, no catch, just a thank-you for travelling with us.</p>
        </div>
      </section>

      <section className="py-12 bg-secondary-dark text-white">
        <div className="container-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map(s=>(
              <div key={s.l}>
                <p className="font-display font-extrabold text-4xl text-primary mb-1">{s.n}</p>
                <p className="text-white/80 text-sm">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-neutral-50">
        <div className="container-xl">
          <h2 className="font-display font-bold text-3xl text-center text-secondary mb-12">What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {VALUES.map(v=>(
              <div key={v.t} className="flex gap-5 p-7 bg-white rounded-card shadow-card hover:shadow-card-hover transition-shadow">
                <div className="text-4xl shrink-0">{v.i}</div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-neutral-800 mb-2">{v.t}</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed">{v.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-primary">
        <div className="container-xl text-center">
          <h2 className="font-display font-bold text-3xl text-white mb-3">Ready to plan your next trip?</h2>
          <p className="text-white/90 mb-7 max-w-xl mx-auto">Tell us where you want to go and our team will craft an itinerary — with 4% cashback built in.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/contact-us" className="inline-block bg-white text-primary font-bold px-8 py-3.5 rounded-btn hover:bg-neutral-100 transition-colors">Get in Touch</a>
            <a href="/promotions" className="inline-block border-2 border-white text-white font-bold px-8 py-3.5 rounded-btn hover:bg-white hover:text-primary transition-colors">View Promotions</a>
          </div>
        </div>
      </section>
    </div>
  )
}

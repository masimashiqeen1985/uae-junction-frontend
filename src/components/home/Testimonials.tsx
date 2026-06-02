'use client'
import{useState}from'react'
const REVIEWS=[
  {name:'Aisha R.',loc:'Dubai, UAE',text:'Booked our Ferrari World tickets and a desert safari through The UAE Junction — seamless, and the cashback was a lovely surprise. Will use again!'},
  {name:'James M.',loc:'London, UK',text:'Planned our entire Dubai trip with them. Great prices on the dhow cruise and hotel, and support answered every question on WhatsApp within minutes.'},
  {name:'Priya S.',loc:'Mumbai, India',text:'The Umrah package was handled with so much care. Everything was organized end to end. Highly recommend for stress-free travel.'},
  {name:'Omar K.',loc:'Abu Dhabi, UAE',text:'Customized our family itinerary perfectly — water parks for the kids and city tours for us. Excellent value with the 4% cashback.'},
]
export function Testimonials(){
  const[i,setI]=useState(0)
  const r=REVIEWS[i]
  const go=(d:number)=>setI(p=>(p+d+REVIEWS.length)%REVIEWS.length)
  return(
    <section className="py-16 bg-secondary-dark text-white">
      <div className="container-xl max-w-3xl text-center">
        <h2 className="font-display font-bold text-3xl mb-10">What Our Travelers Say</h2>
        <blockquote className="text-lg sm:text-xl leading-relaxed text-white/95 mb-6 min-h-[120px]">&ldquo;{r.text}&rdquo;</blockquote>
        <p className="font-display font-semibold text-primary">{r.name}</p>
        <p className="text-white/70 text-sm mb-8">{r.loc}</p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={()=>go(-1)} aria-label="Previous review" className="w-10 h-10 rounded-full border border-white/40 hover:bg-white hover:text-secondary-dark transition-colors">‹</button>
          <div className="flex gap-2">{REVIEWS.map((_,n)=><button key={n} aria-label={`Review ${n+1}`} onClick={()=>setI(n)} className={`w-2.5 h-2.5 rounded-full transition-colors ${n===i?'bg-primary':'bg-white/40'}`}/>)}</div>
          <button onClick={()=>go(1)} aria-label="Next review" className="w-10 h-10 rounded-full border border-white/40 hover:bg-white hover:text-secondary-dark transition-colors">›</button>
        </div>
      </div>
    </section>
  )
}

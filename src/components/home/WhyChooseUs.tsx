const USPS=[
  {i:'💎',t:'Affordable Luxury',d:'Premium tours delivering luxury without breaking the bank.'},
  {i:'🗺️',t:'Customized Itineraries',d:'Personalized travel plans balancing quality and affordability.'},
  {i:'🤝',t:'Exclusive Local Deals',d:'Partnerships with local businesses for exclusive discounts.'},
]
export function WhyChooseUs(){
  return(
    <section className="py-16 bg-neutral-50">
      <div className="container-xl">
        <h2 className="font-display font-bold text-3xl text-center text-secondary mb-12">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {USPS.map(x=>(
            <div key={x.t} className="text-center p-8 bg-white rounded-card shadow-card hover:shadow-card-hover transition-shadow">
              <div className="text-5xl mb-4">{x.i}</div>
              <h3 className="font-display font-semibold text-lg text-neutral-800 mb-3">{x.t}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">{x.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

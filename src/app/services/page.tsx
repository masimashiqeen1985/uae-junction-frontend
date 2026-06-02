import type{Metadata}from'next'
import Link from'next/link'
import{PageHero,breadcrumbJsonLd}from'@/components/sections/PageHero'
import{JsonLd}from'@/components/ui/JsonLd'

export const metadata:Metadata={
  title:'Our Services',
  description:'Flights, hotels, theme park tickets, desert safari, dhow cruise, city tours, Umrah and holiday packages — all with 4% cashback from The UAE Junction.',
  alternates:{canonical:'https://theuaejunction.cloud/services'},
  openGraph:{title:'Our Services | The UAE Junction',description:'Everything we book for your UAE trip, with 4% cashback.',url:'https://theuaejunction.cloud/services',type:'website'},
}
export const revalidate=3600

// Index of existing, live service routes. Real content — not placeholder. Detailed
// per-service copy is owned by each destination page (and Phase 10 design polish).
const SERVICES:{title:string;href:string;icon:string;blurb:string}[]=[
  {title:'Flight Booking',href:'/flight-booking',icon:'✈️',blurb:'Competitive fares to and from the Emirates and beyond.'},
  {title:'Hotel Booking',href:'/hotel-booking',icon:'🏨',blurb:'Stays for every budget across the UAE and worldwide.'},
  {title:'Theme Parks',href:'/theme-parks',icon:'🎢',blurb:'Tickets to the region’s top theme parks.'},
  {title:'Water Parks',href:'/water-parks',icon:'🌊',blurb:'Make a splash at the UAE’s best water parks.'},
  {title:'Desert Safari',href:'/desert-safari',icon:'🐪',blurb:'Dune drives, camps and unforgettable sunsets.'},
  {title:'Dhow Cruise',href:'/dhow-cruise',icon:'🛥️',blurb:'Dinner cruises along the creek and marina.'},
  {title:'City Tours',href:'/uae-city-tours',icon:'🏙️',blurb:'Guided tours of Dubai, Abu Dhabi and beyond.'},
  {title:'Umrah Packages',href:'/umrah-packages',icon:'🕋',blurb:'Comfortable, well-organised Umrah journeys.'},
  {title:'Experiences',href:'/experiences',icon:'🎟️',blurb:'Curated activities and attractions across the UAE.'},
  {title:'Group & Corporate',href:'/group-corporate-bookings',icon:'👥',blurb:'Tailored travel for teams, events and groups.'},
]

export default function ServicesPage(){
  const crumbs=[{label:'Home',href:'/'},{label:'Services'}]
  const itemList={
    '@context':'https://schema.org',
    '@type':'ItemList',
    itemListElement:SERVICES.map((s,i)=>({'@type':'ListItem',position:i+1,name:s.title,url:'https://theuaejunction.cloud'+s.href})),
  }
  return(
    <div>
      <JsonLd data={[breadcrumbJsonLd(crumbs),itemList]}/>
      <PageHero title="Our Services" subtitle="Everything you need for your trip — book with us and earn 4% cashback on every service." crumbs={crumbs}/>
      <section className="py-16 bg-neutral-50">
        <div className="container-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {SERVICES.map(s=>(
              <Link key={s.href} href={s.href} className="group block bg-white rounded-card shadow-card hover:shadow-card-hover transition-all duration-300 p-7">
                <div className="text-4xl mb-4" aria-hidden="true">{s.icon}</div>
                <h2 className="font-display font-semibold text-lg text-neutral-800 mb-2 group-hover:text-primary transition-colors">{s.title}</h2>
                <p className="text-neutral-500 text-sm leading-relaxed">{s.blurb}</p>
                <span className="inline-block mt-4 text-primary font-semibold text-sm">Explore →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

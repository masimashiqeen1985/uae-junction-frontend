import type{Metadata}from'next'
import Link from'next/link'
import{StatsCounter,type Stat}from'@/components/about/StatsCounter'

export const metadata:Metadata={
  title:'About Us',
  description:'The UAE Junction is your trusted tourism company in Dubai - flights, hotels, theme parks, desert safari, dhow cruise, Umrah & visas, with 4% cashback on every booking.',
  alternates:{canonical:'/about-us'},
  openGraph:{title:'About Us | The UAE Junction',description:'Your trusted tourism company in Dubai - all your travel, under one roof, with 4% cashback.',url:'/about-us',type:'website'},
}
export const revalidate=3600

const STATS:Stat[]=[
  {value:10000,suffix:'+',label:'Happy Travelers'},
  {value:50,suffix:'+',label:'Curated Experiences'},
  {value:4,suffix:'%',label:'Cashback Guaranteed'},
  {value:0,static:'24/7',label:'WhatsApp Support'},
]

const SERVICES=[
  {i:'✈️',t:'Flight Bookings',d:'Competitive fares, flexible options, and global connections.'},
  {i:'🏨',t:'Hotel Deals',d:'Handpicked stays across the UAE and worldwide destinations.'},
  {i:'🛳️',t:'Cruise Holidays',d:'Luxury sea escapes designed for comfort and adventure.'},
  {i:'🎢',t:'Theme Parks & Activities',d:'Thrilling experiences for families, friends, and explorers.'},
  {i:'🕋',t:'Umrah Packages',d:'Complete support with visa, accommodation, and transport.'},
  {i:'🏜️',t:'Desert Safari & Dhow Cruise',d:'Authentic UAE adventures filled with culture and excitement.'},
  {i:'🛂',t:'Visa Assistance',d:'Smooth, reliable services for tourists, families, and corporates.'},
  {i:'🎁',t:'Reward Programs',d:'Earn 4% cashback on every booking and unlock exclusive offers.'},
]

const APART=[
  {t:'All-in-One Travel Solutions',d:'Flights, hotels, activities, and visa services brought together into a single, seamless experience - whether it is a weekend getaway or a multi-city adventure.'},
  {t:'Curated Deals',d:'We do not just list offers, we handpick them. Every deal is verified for value, quality, and reliability for solo travelers, families, and corporate groups alike.'},
  {t:'Expert Travel Consultants',d:'Our team knows the ins and outs of UAE tourism and global logistics, supporting you before, during, and after your trip.'},
  {t:'Rewarding Loyalty',d:'Earn points on every booking and redeem them for discounts, upgrades, or exclusive experiences. Our way of saying thank you.'},
]

const TRUST=[
  {i:'🧳',t:'Comprehensive Services',d:'Flights, hotels, excursions, and visas - everything under one roof.'},
  {i:'❤️',t:'Customer-First Focus',d:'We prioritise your satisfaction at every stage of your journey.'},
  {i:'🌟',t:'Passionate Team',d:'We love what we do, and it shows in every itinerary we create.'},
]

const TEAM=[
  {n:'Mrs. Alina Khurshid',r:'Co-Founder & Managing Director',init:'AK'},
  {n:'Mr. Sajid Hussain',r:'Product Manager',init:'SH'},
]

export default function AboutPage(){
  const ld={
    '@context':'https://schema.org','@type':'AboutPage',
    mainEntity:{
      '@type':'TravelAgency',name:'The UAE Junction',
      url:'https://www.theuaejunction.cloud',
      telephone:'+971585898221',email:'sales@theuaejunction.com',
      address:{'@type':'PostalAddress',streetAddress:'Business Center, Sharjah Publishing City Free Zone',addressLocality:'Sharjah',addressCountry:'AE'},
      sameAs:['https://www.facebook.com/share/1DBbzt4W8s/','https://www.instagram.com/theuaejunction_travel','https://youtube.com/@theuaejunction'],
    },
  }
  return(
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(ld)}}/>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary-dark via-secondary to-neutral-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,165,0,0.22),transparent_45%)]"/>
        <div className="container-xl relative z-10 py-20 max-w-3xl">
          <nav aria-label="Breadcrumb" className="text-sm text-white/60 mb-4">
            <Link href="/" className="hover:text-white">Home</Link> <span aria-hidden="true">/</span> <span className="text-white/90">About Us</span>
          </nav>
          <span className="inline-block bg-primary/90 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">Our Story</span>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl mb-5 leading-tight">Your Journey Is Our Passion</h1>
          <p className="text-neutral-100 text-lg leading-relaxed">Your trusted tourism company in Dubai - the gateway to unforgettable travel experiences across the UAE and beyond. From the moment you dream of a getaway to the moment you return home, we simplify every step.</p>
        </div>
      </section>

      {/* Who we are */}
      <section className="py-16 bg-white">
        <div className="container-xl max-w-3xl">
          <h2 className="font-display font-bold text-3xl text-secondary mb-5">Welcome to The UAE Junction</h2>
          <p className="text-neutral-600 text-lg leading-relaxed mb-5">Founded in October 2023, we are more than just a travel company - we are your dedicated partner in crafting journeys that are seamless, enriching, and tailored to your every need. Whether you are booking a flight, searching for the perfect hotel, planning a desert adventure, or organising a corporate retreat, we bring everything together under one roof with clarity, convenience, and care.</p>
          <p className="text-neutral-600 text-lg leading-relaxed">What sets us apart is how we reward loyalty. Every single booking earns you 4% cashback - real value you can spend on your next adventure. No fine print, no catch, just a thank-you for travelling with us.</p>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-16 bg-neutral-50">
        <div className="container-xl">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="text-secondary font-bold uppercase tracking-widest text-xs">What We Do</span>
            <h2 className="font-display font-bold text-3xl text-secondary mt-2">Every Aspect of Travel, Together</h2>
            <p className="text-neutral-500 mt-3">We bring every part of your journey into one place to make it effortless and unforgettable.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map(s=>(
              <div key={s.t} className="p-6 bg-white rounded-card shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                <div className="text-3xl mb-3">{s.i}</div>
                <h3 className="font-display font-semibold text-base text-neutral-800 mb-2">{s.t}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Animated stats */}
      <section className="py-14 bg-secondary-dark text-white">
        <div className="container-xl">
          <StatsCounter stats={STATS}/>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="container-xl grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="p-8 rounded-card bg-neutral-50 border-l-4 border-primary">
            <h3 className="font-display font-bold text-2xl text-secondary mb-3">Our Mission</h3>
            <p className="text-neutral-600 leading-relaxed">To open the world to everyone by providing seamless, affordable, and unforgettable travel experiences that create lasting memories.</p>
          </div>
          <div className="p-8 rounded-card bg-neutral-50 border-l-4 border-secondary">
            <h3 className="font-display font-bold text-2xl text-secondary mb-3">Our Vision</h3>
            <p className="text-neutral-600 leading-relaxed">To be the trusted go-to travel companion in the UAE and beyond - recognised for transparency, reliability, and a traveler-first approach, where every journey is effortless, enriching, and extraordinary.</p>
          </div>
        </div>
      </section>

      {/* What sets us apart */}
      <section className="py-16 bg-neutral-50">
        <div className="container-xl max-w-5xl">
          <h2 className="font-display font-bold text-3xl text-center text-secondary mb-12">What Sets Us Apart</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {APART.map((v,idx)=>(
              <div key={v.t} className="flex gap-5 p-7 bg-white rounded-card shadow-card hover:shadow-card-hover transition-shadow">
                <div className="font-display font-extrabold text-2xl text-primary shrink-0 w-10">{String(idx+1).padStart(2,'0')}</div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-neutral-800 mb-2">{v.t}</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed">{v.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-neutral-50">
        <div className="container-xl max-w-4xl">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="text-secondary font-bold uppercase tracking-widest text-xs">Our People</span>
            <h2 className="font-display font-bold text-3xl text-secondary mt-2">Meet the Team</h2>
            <p className="text-neutral-500 mt-3">The people who make every journey effortless.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {TEAM.map(m=>(
              <div key={m.n} className="text-center p-8 bg-white rounded-card shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                <div className="mx-auto mb-5 w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-secondary-dark text-white font-display font-extrabold text-2xl flex items-center justify-center" aria-hidden="true">{m.init}</div>
                <h3 className="font-display font-semibold text-lg text-neutral-800 mb-1">{m.n}</h3>
                <p className="text-secondary text-sm font-medium">{m.r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us / trust */}
      <section className="py-16 bg-white">
        <div className="container-xl">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <span className="text-secondary font-bold uppercase tracking-widest text-xs">Why Choose Us</span>
            <h2 className="font-display font-bold text-3xl text-secondary mt-2">Helping People Make Memories</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {TRUST.map(x=>(
              <div key={x.t} className="text-center p-8 bg-neutral-50 rounded-card hover:shadow-card transition-shadow">
                <div className="text-4xl mb-4">{x.i}</div>
                <h3 className="font-display font-semibold text-lg text-neutral-800 mb-3">{x.t}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{x.d}</p>
              </div>
            ))}
          </div>
          <div className="text-center border-t border-neutral-100 pt-10">
            <p className="text-neutral-400 text-xs uppercase tracking-widest font-semibold mb-2">Pay Safely With Us</p>
            <p className="text-neutral-500 text-sm">Secure checkout - Visa, Mastercard, Apple Pay &amp; Tabby. Powered by Arabian Junction FZC LLC.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-primary">
        <div className="container-xl text-center">
          <h2 className="font-display font-bold text-3xl text-white mb-3">Ready to plan your next trip?</h2>
          <p className="text-white/90 mb-7 max-w-xl mx-auto">Tell us where you want to go and our team will craft an itinerary - with 4% cashback built in.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact-us" className="inline-block bg-white text-primary font-bold px-8 py-3.5 rounded-btn hover:bg-neutral-100 transition-colors">Get in Touch</Link>
            <Link href="/promotions" className="inline-block border-2 border-white text-white font-bold px-8 py-3.5 rounded-btn hover:bg-white hover:text-primary transition-colors">View Promotions</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

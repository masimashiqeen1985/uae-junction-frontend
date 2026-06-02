'use client'
import{useState}from'react'
export function QuoteForm(){
  const[sent,setSent]=useState(false)
  return(
    <section id="quote" className="py-16 bg-neutral-50 scroll-mt-24">
      <div className="container-xl max-w-2xl">
        <h2 className="font-display font-bold text-3xl text-center text-secondary mb-2">Get A Free Quote</h2>
        <p className="text-neutral-500 text-center mb-10">Tell us about your trip and our team will get back within 24 hours.</p>
        {sent?(
          <div className="text-center bg-white rounded-card shadow-card p-10">
            <p className="text-2xl mb-2">✅</p>
            <p className="font-display font-semibold text-lg text-neutral-800">Thank you! Your request has been noted.</p>
            <p className="text-neutral-500 text-sm mt-2">For an instant response, message us on WhatsApp at +971 58 589 8221.</p>
          </div>
        ):(
          <form onSubmit={e=>{e.preventDefault();setSent(true)}} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="First Name" required className="border border-neutral-200 rounded-btn px-4 py-3 text-sm focus:outline-none focus:border-primary"/>
            <input type="text" placeholder="Last Name" required className="border border-neutral-200 rounded-btn px-4 py-3 text-sm focus:outline-none focus:border-primary"/>
            <input type="email" placeholder="Email" required className="border border-neutral-200 rounded-btn px-4 py-3 text-sm focus:outline-none focus:border-primary"/>
            <input type="tel" placeholder="Phone No." required className="border border-neutral-200 rounded-btn px-4 py-3 text-sm focus:outline-none focus:border-primary"/>
            <textarea placeholder="Tell us about your trip" rows={4} className="sm:col-span-2 border border-neutral-200 rounded-btn px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none"/>
            <button type="submit" className="sm:col-span-2 bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-btn transition-colors">Get A Quote</button>
          </form>
        )}
      </div>
    </section>
  )
}

'use client'
import{useState}from'react'
export function ContactForm(){
  const[sent,setSent]=useState(false)
  if(sent)return(
    <div className="text-center bg-neutral-50 rounded-card shadow-card p-10">
      <p className="text-2xl mb-2">✅</p>
      <p className="font-display font-semibold text-lg text-neutral-800">Thank you! Your message has been noted.</p>
      <p className="text-neutral-500 text-sm mt-2">For an instant response, message us on WhatsApp at +971 58 589 8221.</p>
    </div>
  )
  return(
    <form onSubmit={e=>{e.preventDefault();setSent(true)}} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <input type="text" placeholder="First Name" required className="border border-neutral-200 rounded-btn px-4 py-3 text-sm focus:outline-none focus:border-primary"/>
      <input type="text" placeholder="Last Name" required className="border border-neutral-200 rounded-btn px-4 py-3 text-sm focus:outline-none focus:border-primary"/>
      <input type="email" placeholder="Email" required className="border border-neutral-200 rounded-btn px-4 py-3 text-sm focus:outline-none focus:border-primary"/>
      <input type="tel" placeholder="Phone No." required className="border border-neutral-200 rounded-btn px-4 py-3 text-sm focus:outline-none focus:border-primary"/>
      <input type="text" placeholder="Subject" className="sm:col-span-2 border border-neutral-200 rounded-btn px-4 py-3 text-sm focus:outline-none focus:border-primary"/>
      <textarea placeholder="How can we help?" rows={5} required className="sm:col-span-2 border border-neutral-200 rounded-btn px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none"/>
      <button type="submit" className="sm:col-span-2 bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-btn transition-colors">Send Message</button>
    </form>
  )
}

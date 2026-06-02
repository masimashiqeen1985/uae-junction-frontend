import type{Metadata}from'next'
import{ContactForm}from'@/components/contact/ContactForm'

export const metadata:Metadata={
  title:'Contact Us',
  description:'Get in touch with The UAE Junction — call, email or WhatsApp us, or send a message and our team will respond within 24 hours.',
}
export const revalidate=3600

const PHONE='+971 58 589 8221'
const EMAIL='sales@theuaejunction.com'
const WA='971585898221'

export default function ContactPage(){
  return(
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary-dark via-secondary to-neutral-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,165,0,0.22),transparent_45%)]"/>
        <div className="container-xl relative z-10 py-16 max-w-3xl">
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl mb-4 leading-tight">Get In Touch</h1>
          <p className="text-neutral-100 text-lg leading-relaxed">Questions about a trip, a booking, or your cashback? Our team is here to help — usually within minutes on WhatsApp.</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-xl grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2 space-y-5">
            <h2 className="font-display font-bold text-2xl text-secondary mb-4">Contact Details</h2>
            <a href={`tel:${PHONE.replace(/[^+\d]/g,'')}`} className="flex items-center gap-4 p-5 bg-neutral-50 rounded-card hover:shadow-card transition-shadow">
              <span className="text-2xl">📞</span>
              <span><span className="block text-xs uppercase tracking-widest text-neutral-400">Call us</span><span className="font-semibold text-neutral-800">{PHONE}</span></span>
            </a>
            <a href={`mailto:${EMAIL}`} className="flex items-center gap-4 p-5 bg-neutral-50 rounded-card hover:shadow-card transition-shadow">
              <span className="text-2xl">✉️</span>
              <span><span className="block text-xs uppercase tracking-widest text-neutral-400">Email us</span><span className="font-semibold text-neutral-800">{EMAIL}</span></span>
            </a>
            <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 bg-green-50 rounded-card hover:shadow-card transition-shadow">
              <span className="text-2xl">💬</span>
              <span><span className="block text-xs uppercase tracking-widest text-neutral-400">WhatsApp</span><span className="font-semibold text-neutral-800">Chat instantly →</span></span>
            </a>
            <div className="p-5 bg-neutral-50 rounded-card">
              <span className="block text-xs uppercase tracking-widest text-neutral-400 mb-1">Hours</span>
              <span className="font-semibold text-neutral-800">Every day, 9:00 AM – 9:00 PM (GST)</span>
            </div>
          </div>
          <div className="lg:col-span-3">
            <h2 className="font-display font-bold text-2xl text-secondary mb-6">Send Us a Message</h2>
            <ContactForm/>
          </div>
        </div>
      </section>
    </div>
  )
}

import Link from'next/link'
const L=[['Home','/'],['About Us','/about-us'],['Contact Us','/contact-us'],['Blogs','/blogs'],['Careers','/careers'],['Privacy Policy','/privacy-policy'],['Terms & Conditions','/terms-and-conditions'],['Rewards Policy','/rewards-policy']]
const P=[['Theme Parks','/theme-parks'],['Water Parks','/water-parks'],['Desert Safari','/desert-safari'],['Dhow Cruise','/dhow-cruise'],['Experiences','/experiences'],['Hotel Booking','/hotel-booking'],['Flight Booking','/flight-booking'],['Umrah Packages','/umrah-packages']]
export function Footer(){
  return(
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="container-xl py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div><div className="font-display font-bold text-xl text-white mb-4">THE UAE <span className="text-primary">JUNCTION</span></div><p className="text-sm text-neutral-400 mb-6 leading-relaxed">Your gateway to global exploration. 4% Cashback on all travel bookings.</p><div className="space-y-2 text-sm"><a href="tel:+971585898221" className="block hover:text-primary transition-colors">📞 +971 58 589 8221</a><a href="mailto:sales@theuaejunction.com" className="block hover:text-primary transition-colors">✉️ sales@theuaejunction.com</a></div></div>
          <div><h3 className="font-display font-semibold text-white mb-4">Quick Links</h3><ul className="space-y-2">{L.map(([l,h])=><li key={h}><Link href={h} className="text-sm hover:text-primary transition-colors">{l}</Link></li>)}</ul></div>
          <div><h3 className="font-display font-semibold text-white mb-4">Our Packages</h3><ul className="space-y-2">{P.map(([l,h])=><li key={h}><Link href={h} className="text-sm hover:text-primary transition-colors">{l}</Link></li>)}</ul></div>
          <div><h3 className="font-display font-semibold text-white mb-4">Connect With Us</h3><div className="flex gap-3 mb-6">{['f','in','yt','tt'].map(s=><a key={s} href="#" className="w-9 h-9 rounded-full bg-neutral-700 hover:bg-primary flex items-center justify-center text-xs transition-colors">{s}</a>)}</div><a href="https://wa.me/971585898221" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-btn text-sm font-semibold transition-colors">💬 WhatsApp Us</a></div>
        </div>
        <div className="border-t border-neutral-700 mt-10 pt-6 text-center text-sm text-neutral-500">© {new Date().getFullYear()} The UAE Junction. All rights reserved.</div>
      </div>
    </footer>
  )
}
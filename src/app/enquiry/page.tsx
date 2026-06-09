import type { Metadata } from 'next'
import EnquiryWizard from '@/components/enquiry/EnquiryWizard'

export const metadata: Metadata = {
  title: 'Get a Hand-Priced Quote | Flights & Hotels — The UAE Junction',
  description:
    'Tell us your trip in one quick form — travellers, destination, flights and hotel preferences — and our UAE travel desk hand-prices your quote. No callback needed.',
  alternates: { canonical: '/enquiry' },
  openGraph: {
    title: 'Get a Hand-Priced Quote | The UAE Junction',
    description:
      'One quick form for flights, hotels or both. Our UAE travel desk sends a tailored, hand-priced quote.',
    url: '/enquiry',
    type: 'website',
  },
}

export default function EnquiryPage() {
  return (
    <main className="container-xl" style={{ paddingTop: 28, paddingBottom: 56 }}>
      <header style={{ maxWidth: 680, margin: '0 auto 26px', textAlign: 'center' }}>
        <span className="eyebrow">Hand-priced by our UAE travel desk</span>
        <h1
          className="font-display"
          style={{ fontSize: 'clamp(28px,5vw,44px)', lineHeight: 1.05, margin: '10px 0 12px', fontWeight: 800 }}
        >
          Tell us your trip — we’ll price it for you
        </h1>
        <p style={{ color: '#9aa3b8', fontSize: 16, margin: 0 }}>
          One quick form for flights, hotels or both. Share the details once and our desk
          sends a tailored quote — no callback needed unless you ask.
        </p>
      </header>
      <div className="uj-card" style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(18px,4vw,32px)' }}>
        <EnquiryWizard />
      </div>
    </main>
  )
}

import type{Metadata}from'next'
import{PageHero,breadcrumbJsonLd}from'@/components/sections/PageHero'
import{FaqAccordion,type FaqItem}from'@/components/faq/FaqAccordion'
import{JsonLd}from'@/components/ui/JsonLd'

export const metadata:Metadata={
  title:'Frequently Asked Questions',
  description:'Answers to common questions about booking flights, hotels, tours and experiences with The UAE Junction and earning 4% cashback.',
  alternates:{canonical:'https://theuaejunction.cloud/faq'},
  openGraph:{title:'FAQ | The UAE Junction',description:'Common questions about bookings and 4% cashback.',url:'https://theuaejunction.cloud/faq',type:'website'},
}
export const revalidate=3600

// Scaffold defaults — accurate to the brand's stated offering. Intended to be made
// CMS-editable in a later phase; the page renders these until then (graceful default,
// not fabricated marketing claims).
const FAQS:FaqItem[]=[
  {question:'What is The UAE Junction?',answer:'The UAE Junction is a UAE-based travel platform where you can book flights, hotels, theme park tickets, desert safaris, dhow cruises and holiday packages — and earn 4% cashback on your bookings.'},
  {question:'How does the 4% cashback work?',answer:'Eligible bookings made through The UAE Junction earn 4% cashback. For the exact terms, eligibility and how cashback is credited, please see our Rewards Policy or contact our team.'},
  {question:'What can I book through The UAE Junction?',answer:'Flights, hotels, theme park and water park tickets, desert safari, dhow cruise, city tours, Umrah packages, and tailored holiday and group/corporate packages.'},
  {question:'How do I get a quote or make a booking?',answer:'Use the contact form on our Contact page, message us on WhatsApp, or call us — our team will help you build and confirm your booking.'},
  {question:'How can I contact your team?',answer:'You can reach us by phone, email or WhatsApp. Visit our Contact page for the latest contact details and response times.'},
]

export default function FaqPage(){
  const crumbs=[{label:'Home',href:'/'},{label:'FAQ'}]
  const faqJsonLd={
    '@context':'https://schema.org',
    '@type':'FAQPage',
    mainEntity:FAQS.map(f=>({'@type':'Question',name:f.question,acceptedAnswer:{'@type':'Answer',text:f.answer}})),
  }
  return(
    <div>
      <JsonLd data={[breadcrumbJsonLd(crumbs),faqJsonLd]}/>
      <PageHero title="Frequently Asked Questions" subtitle="Everything you need to know about booking with The UAE Junction and earning 4% cashback." crumbs={crumbs}/>
      <section className="py-16 bg-neutral-50">
        <div className="container-xl max-w-3xl">
          <FaqAccordion items={FAQS}/>
        </div>
      </section>
    </div>
  )
}

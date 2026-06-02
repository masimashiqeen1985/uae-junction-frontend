import type{Metadata}from'next'
import{PageHero,breadcrumbJsonLd}from'@/components/sections/PageHero'
import{EmptyState}from'@/components/sections/EmptyState'
import{JsonLd}from'@/components/ui/JsonLd'

export const metadata:Metadata={
  title:'Case Studies',
  description:'Real stories of trips and group bookings we’ve delivered for our customers across the UAE and beyond.',
  alternates:{canonical:'https://theuaejunction.cloud/case-studies'},
  openGraph:{title:'Case Studies | The UAE Junction',description:'Customer success stories.',url:'https://theuaejunction.cloud/case-studies',type:'website'},
}
export const revalidate=3600

export default function CaseStudiesPage(){
  const crumbs=[{label:'Home',href:'/'},{label:'Case Studies'}]
  return(
    <div>
      <JsonLd data={breadcrumbJsonLd(crumbs)}/>
      <PageHero title="Case Studies" subtitle="A look at the trips and group bookings we’ve put together for our customers." crumbs={crumbs}/>
      <section className="py-16 bg-neutral-50 min-h-[40vh]">
        <div className="container-xl">
          <EmptyState icon="📂" title="Case studies coming soon" body="We’re writing up some of our favourite customer trips."/>
        </div>
      </section>
    </div>
  )
}

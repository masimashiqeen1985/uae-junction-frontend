import type{Metadata}from'next'
import{PageHero,breadcrumbJsonLd}from'@/components/sections/PageHero'
import{EmptyState}from'@/components/sections/EmptyState'
import{JsonLd}from'@/components/ui/JsonLd'

export const metadata:Metadata={
  title:'Industries We Serve',
  description:'Tailored travel and group booking solutions for the industries and sectors we work with across the UAE.',
  alternates:{canonical:'https://theuaejunction.cloud/industries'},
  openGraph:{title:'Industries | The UAE Junction',description:'Travel solutions by industry.',url:'https://theuaejunction.cloud/industries',type:'website'},
}
export const revalidate=3600

export default function IndustriesPage(){
  const crumbs=[{label:'Home',href:'/'},{label:'Industries'}]
  return(
    <div>
      <JsonLd data={breadcrumbJsonLd(crumbs)}/>
      <PageHero title="Industries We Serve" subtitle="Travel and group-booking solutions tailored to the way different sectors work." crumbs={crumbs}/>
      <section className="py-16 bg-neutral-50 min-h-[40vh]">
        <div className="container-xl">
          <EmptyState icon="🏢" title="Industry pages are on the way" body="We’re preparing sector-specific travel solutions."/>
        </div>
      </section>
    </div>
  )
}

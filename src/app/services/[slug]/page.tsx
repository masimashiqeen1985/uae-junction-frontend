import type{Metadata}from'next'
import Link from'next/link'
import{notFound}from'next/navigation'
import{fetchGraphQL}from'@/lib/graphql-client'
import{GET_PAGE_BY_URI}from'@/lib/queries/pages'
import{PageHero,breadcrumbJsonLd}from'@/components/sections/PageHero'
import{WPImage}from'@/components/ui/WPImage'
import{JsonLd}from'@/components/ui/JsonLd'
import type{WPPage}from'@/types/wordpress'

interface Props{params:Promise<{slug:string}>}

// Build-resilient pattern (same as blog single): pre-render nothing at build, render
// on-demand at request time, then cache via ISR. Avoids baking a stale not-found page
// when the build box cannot reach the CMS. A Service Detail maps to a WP Page whose
// URI is /services/<slug>/. None exist yet -> unknown slugs 404 gracefully.
export const revalidate=3600
export const dynamicParams=true
export function generateStaticParams():{slug:string}[]{return[]}

async function getPage(slug:string):Promise<WPPage|null>{
  try{
    const d=await fetchGraphQL<{page?:WPPage}>(GET_PAGE_BY_URI,{uri:`/services/${slug}/`},3600)
    return d.page??null
  }catch{return null}
}

export async function generateMetadata({params}:Props):Promise<Metadata>{
  const{slug}=await params
  const page=await getPage(slug)
  if(!page)return{title:'Service not found'}
  const desc=(page.content??'').replace(/<[^>]+>/g,'').trim().slice(0,160)||undefined
  return{title:page.title,description:desc,alternates:{canonical:`https://theuaejunction.cloud/services/${slug}`}}
}

export default async function ServiceDetailPage({params}:Props){
  const{slug}=await params
  const page=await getPage(slug)
  if(!page)notFound()
  const crumbs=[{label:'Home',href:'/'},{label:'Services',href:'/services'},{label:page.title}]
  const serviceJsonLd={
    '@context':'https://schema.org','@type':'Service',name:page.title,
    provider:{'@type':'Organization',name:'The UAE Junction',url:'https://theuaejunction.cloud'},
    url:`https://theuaejunction.cloud/services/${slug}`,areaServed:'AE',
  }
  return(
    <div>
      <JsonLd data={[breadcrumbJsonLd(crumbs),serviceJsonLd]}/>
      <PageHero title={page.title} crumbs={crumbs}/>
      {page.featuredImage?.node?.sourceUrl&&(
        <div className="container-xl max-w-3xl -mt-8 relative z-10">
          <div className="relative aspect-[16/9] rounded-card overflow-hidden shadow-card-hover">
            <WPImage image={page.featuredImage.node} fill className="object-cover" sizes="(max-width:768px) 100vw,768px" priority/>
          </div>
        </div>
      )}
      <section className="container-xl max-w-3xl py-12">
        <div className="blog-content text-neutral-700 leading-relaxed" dangerouslySetInnerHTML={{__html:page.content??''}}/>
        <div className="mt-10">
          <Link href="/contact-us" className="inline-block bg-primary text-white font-bold px-8 py-3.5 rounded-btn hover:bg-primary-dark transition-colors">Get a Free Quote</Link>
        </div>
      </section>
    </div>
  )
}

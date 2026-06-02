import type{Metadata}from'next'
import{notFound}from'next/navigation'
import{fetchGraphQL}from'@/lib/graphql-client'
import{GET_PAGE_BY_URI}from'@/lib/queries/pages'
import{PageHero,breadcrumbJsonLd}from'@/components/sections/PageHero'
import{WPImage}from'@/components/ui/WPImage'
import{JsonLd}from'@/components/ui/JsonLd'
import type{WPPage}from'@/types/wordpress'

interface Props{params:Promise<{slug:string}>}
// Build-resilient SSG (see /services/[slug]). Maps to a WP Page at /case-studies/<slug>/.
export const revalidate=3600
export const dynamicParams=true
export function generateStaticParams():{slug:string}[]{return[]}

async function getPage(slug:string):Promise<WPPage|null>{
  try{
    const d=await fetchGraphQL<{page?:WPPage}>(GET_PAGE_BY_URI,{uri:`/case-studies/${slug}/`},3600)
    return d.page??null
  }catch{return null}
}

export async function generateMetadata({params}:Props):Promise<Metadata>{
  const{slug}=await params
  const page=await getPage(slug)
  if(!page)return{title:'Case study not found'}
  const desc=(page.content??'').replace(/<[^>]+>/g,'').trim().slice(0,160)||undefined
  return{title:page.title,description:desc,alternates:{canonical:`https://theuaejunction.cloud/case-studies/${slug}`}}
}

export default async function CaseStudyPage({params}:Props){
  const{slug}=await params
  const page=await getPage(slug)
  if(!page)notFound()
  const crumbs=[{label:'Home',href:'/'},{label:'Case Studies',href:'/case-studies'},{label:page.title}]
  return(
    <div>
      <JsonLd data={breadcrumbJsonLd(crumbs)}/>
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
      </section>
    </div>
  )
}

import type{Metadata}from'next'
import Link from'next/link'
import{fetchGraphQL}from'@/lib/graphql-client'
import{GET_DESTINATIONS}from'@/lib/queries/destinations'
import{PageHero}from'@/components/layout/PageHero'
import{QuoteForm}from'@/components/home/QuoteForm'

const SITE='https://www.theuaejunction.cloud'
export const revalidate=3600

const DESC='Discover experiences by destination — theme parks, water parks, tours and more across Dubai, Abu Dhabi, the UAE and beyond, with instant confirmation and 2.5% cashback.'

export const metadata:Metadata={
  title:'Destinations',
  description:DESC,
  alternates:{canonical:'/destinations'},
  openGraph:{title:'Destinations | The UAE Junction',description:DESC,url:'/destinations',type:'website'},
}

interface DestNode{id:string;databaseId:number;name:string;slug:string;count?:number|null;parentDatabaseId?:number|null;children?:{nodes:Array<{id:string;name:string;slug:string;count?:number|null}>}}
interface DestData{destinations?:{nodes:DestNode[]}}

async function getData():Promise<DestData>{
  try{return await fetchGraphQL<DestData>(GET_DESTINATIONS,{},3600)}
  catch{return{}}
}

export default async function DestinationsPage(){
  const data=await getData()
  const all=data.destinations?.nodes??[]
  const countries=all.filter(d=>!d.parentDatabaseId&&(d.count??0)>0)

  const breadcrumbLd={
    '@context':'https://schema.org','@type':'BreadcrumbList',
    itemListElement:[
      {'@type':'ListItem',position:1,name:'Home',item:`${SITE}/`},
      {'@type':'ListItem',position:2,name:'Destinations',item:`${SITE}/destinations`},
    ],
  }

  return(
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumbLd)}}/>
      <PageHero title="Destinations" subtitle="Pick a place — we’ll show you everything worth doing there."/>

      {countries.length>0?(
        <div className="container-xl py-10 sm:py-12 space-y-12">
          {countries.map(country=>{
            const cities=(country.children?.nodes??[]).filter(c=>(c.count??0)>0)
            return(
              <section key={country.id} aria-labelledby={`dest-${country.slug}`}>
                <div className="flex items-baseline justify-between gap-4 mb-5">
                  <h2 id={`dest-${country.slug}`} className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-ink">{country.name}</h2>
                  <Link href={`/destinations/${country.slug}`} className="text-sm font-semibold text-primary hover:underline whitespace-nowrap">
                    All {country.count} experience{country.count===1?'':'s'} →
                  </Link>
                </div>
                {cities.length>0?(
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                    {cities.map(city=>(
                      <Link key={city.id} href={`/destinations/${city.slug}`} className="uj-card group p-6 flex flex-col gap-1 transition-transform hover:-translate-y-0.5">
                        <span className="font-display font-bold text-lg text-ink group-hover:text-primary">{city.name}</span>
                        <span className="text-sm text-neutral-500">{city.count} experience{city.count===1?'':'s'}</span>
                      </Link>
                    ))}
                  </div>
                ):(
                  <p className="text-sm text-neutral-500">Experiences coming soon.</p>
                )}
              </section>
            )
          })}
        </div>
      ):(
        <div className="container-xl py-16 text-center">
          <p className="text-neutral-500">Destinations are being added — check back shortly, or get a free quote below.</p>
        </div>
      )}

      <QuoteForm/>
    </div>
  )
}

import type{Metadata}from'next'
import Link from'next/link'
import{fetchGraphQL}from'@/lib/graphql-client'
import{PageHero}from'@/components/layout/PageHero'
import{QuoteForm}from'@/components/home/QuoteForm'

const SITE='https://www.theuaejunction.cloud'

// Fixed display order + copy for the 14 live product categories.
const CATEGORIES:{slug:string;name:string;blurb:string}[]=[
  {slug:'theme-parks-attractions',name:'Theme Parks & Attractions',blurb:'World-class rides and attractions across the UAE.'},
  {slug:'water-parks',name:'Water Parks',blurb:'Water adventure, just a splash away.'},
  {slug:'adventure-thrill',name:'Adventure & Thrill',blurb:'Adrenaline-packed experiences for the bold.'},
  {slug:'landmarks-views',name:'Landmarks & Views',blurb:'Iconic skylines and unforgettable viewpoints.'},
  {slug:'gardens-nature',name:'Gardens & Nature',blurb:'Green escapes and natural wonders.'},
  {slug:'museums-culture-immersive',name:'Museums, Culture & Immersive',blurb:'Art, heritage and immersive worlds.'},
  {slug:'desert-safari',name:'Desert Safari',blurb:'Dunes, sunsets and Bedouin nights.'},
  {slug:'city-tours',name:'City Tours',blurb:'See the best of the city in one trip.'},
  {slug:'cruises',name:'Cruises',blurb:'Set sail across the Arabian Gulf.'},
  {slug:'combo-passes',name:'Combo Passes',blurb:'More experiences, better value.'},
  {slug:'staycations-hotels',name:'Staycations & Hotels',blurb:'Stay, relax and unwind.'},
  {slug:'umrah-packages',name:'Umrah Packages',blurb:'A spiritual journey, thoughtfully arranged.'},
  {slug:'international-tours',name:'International Tours',blurb:'Explore beyond the UAE.'},
  {slug:'visa-services',name:'Visa Services',blurb:'Fast, hassle-free visa processing.'},
]

export const metadata:Metadata={
  title:'All Categories',
  description:'Browse all UAE Junction experience categories — theme parks, water parks, desert safaris, cruises, tours and more, each with instant confirmation and 2.5% cashback.',
  alternates:{canonical:'/category'},
  openGraph:{title:'All Categories | The UAE Junction',description:'Browse every UAE Junction experience category with 2.5% cashback on every booking.',url:'/category',type:'website'},
}
export const revalidate=3600

const GET_CATEGORY_COUNTS=`query CategoryCounts{productCategories(first:50){nodes{slug count}}}`

interface CountData{productCategories?:{nodes:{slug:string;count?:number|null}[]}}

async function getCounts():Promise<Record<string,number>>{
  try{
    const d=await fetchGraphQL<CountData>(GET_CATEGORY_COUNTS,undefined,3600)
    const map:Record<string,number>={}
    for(const n of d.productCategories?.nodes??[])if(n.count!=null)map[n.slug]=n.count
    return map
  }catch{return{}}
}

export default async function CategoryIndexPage(){
  const counts=await getCounts()

  const breadcrumbLd={
    '@context':'https://schema.org','@type':'BreadcrumbList',
    itemListElement:[
      {'@type':'ListItem',position:1,name:'Home',item:`${SITE}/`},
      {'@type':'ListItem',position:2,name:'Categories',item:`${SITE}/category`},
    ],
  }
  const itemListLd={
    '@context':'https://schema.org','@type':'ItemList',
    itemListElement:CATEGORIES.map((c,i)=>({
      '@type':'ListItem',position:i+1,name:c.name,url:`${SITE}/category/${c.slug}`,
    })),
  }

  return(
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumbLd)}}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(itemListLd)}}/>

      <PageHero title="Explore by Category" subtitle="Find your next experience — every booking earns 2.5% cashback."/>

      <div className="container-xl py-10 sm:py-12">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.map((c)=>{
            const n=counts[c.slug]
            return(
              <li key={c.slug}>
                <Link
                  href={`/category/${c.slug}`}
                  className="group flex h-full flex-col justify-between rounded-card border border-black/5 bg-white p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5"
                >
                  <div>
                    <h2 className="font-display font-bold text-lg text-neutral-900 group-hover:text-primary transition-colors">{c.name}</h2>
                    <p className="mt-2 text-sm text-neutral-500">{c.blurb}</p>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    {n?`${n} experience${n===1?'':'s'}`:'Explore'}
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      <QuoteForm/>
    </div>
  )
}

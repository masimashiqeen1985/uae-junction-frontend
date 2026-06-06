import type{Metadata}from'next'
import Link from'next/link'
import{notFound}from'next/navigation'
import{fetchGraphQL}from'@/lib/graphql-client'
import{GET_DESTINATION_PRODUCTS}from'@/lib/queries/destinations'
import type{WPProduct}from'@/types/wordpress'
import{ProductCard}from'@/components/ui/ProductCard'
import{PageHero}from'@/components/layout/PageHero'
import{QuoteForm}from'@/components/home/QuoteForm'

const SITE='https://www.theuaejunction.cloud'
export const revalidate=3600

// Marketing copy per known destination slug. Falls back to a generic line.
const DEST_META:Record<string,{subtitle:string;blurb:string}>={
  'dubai':{subtitle:'Theme parks, desert safaris, sky-high views — the city that has it all.',blurb:'Discover everything to do in Dubai — theme parks, water parks, desert safaris, cruises and more with instant confirmation and 2.5% cashback.'},
  'abu-dhabi':{subtitle:'Ferrari World, Yas Island and culture on a grand scale.',blurb:'Book the best of Abu Dhabi — Ferrari World, SeaWorld, Louvre Abu Dhabi, Yas Island passes and more with 2.5% cashback.'},
  'sharjah':{subtitle:'The cultural heart of the UAE.',blurb:'Explore Sharjah’s parks, culture and city tours with instant confirmation and 2.5% cashback.'},
  'ras-al-khaimah':{subtitle:'Mountains, ziplines and wide-open adventure.',blurb:'Ras Al Khaimah adventures including the world’s longest zipline at Jebel Jais, with 2.5% cashback.'},
  'fujairah':{subtitle:'The UAE’s east-coast escape.',blurb:'Fujairah and east coast experiences with instant confirmation and 2.5% cashback.'},
  'al-ain':{subtitle:'The garden city of the UAE.',blurb:'Al Ain tours and experiences with instant confirmation and 2.5% cashback.'},
  'umm-al-quwain':{subtitle:'Laid-back lagoons and family fun.',blurb:'Umm Al Quwain experiences including DreamLand Aqua Park, with 2.5% cashback.'},
  'united-arab-emirates':{subtitle:'Seven emirates, endless experiences.',blurb:'Every UAE experience in one place — Dubai, Abu Dhabi, Sharjah and beyond with instant confirmation and 2.5% cashback.'},
  'saudi-arabia':{subtitle:'Spiritual journeys, thoughtfully arranged.',blurb:'Umrah packages and Saudi Arabia travel with trusted operators and 2.5% cashback.'},
  'makkah':{subtitle:'Umrah packages with trusted operators.',blurb:'Umrah packages to Makkah with hotels, transfers and 2.5% cashback.'},
  'oman':{subtitle:'Fjords, dhows and untouched coastline.',blurb:'Oman and Musandam experiences with instant confirmation and 2.5% cashback.'},
  'musandam':{subtitle:'The Norway of Arabia.',blurb:'Musandam dhow cruises and Khasab adventures with 2.5% cashback.'},
  'georgia':{subtitle:'Mountains, wine country and old-world charm.',blurb:'Georgia tour packages with instant confirmation and 2.5% cashback.'},
  'tbilisi':{subtitle:'Old-world charm meets mountain air.',blurb:'Tbilisi and Georgia tours with instant confirmation and 2.5% cashback.'},
}

interface DestData{destination?:{name:string;slug:string;description?:string;count?:number|null;parent?:{node:{name:string;slug:string}}|null;children?:{nodes:Array<{name:string;slug:string;count?:number|null}>};products:{nodes:WPProduct[]}}}

async function getData(slug:string):Promise<DestData>{
  try{return await fetchGraphQL<DestData>(GET_DESTINATION_PRODUCTS,{slug,first:100},3600)}
  catch{return{}}
}

function strip(html?:string){return html?html.replace(/<[^>]+>/g,'').trim():''}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const{slug}=await params
  const data=await getData(slug)
  const dest=data.destination
  if(!dest)return{title:slug.replace(/-/g,' ')}
  const meta=DEST_META[slug]
  const desc=meta?.blurb||strip(dest.description)||`Things to do in ${dest.name} — tickets, tours and experiences with instant confirmation and 2.5% cashback.`
  return{
    title:`Things to Do in ${dest.name}`,
    description:desc,
    alternates:{canonical:`/destinations/${slug}`},
    openGraph:{title:`Things to Do in ${dest.name} | The UAE Junction`,description:desc,url:`/destinations/${slug}`,type:'website'},
  }
}

export default async function DestinationPage({params}:{params:Promise<{slug:string}>}){
  const{slug}=await params
  const data=await getData(slug)
  const dest=data.destination
  if(!dest)notFound()

  const products=dest.products?.nodes??[]
  const meta=DEST_META[slug]
  const cities=(dest.children?.nodes??[]).filter(c=>(c.count??0)>0)
  const parent=dest.parent?.node

  const crumbs=[{name:'Home',item:`${SITE}/`},{name:'Destinations',item:`${SITE}/destinations`}]
  if(parent)crumbs.push({name:parent.name,item:`${SITE}/destinations/${parent.slug}`})
  crumbs.push({name:dest.name,item:`${SITE}/destinations/${slug}`})

  const breadcrumbLd={
    '@context':'https://schema.org','@type':'BreadcrumbList',
    itemListElement:crumbs.map((c,i)=>({'@type':'ListItem',position:i+1,name:c.name,item:c.item})),
  }
  const itemListLd=products.length>0?{
    '@context':'https://schema.org','@type':'ItemList',
    itemListElement:products.slice(0,24).map((pr,i)=>({
      '@type':'ListItem',position:i+1,name:pr.name,url:`${SITE}/product/${pr.slug}`,
    })),
  }:null

  return(
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumbLd)}}/>
      {itemListLd&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(itemListLd)}}/>}

      <PageHero title={`Things to Do in ${dest.name}`} subtitle={meta?.subtitle} crumb={dest.name}/>

      {cities.length>0&&(
        <div className="container-xl pt-8">
          <nav aria-label={`Cities in ${dest.name}`} className="flex flex-wrap gap-2">
            {cities.map(c=>(
              <Link key={c.slug} href={`/destinations/${c.slug}`} className="pill-cash !bg-white border border-neutral-200 text-ink hover:border-primary hover:text-primary transition-colors">
                {c.name} ({c.count})
              </Link>
            ))}
          </nav>
        </div>
      )}

      {products.length>0?(
        <div className="container-xl py-10 sm:py-12">
          <p className="text-sm text-neutral-500 mb-6" aria-live="polite">{products.length} experience{products.length===1?'':'s'} in {dest.name}</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map(pr=><ProductCard key={pr.id} product={pr}/>)}
          </div>
        </div>
      ):(
        <div className="container-xl py-16 text-center">
          <p className="text-neutral-500">Experiences in {dest.name} are coming soon — check back shortly, or get a free quote below.</p>
        </div>
      )}

      <QuoteForm/>
    </div>
  )
}

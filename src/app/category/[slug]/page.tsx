import type{Metadata}from'next'
import{notFound}from'next/navigation'
import{fetchGraphQL}from'@/lib/graphql-client'
import{GET_CATEGORY_PRODUCTS}from'@/lib/queries/products'
import type{WPProduct}from'@/types/wordpress'
import{FilterableProductGrid}from'@/components/ui/FilterableProductGrid'
import{PageHero}from'@/components/layout/PageHero'
import{QuoteForm}from'@/components/home/QuoteForm'

const SITE='https://www.theuaejunction.cloud'

// Marketing copy per known category slug. Falls back to CMS name/description.
const CAT_META:Record<string,{subtitle:string;blurb:string}>={
  'theme-parks-attractions':{subtitle:'World-class rides and attractions across the UAE.',blurb:'Skip-the-line theme park and attraction tickets with instant confirmation and 2.5% cashback.'},
  'water-parks':{subtitle:'Water adventure, just a splash away!',blurb:'Book the UAE’s best water park tickets with instant confirmation and 2.5% cashback.'},
  'adventure-thrill':{subtitle:'Adrenaline-packed experiences for the bold.',blurb:'Adventure and thrill experiences across the UAE with instant confirmation and 2.5% cashback.'},
  'landmarks-views':{subtitle:'Iconic skylines and unforgettable viewpoints.',blurb:'Tickets to the UAE’s most iconic landmarks and observation decks, with 2.5% cashback.'},
  'gardens-nature':{subtitle:'Green escapes and natural wonders.',blurb:'Gardens, parks and nature experiences across the UAE with instant confirmation and 2.5% cashback.'},
  'museums-culture-immersive':{subtitle:'Art, heritage and immersive worlds.',blurb:'Museums, cultural sites and immersive experiences with instant confirmation and 2.5% cashback.'},
  'desert-safari':{subtitle:'Dunes, sunsets and Bedouin nights.',blurb:'Desert safari experiences across the UAE with instant confirmation and 2.5% cashback.'},
  'city-tours':{subtitle:'See the best of the city in one trip.',blurb:'Guided city tours across the UAE with instant confirmation and 2.5% cashback.'},
  'cruises':{subtitle:'Set sail across the Arabian Gulf.',blurb:'Dhow and yacht cruises across the UAE with instant confirmation and 2.5% cashback.'},
  'combo-passes':{subtitle:'More experiences, better value.',blurb:'Combo passes that bundle the UAE’s best experiences — with 2.5% cashback on every booking.'},
  'staycations-hotels':{subtitle:'Stay, relax and unwind.',blurb:'Staycations and hotel packages across the UAE with 2.5% cashback on every booking.'},
  'umrah-packages':{subtitle:'A spiritual journey, thoughtfully arranged.',blurb:'Umrah packages with trusted operators, instant confirmation and 2.5% cashback.'},
  'international-tours':{subtitle:'Explore beyond the UAE.',blurb:'International tour packages with instant confirmation and 2.5% cashback.'},
  'visa-services':{subtitle:'Fast, hassle-free visa processing.',blurb:'UAE and international visa services with quick turnaround and 2.5% cashback.'},
}

export const revalidate=3600

interface CatData{productCategory?:{name:string;slug:string;description?:string;count?:number;products:{nodes:WPProduct[]}}}

async function getData(slug:string):Promise<CatData>{
  try{return await fetchGraphQL<CatData>(GET_CATEGORY_PRODUCTS,{slug,first:48},3600)}
  catch{return{}}
}

function strip(html?:string){return html?html.replace(/<[^>]+>/g,'').trim():''}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const{slug}=await params
  const data=await getData(slug)
  const cat=data.productCategory
  if(!cat)return{title:slug.replace(/-/g,' ')}
  const meta=CAT_META[slug]
  const desc=meta?.blurb||strip(cat.description)||`Browse ${cat.name} experiences across the UAE with instant confirmation and 2.5% cashback.`
  return{
    title:cat.name,
    description:desc,
    alternates:{canonical:`/category/${slug}`},
    openGraph:{title:`${cat.name} | The UAE Junction`,description:desc,url:`/category/${slug}`,type:'website'},
  }
}

export default async function CategoryPage({params}:{params:Promise<{slug:string}>}){
  const{slug}=await params
  const data=await getData(slug)
  const cat=data.productCategory
  if(!cat)notFound()

  const products=cat.products?.nodes??[]
  const meta=CAT_META[slug]

  const breadcrumbLd={
    '@context':'https://schema.org','@type':'BreadcrumbList',
    itemListElement:[
      {'@type':'ListItem',position:1,name:'Home',item:`${SITE}/`},
      {'@type':'ListItem',position:2,name:cat.name,item:`${SITE}/category/${slug}`},
    ],
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

      <PageHero title={cat.name} subtitle={meta?.subtitle}/>

      {products.length>0?(
        <FilterableProductGrid products={products} noun="experience"/>
      ):(
        <div className="container-xl py-16 text-center">
          <p className="text-neutral-500">Experiences in this category are coming soon — check back shortly, or get a free quote below.</p>
        </div>
      )}

      <QuoteForm/>
    </div>
  )
}

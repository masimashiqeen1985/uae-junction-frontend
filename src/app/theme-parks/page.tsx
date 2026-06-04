import type{Metadata}from'next'
import{fetchGraphQL}from'@/lib/graphql-client'
import{GET_CATEGORY_PRODUCTS}from'@/lib/queries/products'
import type{WPProduct}from'@/types/wordpress'
import{ProductCard}from'@/components/ui/ProductCard'
import{PageHero}from'@/components/layout/PageHero'
import{QuoteForm}from'@/components/home/QuoteForm'

export const metadata:Metadata={
  title:'Theme Park Tickets',
  description:'Skip-the-line theme park tickets in the UAE — LEGOLAND, MotionGate, Ferrari World, IMG Worlds, SeaWorld and more. Instant confirmation and 4% cashback on every booking.',
  alternates:{canonical:'/theme-parks'},
  openGraph:{title:'Theme Park Tickets | The UAE Junction',description:'Book the UAE’s best theme park tickets with 4% cashback.',url:'/theme-parks',type:'website'},
}
export const revalidate=3600

interface CatData{productCategory?:{name:string;slug:string;description?:string;count?:number;products:{nodes:WPProduct[]}}}

async function getData():Promise<CatData>{
  try{return await fetchGraphQL<CatData>(GET_CATEGORY_PRODUCTS,{slug:'theme-parks-attractions',first:48},3600)}
  catch{return{}}
}

export default async function Page(){
  const data=await getData()
  const products=data.productCategory?.products?.nodes??[]

  const breadcrumbLd={
    '@context':'https://schema.org','@type':'BreadcrumbList',
    itemListElement:[
      {'@type':'ListItem',position:1,name:'Home',item:'https://www.theuaejunction.cloud/'},
      {'@type':'ListItem',position:2,name:'Theme Parks',item:'https://www.theuaejunction.cloud/theme-parks'},
    ],
  }
  const itemListLd=products.length>0?{
    '@context':'https://schema.org','@type':'ItemList',
    itemListElement:products.slice(0,24).map((p,i)=>({
      '@type':'ListItem',position:i+1,name:p.name,url:`https://www.theuaejunction.cloud/product/${p.slug}`,
    })),
  }:null

  return(
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumbLd)}}/>
      {itemListLd&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(itemListLd)}}/>}

      <PageHero
        title="Theme Parks"
        subtitle="The adventure begins here — skip-the-line tickets to the UAE’s biggest theme parks, with instant confirmation and 4% cashback on every booking."
      />

      {products.length>0?(
        <div className="container-xl py-10 sm:py-12">
          <p className="text-sm text-neutral-500 mb-6" aria-live="polite">{products.length} attraction{products.length===1?'':'s'}</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map(p=><ProductCard key={p.id} product={p}/>)}
          </div>
        </div>
      ):(
        <div className="container-xl py-16 text-center">
          <p className="text-neutral-500">Theme park tickets are loading. Please check back shortly.</p>
        </div>
      )}

      <QuoteForm/>
    </div>
  )
}

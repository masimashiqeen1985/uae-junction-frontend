import type{Metadata}from'next'
import{fetchGraphQL}from'@/lib/graphql-client'
import{GET_CATEGORY_PRODUCTS}from'@/lib/queries/products'
import type{WPProduct}from'@/types/wordpress'
import{FilterableProductGrid}from'@/components/ui/FilterableProductGrid'
import{PageHero}from'@/components/layout/PageHero'
import{QuoteForm}from'@/components/home/QuoteForm'

export const metadata:Metadata={
  title:'UAE City Tours',
  description:'Guided city tours across the UAE — Dubai, Abu Dhabi and beyond, with instant confirmation and 2.5% cashback.',
  alternates:{canonical:'/uae-city-tours'},
  openGraph:{title:'UAE City Tours | The UAE Junction',description:'Book UAE city tours with 2.5% cashback.',url:'/uae-city-tours',type:'website'},
}
export const revalidate=3600

interface CatData{productCategory?:{name:string;slug:string;description?:string;count?:number;products:{nodes:WPProduct[]}}}

async function getData():Promise<CatData>{
  try{return await fetchGraphQL<CatData>(GET_CATEGORY_PRODUCTS,{slug:'city-tours',first:48},3600)}
  catch{return{}}
}

export default async function Page(){
  const data=await getData()
  const products=data.productCategory?.products?.nodes??[]

  const breadcrumbLd={
    '@context':'https://schema.org','@type':'BreadcrumbList',
    itemListElement:[
      {'@type':'ListItem',position:1,name:'Home',item:'https://www.theuaejunction.cloud/'},
      {'@type':'ListItem',position:2,name:'UAE City Tours',item:'https://www.theuaejunction.cloud/uae-city-tours'},
    ],
  }
  const itemListLd=products.length>0?{
    '@context':'https://schema.org','@type':'ItemList',
    itemListElement:products.slice(0,24).map((pr,i)=>({
      '@type':'ListItem',position:i+1,name:pr.name,url:`https://www.theuaejunction.cloud/product/${pr.slug}`,
    })),
  }:null

  return(
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumbLd)}}/>
      {itemListLd&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(itemListLd)}}/>}

      <PageHero
        title="UAE City Tours"
        subtitle="Discover the best of the Emirates with guided city tours."
      />

      {products.length>0?(
        <FilterableProductGrid products={products} noun="city tour"/>
      ):(
        <div className="container-xl py-16 text-center">
          <p className="text-neutral-500">City tours are coming soon — check back shortly, or get a free quote below.</p>
        </div>
      )}

      <QuoteForm/>
    </div>
  )
}

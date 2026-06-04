import type{Metadata}from'next'
import{fetchGraphQL}from'@/lib/graphql-client'
import{GET_CATEGORY_PRODUCTS}from'@/lib/queries/products'
import type{WPProduct}from'@/types/wordpress'
import{ProductCard}from'@/components/ui/ProductCard'
import{PageHero}from'@/components/layout/PageHero'
import{QuoteForm}from'@/components/home/QuoteForm'

export const metadata:Metadata={
  title:'Desert Safari Packages',
  description:'Desert safari experiences in the UAE — dune bashing, camps and more, with instant confirmation and 4% cashback.',
  alternates:{canonical:'/desert-safari'},
  openGraph:{title:'Desert Safari Packages | The UAE Junction',description:'Book UAE desert safari packages with 4% cashback.',url:'/desert-safari',type:'website'},
}
export const revalidate=3600

interface CatData{productCategory?:{name:string;slug:string;description?:string;count?:number;products:{nodes:WPProduct[]}}}

async function getData():Promise<CatData>{
  try{return await fetchGraphQL<CatData>(GET_CATEGORY_PRODUCTS,{slug:'desert-safari',first:48},3600)}
  catch{return{}}
}

export default async function Page(){
  const data=await getData()
  const products=data.productCategory?.products?.nodes??[]

  const breadcrumbLd={
    '@context':'https://schema.org','@type':'BreadcrumbList',
    itemListElement:[
      {'@type':'ListItem',position:1,name:'Home',item:'https://www.theuaejunction.cloud/'},
      {'@type':'ListItem',position:2,name:'Desert Safari',item:'https://www.theuaejunction.cloud/desert-safari'},
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
        title="Desert Safari"
        subtitle="Experience the Magic of the Desert"
      />

      {products.length>0?(
        <div className="container-xl py-10 sm:py-12">
          <p className="text-sm text-neutral-500 mb-6" aria-live="polite">{products.length} desert safari package{products.length===1?'':'s'}</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map(pr=><ProductCard key={pr.id} product={pr}/>)}
          </div>
        </div>
      ):(
        <div className="container-xl py-16 text-center">
          <p className="text-neutral-500">Desert safari packages are coming soon — check back shortly, or get a free quote below.</p>
        </div>
      )}

      <QuoteForm/>
    </div>
  )
}

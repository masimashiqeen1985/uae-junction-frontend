import type{Metadata}from'next'
import{fetchGraphQL}from'@/lib/graphql-client'
import{GET_EXPERIENCES_LISTING}from'@/lib/queries/products'
import type{WPProduct,WPCategory}from'@/types/wordpress'
import{ExperiencesListing}from'@/components/experiences/ExperiencesListing'
import{QuoteForm}from'@/components/home/QuoteForm'
import{PageHero}from'@/components/layout/PageHero'

export const metadata:Metadata={
  title:'Experiences',
  description:'Browse and book the best UAE experiences - theme parks, desert safari, dhow cruise, city tours and more. Earn 4% cashback on every booking.',
  alternates:{canonical:'/experiences'},
  openGraph:{title:'Experiences | The UAE Junction',description:'Browse and book the best UAE experiences with 4% cashback.',url:'/experiences',type:'website'},
}
export const revalidate=3600

interface ListingData{
  products?:{nodes:WPProduct[]}
  productCategories?:{nodes:WPCategory[]}
}
interface Props{searchParams:Promise<{cat?:string;q?:string}>}

async function getListing():Promise<ListingData>{
  try{return await fetchGraphQL<ListingData>(GET_EXPERIENCES_LISTING,undefined,3600)}
  catch{return{}}
}

export default async function ExperiencesPage({searchParams}:Props){
  const{cat='',q=''}=await searchParams
  const data=await getListing()
  const products=data.products?.nodes??[]
  const categories=data.productCategories?.nodes??[]

  const breadcrumbLd={
    '@context':'https://schema.org','@type':'BreadcrumbList',
    itemListElement:[
      {'@type':'ListItem',position:1,name:'Home',item:'https://www.theuaejunction.cloud/'},
      {'@type':'ListItem',position:2,name:'Experiences',item:'https://www.theuaejunction.cloud/experiences'},
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
        title="Experiences"
        subtitle="Experience thrills beyond imagination - hand-picked tours and tickets across the UAE, with 4% cashback on every booking."
      />

      {products.length>0?(
        <ExperiencesListing products={products} categories={categories} initialCat={cat} initialQ={q}/>
      ):(
        <div className="container-xl py-16 text-center">
          <p className="text-neutral-500">Experiences are loading. Please check back shortly.</p>
        </div>
      )}

      <QuoteForm/>
    </div>
  )
}

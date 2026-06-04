import type{Metadata}from'next'
import Link from'next/link'
import{notFound}from'next/navigation'
import{fetchGraphQL}from'@/lib/graphql-client'
import type{WPProduct}from'@/types/wordpress'
import{WPImage}from'@/components/ui/WPImage'
import{Badge}from'@/components/ui/Badge'
import{formatPrice}from'@/lib/utils'

// Self-contained, schema-verified single-product query. Pricing fields live on
// SimpleProduct (inline fragment); no ACF/SEO fields (not registered on this CMS).
const MEDIA_FIELDS=`sourceUrl altText mediaDetails{width height sizes{sourceUrl width height name}}`
const GET_PRODUCT_BY_SLUG=`query GetProductBySlug($slug:ID!){product(id:$slug,idType:SLUG){id databaseId slug name shortDescription description onSale image{${MEDIA_FIELDS}}productCategories{nodes{name slug}} ... on SimpleProduct{regularPrice salePrice price}}}`

interface Props{params:Promise<{slug:string}>}
interface ProductData{product:WPProduct|null}

async function getProduct(slug:string):Promise<WPProduct|null>{
  try{const d=await fetchGraphQL<ProductData>(GET_PRODUCT_BY_SLUG,{slug},3600);return d.product??null}
  catch{return null}
}

export const revalidate=3600

export async function generateMetadata({params}:Props):Promise<Metadata>{
  const{slug}=await params
  const product=await getProduct(slug)
  if(!product)return{title:slug.replace(/-/g,' ')}
  const desc=product.shortDescription?product.shortDescription.replace(/<[^>]+>/g,'').trim():`Book ${product.name} with instant confirmation and 4% cashback.`
  return{
    title:product.name,
    description:desc,
    alternates:{canonical:`/product/${product.slug}`},
    openGraph:{title:`${product.name} | The UAE Junction`,description:desc,url:`/product/${product.slug}`,type:'website',images:product.image?.sourceUrl?[{url:product.image.sourceUrl}]:undefined},
  }
}

export default async function ProductPage({params}:Props){
  const{slug}=await params
  const product=await getProduct(slug)
  if(!product)notFound()

  const category=product.productCategories?.nodes?.[0]
  const display=formatPrice(product.salePrice??product.regularPrice??product.price??'')
  const struck=product.onSale&&product.regularPrice?formatPrice(product.regularPrice):null

  const productLd={
    '@context':'https://schema.org','@type':'Product',
    name:product.name,
    image:product.image?.sourceUrl?[product.image.sourceUrl]:undefined,
    description:product.shortDescription?product.shortDescription.replace(/<[^>]+>/g,'').trim():undefined,
    category:category?.name,
    offers:display?{'@type':'Offer',priceCurrency:'AED',price:display,availability:'https://schema.org/InStock',url:`https://www.theuaejunction.cloud/product/${product.slug}`}:undefined,
  }

  return(
    <div className="container-xl py-12 max-w-5xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(productLd)}}/>

      <nav className="text-sm text-neutral-400 mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        {category&&<> / <Link href={`/${category.slug}`} className="hover:text-primary">{category.name}</Link></>}
        {' / '}<span className="text-neutral-600">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="relative bg-neutral-100 rounded-card aspect-[4/3] overflow-hidden">
          {product.image?.sourceUrl
            ?<WPImage image={product.image} fill className="object-cover" sizes="(max-width:1024px) 100vw,50vw" priority/>
            :<div className="w-full h-full flex items-center justify-center text-neutral-400">No image</div>}
          {product.onSale&&<div className="absolute top-4 left-4"><Badge variant="sale">Sale</Badge></div>}
        </div>

        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-neutral-900 mb-4">{product.name}</h1>

          <div className="flex items-baseline gap-3 mb-6">
            {struck&&<span className="text-neutral-400 text-lg line-through">AED {struck}</span>}
            {display&&<span className="text-primary font-bold text-2xl">AED {display}</span>}
          </div>

          {product.shortDescription&&<div className="prose prose-neutral text-neutral-600 mb-6" dangerouslySetInnerHTML={{__html:product.shortDescription}}/>}

          <button className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-btn text-lg transition-colors mb-6">Book Now</button>

          <p className="text-sm text-neutral-500">Instant confirmation · Flat 4% cashback on every booking.</p>
        </div>
      </div>

      {product.description&&(
        <div className="mt-12 max-w-3xl">
          <h2 className="font-display font-bold text-xl text-neutral-900 mb-4">About {product.name}</h2>
          <div className="prose prose-neutral text-neutral-600" dangerouslySetInnerHTML={{__html:product.description}}/>
        </div>
      )}
    </div>
  )
}

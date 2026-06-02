import type{Metadata}from'next'
import{fetchGraphQL}from'@/lib/graphql-client'
import{GET_HOMEPAGE}from'@/lib/queries/homepage'
import type{WPProduct,WPCategory}from'@/types/wordpress'
import{Hero}from'@/components/home/Hero'
import{PromotionsBanner}from'@/components/home/PromotionsBanner'
import{TravelerFavorites}from'@/components/home/TravelerFavorites'
import{CategoryGrid}from'@/components/home/CategoryGrid'
import{MoreWaysToHaveFun}from'@/components/home/MoreWaysToHaveFun'
import{WhyChooseUs}from'@/components/home/WhyChooseUs'
import{Testimonials}from'@/components/home/Testimonials'
import{QuoteForm}from'@/components/home/QuoteForm'

export const metadata:Metadata={
  title:'The UAE Junction — Travel Deals with 4% Cashback',
  description:'Book theme parks, desert safari, dhow cruise, hotels & flights in the UAE. Get 4% cashback on every booking.',
}
export const revalidate=3600

interface HomepageData{
  featuredProducts?:{nodes:WPProduct[]}
  productCategories?:{nodes:WPCategory[]}
}

async function getHomepage():Promise<HomepageData>{
  // CMS-fed sections degrade gracefully: WooGraphQL / category ACF may not be
  // present yet, so a failed query must NOT break the page or the build.
  try{
    return await fetchGraphQL<HomepageData>(GET_HOMEPAGE,undefined,3600)
  }catch{
    return{}
  }
}

export default async function HomePage(){
  const data=await getHomepage()
  const products=data.featuredProducts?.nodes??[]
  const categories=data.productCategories?.nodes??[]
  return(
    <div>
      <Hero/>
      <PromotionsBanner/>
      <TravelerFavorites products={products}/>
      <CategoryGrid categories={categories}/>
      <MoreWaysToHaveFun/>
      <WhyChooseUs/>
      <section className="py-12 bg-primary">
        <div className="container-xl text-center">
          <h2 className="font-display font-bold text-3xl text-white mb-3">Get 4% Cashback on Every Booking</h2>
          <p className="text-white/90 mb-6">Register now and start earning rewards on every trip.</p>
          <a href="/my-account" className="inline-block bg-white text-primary font-bold px-8 py-3.5 rounded-btn hover:bg-neutral-100 transition-colors">Register Free</a>
        </div>
      </section>
      <Testimonials/>
      <QuoteForm/>
    </div>
  )
}

import type { Metadata } from 'next'
import { fetchGraphQL } from '@/lib/graphql-client'
import { GET_HOMEPAGE } from '@/lib/queries/homepage'
import { GET_POSTS } from '@/lib/queries/posts'
import type { WPProduct, WPCategory, WPPost } from '@/types/wordpress'
import { Hero } from '@/components/home/Hero'
import { PromotionsBanner } from '@/components/home/PromotionsBanner'
import { StatsBand } from '@/components/home/StatsBand'
import { TravelerFavorites } from '@/components/home/TravelerFavorites'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { MoreWaysToHaveFun } from '@/components/home/MoreWaysToHaveFun'
import { WhyChooseUs } from '@/components/home/WhyChooseUs'
import { CTABand } from '@/components/home/CTABand'
import { Testimonials } from '@/components/home/Testimonials'
import { BlogTeasers } from '@/components/home/BlogTeasers'
import { QuoteForm } from '@/components/home/QuoteForm'

export const metadata: Metadata = {
  title: 'The UAE Junction — Travel Deals with 4% Cashback',
  description:
    'Book theme parks, desert safari, dhow cruise, hotels & flights in the UAE. Get 4% cashback on every booking.',
}
export const revalidate = 3600

interface HomepageData {
  featuredProducts?: { nodes: WPProduct[] }
  productCategories?: { nodes: WPCategory[] }
}

// CMS-fed sections degrade gracefully: WooGraphQL / category data may not be
// present yet, so a failed query must NOT break the page or the build.
async function getHomepage(): Promise<HomepageData> {
  try {
    return await fetchGraphQL<HomepageData>(GET_HOMEPAGE, undefined, 3600)
  } catch {
    return {}
  }
}

async function getPosts(): Promise<WPPost[]> {
  try {
    const data = await fetchGraphQL<{ posts: { nodes: WPPost[] } }>(GET_POSTS, { first: 3 }, 3600)
    return data?.posts?.nodes ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [data, posts] = await Promise.all([getHomepage(), getPosts()])
  const products = data.featuredProducts?.nodes ?? []
  const categories = data.productCategories?.nodes ?? []
  return (
    <>
      <Hero />
      <PromotionsBanner />
      <StatsBand />
      <TravelerFavorites products={products} />
      <CategoryGrid categories={categories} />
      <MoreWaysToHaveFun />
      <WhyChooseUs />
      <CTABand />
      <Testimonials />
      <BlogTeasers posts={posts} />
      <QuoteForm />
    </>
  )
}

import type{Metadata}from'next'
import Link from'next/link'
import{fetchGraphQL}from'@/lib/graphql-client'
import{GET_POSTS}from'@/lib/queries/posts'
import type{WPPost}from'@/types/wordpress'
import{BlogIndex}from'@/components/blog/BlogIndex'

export const metadata:Metadata={
  title:'Travel Blog',
  description:'Travel tips, destination guides and the latest news from The UAE Junction — make the most of your trip to the Emirates.',
}
export const revalidate=3600

async function getPosts():Promise<WPPost[]>{
  try{
    const d=await fetchGraphQL<{posts?:{nodes:WPPost[]}}>(GET_POSTS,{first:24},3600)
    return d.posts?.nodes??[]
  }catch{return[]}
}

export default async function BlogIndexPage(){
  const posts=await getPosts()
  return(
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary-dark via-secondary to-neutral-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(11,184,166,0.28),transparent_45%)]"/>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_70%,rgba(255,255,255,0.10),transparent_40%)]"/>
        <div className="container-xl relative z-10 py-16 sm:py-20 max-w-3xl">
          <span className="inline-block pill bg-white/15 text-white mb-4">The UAE Junction Blog</span>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl mb-4 leading-tight">Stories, guides &amp; inspiration</h1>
          <p className="text-neutral-100 text-lg leading-relaxed">Plan an unforgettable trip across the Emirates with insider tips, destination guides and the latest from our team.</p>
        </div>
      </section>

      <section className="py-16 bg-neutral-50 min-h-[40vh]">
        <div className="container-xl">
          {posts.length===0?(
            <div className="text-center py-16">
              <p className="text-5xl mb-4">📝</p>
              <h2 className="font-display font-semibold text-xl text-neutral-800 mb-2">Stories are on the way</h2>
              <p className="text-neutral-500">We&rsquo;re putting together travel guides and tips. Check back soon — or <Link href="/contact-us" className="text-primary font-semibold hover:text-primary-dark">ask us anything</Link> in the meantime.</p>
            </div>
          ):(
            <BlogIndex posts={posts}/>
          )}
        </div>
      </section>
    </div>
  )
}

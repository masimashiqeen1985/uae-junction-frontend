import type{Metadata}from'next'
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
      {/* Hero — heroSky gradient + brand glow, matches homepage vibe */}
      <section className="relative overflow-hidden text-white" style={{background:'var(--g-heroSky)'}}>
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(11,184,166,0.35),transparent_45%)] animate-glow"/>
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_85%_70%,rgba(91,108,255,0.25),transparent_40%)]"/>
        <div aria-hidden className="absolute -top-10 right-[12%] w-40 h-40 rounded-full bg-white/10 blur-2xl animate-float"/>
        <div className="container-xl relative z-10 py-16 sm:py-24 max-w-3xl">
          <span className="pill glass text-white mb-5">✈️ The UAE Junction Blog</span>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-[1.1] mb-4">
            Stories, guides &amp; <span className="text-gradient-sunset">inspiration</span>
          </h1>
          <p className="text-white/85 text-lg leading-relaxed max-w-2xl">
            Plan an unforgettable trip across the Emirates with insider tips, destination guides and the latest from our team.
          </p>
        </div>
      </section>

      <section className="py-16 bg-[var(--c-bg)] min-h-[40vh]">
        <div className="container-xl">
          {posts.length===0?(
            <div className="text-center py-16">
              <p className="text-5xl mb-4">📝</p>
              <h2 className="font-display font-semibold text-xl text-ink mb-2">Stories are on the way</h2>
              <p className="text-neutral-500">We&rsquo;re writing fresh travel guides right now — check back soon.</p>
            </div>
          ):(
            <BlogIndex posts={posts}/>
          )}
        </div>
      </section>
    </div>
  )
}

import type{Metadata}from'next'
import Link from'next/link'
import{fetchGraphQL}from'@/lib/graphql-client'
import{GET_POSTS}from'@/lib/queries/posts'
import{WPImage}from'@/components/ui/WPImage'
import type{WPPost}from'@/types/wordpress'

export const metadata:Metadata={
  title:'Travel Blog',
  description:'Travel tips, destination guides and the latest news from The UAE Junction — make the most of your trip to the Emirates.',
}
export const revalidate=3600

function fmtDate(d:string){try{return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}catch{return''}}

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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,165,0,0.22),transparent_45%)]"/>
        <div className="container-xl relative z-10 py-16 max-w-3xl">
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl mb-4 leading-tight">The UAE Junction Blog</h1>
          <p className="text-neutral-100 text-lg leading-relaxed">Guides, tips and inspiration to help you plan an unforgettable trip across the Emirates.</p>
        </div>
      </section>

      <section className="py-16 bg-neutral-50 min-h-[40vh]">
        <div className="container-xl">
          {posts.length===0?(
            <div className="text-center py-16">
              <p className="text-5xl mb-4">📝</p>
              <h2 className="font-display font-semibold text-xl text-neutral-800 mb-2">Stories are on the way</h2>
              <p className="text-neutral-500">We’re putting together travel guides and tips. Check back soon — or <Link href="/contact-us" className="text-primary font-semibold hover:text-primary-dark">ask us anything</Link> in the meantime.</p>
            </div>
          ):(
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {posts.map(p=>(
                <Link key={p.id} href={`/blogs/${p.slug}`} className="group block bg-white rounded-card shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden">
                  <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
                    {p.featuredImage?.node?.sourceUrl
                      ?<WPImage image={p.featuredImage.node} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"/>
                      :<div className="w-full h-full flex items-center justify-center text-neutral-300 text-4xl">🌍</div>}
                  </div>
                  <div className="p-6">
                    {p.categories?.nodes?.[0]&&<span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-2">{p.categories.nodes[0].name}</span>}
                    <h2 className="font-display font-semibold text-lg text-neutral-800 leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">{p.title}</h2>
                    {p.date&&<p className="text-neutral-400 text-xs mb-3">{fmtDate(p.date)}</p>}
                    {p.excerpt&&<div className="text-neutral-500 text-sm leading-relaxed line-clamp-2" dangerouslySetInnerHTML={{__html:p.excerpt}}/>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

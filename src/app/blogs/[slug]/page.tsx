import type{Metadata}from'next'
import Link from'next/link'
import{notFound}from'next/navigation'
import{fetchGraphQL}from'@/lib/graphql-client'
import{GET_POST,GET_ALL_POST_SLUGS}from'@/lib/queries/posts'
import{WPImage}from'@/components/ui/WPImage'
import type{WPPost}from'@/types/wordpress'

interface Props{params:Promise<{slug:string}>}
// Build-time SSG + ISR. The blog LISTING (also build-time) successfully reads WPGraphQL,
// but request-time fetches from inside the container do NOT reach the public CMS URL
// (Docker hairpin/DNS). So posts are rendered at build and refreshed on each deploy /
// via on-demand revalidate. dynamicParams=false: only known slugs render, so a missing
// build-time fetch can never bake a per-request 404 for an unknown path.
export const revalidate=3600
export const dynamicParams=false

function fmtDate(d:string){try{return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}catch{return''}}

async function getPost(slug:string):Promise<WPPost|null>{
  try{
    const d=await fetchGraphQL<{post?:WPPost}>(GET_POST,{slug},3600)
    return d.post??null
  }catch{return null}
}

export async function generateStaticParams(){
  try{
    const d=await fetchGraphQL<{posts?:{nodes:{slug:string}[]}}>(GET_ALL_POST_SLUGS,undefined,3600)
    return(d.posts?.nodes??[]).map(n=>({slug:n.slug}))
  }catch{return[]}
}

export async function generateMetadata({params}:Props):Promise<Metadata>{
  const{slug}=await params
  const post=await getPost(slug)
  if(!post)return{title:'Article not found'}
  const desc=(post.excerpt??'').replace(/<[^>]+>/g,'').trim().slice(0,160)||undefined
  return{title:post.title,description:desc}
}

export default async function BlogPostPage({params}:Props){
  const{slug}=await params
  const post=await getPost(slug)
  if(!post)notFound()
  const cat=post.categories?.nodes?.[0]
  return(
    <article className="bg-white">
      <header className="relative overflow-hidden bg-gradient-to-br from-secondary-dark via-secondary to-neutral-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(255,165,0,0.2),transparent_45%)]"/>
        <div className="container-xl relative z-10 py-14 max-w-3xl">
          <Link href="/blogs" className="text-white/70 hover:text-white text-sm font-semibold">← Back to blog</Link>
          {cat&&<span className="block text-xs font-bold uppercase tracking-widest text-primary mt-5 mb-2">{cat.name}</span>}
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl leading-tight mb-4" dangerouslySetInnerHTML={{__html:post.title}}/>
          <p className="text-white/70 text-sm">{post.author?.node?.name&&<>By {post.author.node.name} · </>}{fmtDate(post.date)}</p>
        </div>
      </header>

      {post.featuredImage?.node?.sourceUrl&&(
        <div className="container-xl max-w-3xl -mt-8 relative z-10">
          <div className="relative aspect-[16/9] rounded-card overflow-hidden shadow-card-hover">
            <WPImage image={post.featuredImage.node} fill className="object-cover" sizes="(max-width:768px) 100vw,768px" priority/>
          </div>
        </div>
      )}

      <div className="container-xl max-w-3xl py-12">
        <div className="blog-content text-neutral-700 leading-relaxed" dangerouslySetInnerHTML={{__html:post.content??''}}/>
      </div>

      <section className="py-12 bg-primary">
        <div className="container-xl text-center">
          <h2 className="font-display font-bold text-2xl text-white mb-3">Inspired to travel?</h2>
          <p className="text-white/90 mb-6">Plan your trip with us and earn 4% cashback on every booking.</p>
          <Link href="/contact-us" className="inline-block bg-white text-primary font-bold px-8 py-3.5 rounded-btn hover:bg-neutral-100 transition-colors">Get a Free Quote</Link>
        </div>
      </section>
    </article>
  )
}

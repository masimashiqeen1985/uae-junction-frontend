import type{Metadata}from'next'
import Link from'next/link'
import{notFound}from'next/navigation'
import{fetchGraphQL}from'@/lib/graphql-client'
import{GET_POST,GET_POSTS,GET_ALL_POST_SLUGS}from'@/lib/queries/posts'
import{WPImage}from'@/components/ui/WPImage'
import{ReadingProgress}from'@/components/blog/ReadingProgress'
import{BlogShare}from'@/components/blog/BlogShare'
import type{WPPost}from'@/types/wordpress'

interface Props{params:Promise<{slug:string}>}
// ISR with on-demand fallback. generateStaticParams pre-renders known posts at build;
// dynamicParams=true lets any other (or build-time-missed) post render at request time.
// This is self-healing: if the CMS is briefly unreachable during a build, posts still
// resolve at request time instead of being frozen as a stale not-found page.
export const revalidate=3600
export const dynamicParams=true
export const dynamic = 'force-dynamic'

const SITE='https://www.theuaejunction.cloud'

function fmtDate(d:string){try{return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}catch{return''}}

function decodeEntities(s:string){
  return s
    .replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g,(_,n)=>String.fromCharCode(parseInt(n,16)))
    .replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&apos;/g,"'")
    .replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ')
    .replace(/&hellip;/g,'…').replace(/&rsquo;/g,'’').replace(/&lsquo;/g,'‘')
    .replace(/&rdquo;/g,'”').replace(/&ldquo;/g,'“').replace(/&ndash;/g,'–').replace(/&mdash;/g,'—')
}
function strip(html?:string){return decodeEntities((html??'').replace(/<[^>]+>/g,'')).trim()}
function readMins(content?:string){
  const words=strip(content).split(/\s+/).filter(Boolean).length
  return Math.max(1,Math.round(words/200))
}

async function getPost(slug:string):Promise<WPPost|null>{
  try{
    const d=await fetchGraphQL<{post?:WPPost}>(GET_POST,{slug},3600)
    return d.post??null
  }catch{return null}
}

async function getRelated(current:WPPost):Promise<WPPost[]>{
  try{
    const d=await fetchGraphQL<{posts?:{nodes:WPPost[]}}>(GET_POSTS,{first:24},3600)
    const all=(d.posts?.nodes??[]).filter(p=>p.slug!==current.slug)
    const cat=current.categories?.nodes?.[0]?.slug
    const same=cat?all.filter(p=>p.categories?.nodes.some(c=>c.slug===cat)):[]
    const fill=all.filter(p=>!same.includes(p))
    return[...same,...fill].slice(0,3)
  }catch{return[]}
}

// Intentionally pre-render NO posts at build. The Coolify build step does not have
// reliable access to the CMS (NEXT_PUBLIC_GRAPHQL_ENDPOINT is a runtime env; the build
// box also cannot always reach cms.theuaejunction.cloud). A failed build-time fetch
// would bake a stale not-found page that dynamicParams can never replace. Instead every
// post renders on-demand at request time (runtime CMS access IS reliable) and is then
// cached via ISR (see `revalidate` above). SEO is unaffected: ISR serves fully
// server-rendered HTML. GET_ALL_POST_SLUGS is kept imported for future sitemap use.
export function generateStaticParams():{slug:string}[]{return[]}
void GET_ALL_POST_SLUGS

export async function generateMetadata({params}:Props):Promise<Metadata>{
  const{slug}=await params
  const post=await getPost(slug)
  if(!post)return{title:'Article not found'}
  const desc=strip(post.excerpt).slice(0,160)||undefined
  const img=post.featuredImage?.node?.sourceUrl
  return{
    title:decodeEntities(post.title),
    description:desc,
    alternates:{canonical:`${SITE}/blogs/${post.slug}`},
    openGraph:{
      type:'article',
      title:decodeEntities(post.title),
      description:desc,
      url:`${SITE}/blogs/${post.slug}`,
      ...(img?{images:[{url:img}]}:{}),
    },
  }
}

export default async function BlogPostPage({params}:Props){
  const{slug}=await params
  const post=await getPost(slug)
  if(!post)notFound()
  const cat=post.categories?.nodes?.[0]
  const related=await getRelated(post)
  const title=decodeEntities(post.title)
  const mins=readMins(post.content)

  const jsonLd={
    '@context':'https://schema.org',
    '@type':'BlogPosting',
    headline:title,
    description:strip(post.excerpt).slice(0,300),
    datePublished:post.date,
    mainEntityOfPage:`${SITE}/blogs/${post.slug}`,
    ...(post.featuredImage?.node?.sourceUrl?{image:post.featuredImage.node.sourceUrl}:{}),
    author:{'@type':'Organization',name:post.author?.node?.name??'The UAE Junction',url:SITE},
    publisher:{'@type':'Organization',name:'The UAE Junction',url:SITE},
  }
  const breadcrumbLd={
    '@context':'https://schema.org',
    '@type':'BreadcrumbList',
    itemListElement:[
      {'@type':'ListItem',position:1,name:'Home',item:SITE},
      {'@type':'ListItem',position:2,name:'Blog',item:`${SITE}/blogs`},
      {'@type':'ListItem',position:3,name:title,item:`${SITE}/blogs/${post.slug}`},
    ],
  }

  return(
    <article className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(breadcrumbLd)}}/>
      <ReadingProgress/>

      {/* Hero — heroSky gradient + brand glow, on-vibe with the rest of the site */}
      <header className="relative overflow-hidden text-white" style={{background:'var(--g-heroSky)'}}>
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(11,184,166,0.30),transparent_45%)] animate-glow"/>
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_15%_80%,rgba(91,108,255,0.22),transparent_40%)]"/>
        <div className="container-xl relative z-10 pt-10 pb-16 max-w-3xl">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/60">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li aria-hidden>/</li>
              <li><Link href="/blogs" className="hover:text-white transition-colors">Blog</Link></li>
              <li aria-hidden>/</li>
              <li className="text-white/80 line-clamp-2 max-w-[60vw] sm:max-w-md" aria-current="page">{title}</li>
            </ol>
          </nav>
          {cat&&<span className="pill glass text-white mb-4">{cat.name}</span>}
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.12] mb-5">{title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/75">
            <span>By {post.author?.node?.name??'The UAE Junction'}</span>
            <span aria-hidden>·</span>
            <span>{fmtDate(post.date)}</span>
            <span className="pill glass text-white">⏱ {mins} min read</span>
          </div>
        </div>
      </header>

      {/* Featured image overlapping the hero */}
      {post.featuredImage?.node?.sourceUrl&&(
        <div className="container-xl max-w-3xl -mt-8 relative z-10">
          <div className="relative aspect-[16/9] rounded-card overflow-hidden shadow-card-hover shine">
            <WPImage image={post.featuredImage.node} fill className="object-cover" sizes="(max-width:768px) 100vw,768px" priority/>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="container-xl max-w-3xl py-12">
        <div className="blog-content text-neutral-700 leading-relaxed" dangerouslySetInnerHTML={{__html:post.content??''}}/>
        <div className="mt-12 pt-8 border-t border-neutral-100">
          <BlogShare title={title}/>
        </div>
      </div>

      {/* Related stories */}
      {related.length>0&&(
        <section className="py-14 bg-[var(--c-bg)]">
          <div className="container-xl">
            <span className="eyebrow">Keep exploring</span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-ink mt-2 mb-8">More stories you&rsquo;ll love</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {related.map(p=>(
                <Link key={p.id} href={`/blogs/${p.slug}`} className="group flex flex-col uj-card overflow-hidden focus-ring">
                  <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100 shine">
                    {p.featuredImage?.node?.sourceUrl
                      ?<WPImage image={p.featuredImage.node} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"/>
                      :<div className="w-full h-full shimmer flex items-center justify-center text-neutral-300 text-4xl">🌍</div>}
                    {p.categories?.nodes?.[0]&&<span className="absolute top-3 left-3 pill glass-light text-ink text-xs shadow-card">{p.categories.nodes[0].name}</span>}
                  </div>
                  <div className="flex flex-col flex-1 p-6">
                    <h3 className="font-display font-bold text-lg text-ink leading-snug mb-2 group-hover:text-primary-dark transition-colors line-clamp-2">{decodeEntities(p.title)}</h3>
                    <div className="mt-auto flex items-center justify-between text-xs text-neutral-400 pt-3 border-t border-neutral-100">
                      <span>{fmtDate(p.date)}</span>
                      <span className="inline-flex items-center gap-1 font-display font-bold text-primary-dark group-hover:gap-2 transition-all">Read <span aria-hidden>→</span></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA — brand gradient panel */}
      <section className="py-14 bg-white">
        <div className="container-xl">
          <div className="relative overflow-hidden rounded-card bg-brand text-white text-center px-6 py-12 sm:py-14 shadow-card-hover">
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.18),transparent_45%)]"/>
            <div className="relative z-10">
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl mb-3">Inspired to travel?</h2>
              <p className="text-white/90 mb-7 max-w-xl mx-auto">Plan your trip with us and earn 2.5% cashback on every booking.</p>
              <Link href="/contact-us" className="uj-btn bg-white text-primary-dark font-bold shine focus-ring">Get a Free Quote →</Link>
            </div>
          </div>
        </div>
      </section>
    </article>
  )
}

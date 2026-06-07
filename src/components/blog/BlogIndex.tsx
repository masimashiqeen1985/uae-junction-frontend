'use client'

import{useMemo,useState}from'react'
import Link from'next/link'
import{motion}from'framer-motion'
import{WPImage}from'@/components/ui/WPImage'
import type{WPPost}from'@/types/wordpress'

function fmtDate(d?:string){if(!d)return''
  try{return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}catch{return''}}

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

function readMins(p:WPPost){
  const words=strip(p.excerpt).split(/\s+/).filter(Boolean).length
  return Math.min(8,Math.max(3,Math.round(words/45)))// excerpt-based estimate, clamped 3-8 min
}

const clamp3:React.CSSProperties={display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden'}

export function BlogIndex({posts}:{posts:WPPost[]}){
  const[active,setActive]=useState<string>('all')

  const cats=useMemo(()=>{
    const m=new Map<string,string>()
    posts.forEach(p=>p.categories?.nodes.forEach(c=>m.set(c.slug,c.name)))
    return Array.from(m,([slug,name])=>({slug,name}))
  },[posts])

  const[featured,...rest]=posts

  const visible=useMemo(()=>active==='all'?rest:rest.filter(p=>p.categories?.nodes.some(c=>c.slug===active)),[rest,active])

  return(
    <>
      {/* Featured post — hero card on brand primitives */}
      {featured&&(
        <motion.article
          initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.4}}
          className="mb-14"
        >
          <Link href={`/blogs/${featured.slug}`} className="group grid md:grid-cols-2 uj-card overflow-hidden focus-ring">
            <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[360px] overflow-hidden bg-neutral-100 shine">
              {featured.featuredImage?.node?.sourceUrl
                ?<WPImage image={featured.featuredImage.node} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width:768px) 100vw,50vw" priority/>
                :<div className="w-full h-full shimmer flex items-center justify-center text-neutral-300 text-5xl">🌍</div>}
              <span className="absolute top-4 left-4 pill bg-brand text-white shadow-card">⭐ Featured</span>
            </div>
            <div className="flex flex-col justify-center p-6 md:p-8 lg:p-12">
              {featured.categories?.nodes?.[0]&&<span className="eyebrow mb-3">{featured.categories.nodes[0].name}</span>}
              <h2 className="font-display font-extrabold text-2xl lg:text-[2rem] text-ink leading-tight mb-3 group-hover:text-primary-dark transition-colors">{decodeEntities(featured.title)}</h2>
              <p className="text-neutral-500 leading-relaxed mb-4" style={clamp3}>{strip(featured.excerpt)}</p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-400">
                {featured.author?.node?.name&&<span>By {featured.author.node.name}</span>}
                <span>{fmtDate(featured.date)}</span>
                <span className="pill-cash pill">{readMins(featured)} min read</span>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 font-display font-bold text-brand group-hover:gap-3 transition-all">Read the story <span aria-hidden>→</span></span>
            </div>
          </Link>
        </motion.article>
      )}

      {/* Category filter */}
      {cats.length>0&&(
        <div className="flex flex-wrap gap-2.5 mb-10" role="group" aria-label="Filter articles by category">
          <button onClick={()=>setActive('all')} aria-pressed={active==='all'}
            className={`pill border-2 transition-all focus-ring ${active==='all'?'bg-brand border-transparent text-white shadow-card':'bg-white border-neutral-200 text-neutral-500 hover:border-primary hover:text-primary-dark'}`}>All stories</button>
          {cats.map(c=>(
            <button key={c.slug} onClick={()=>setActive(c.slug)} aria-pressed={active===c.slug}
              className={`pill border-2 transition-all focus-ring ${active===c.slug?'bg-brand border-transparent text-white shadow-card':'bg-white border-neutral-200 text-neutral-500 hover:border-primary hover:text-primary-dark'}`}>{c.name}</button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {visible.map((p,i)=>(
          <motion.div key={p.id}
            initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-40px'}}
            transition={{duration:0.35,delay:Math.min(i*0.05,0.3)}}>
            <Link href={`/blogs/${p.slug}`} className="group flex flex-col h-full uj-card overflow-hidden focus-ring">
              <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100 shine">
                {p.featuredImage?.node?.sourceUrl
                  ?<WPImage image={p.featuredImage.node} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"/>
                  :<div className="w-full h-full shimmer flex items-center justify-center text-neutral-300 text-4xl">🌍</div>}
                {p.categories?.nodes?.[0]&&<span className="absolute top-3 left-3 pill glass-light text-ink text-xs shadow-card">{p.categories.nodes[0].name}</span>}
              </div>
              <div className="flex flex-col flex-1 p-6">
                <h2 className="font-display font-bold text-lg text-ink leading-snug mb-2 group-hover:text-primary-dark transition-colors line-clamp-2">{decodeEntities(p.title)}</h2>
                <p className="text-neutral-500 text-sm leading-relaxed mb-4" style={clamp3}>{strip(p.excerpt)}</p>
                <div className="mt-auto flex items-center justify-between text-xs text-neutral-400 pt-3 border-t border-neutral-100">
                  <span>{fmtDate(p.date)}</span>
                  <span className="inline-flex items-center gap-1 font-display font-bold text-primary-dark group-hover:gap-2 transition-all">Read <span aria-hidden>→</span></span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {visible.length===0&&(
        <p className="text-center text-neutral-500 py-12">No articles in this category yet.</p>
      )}
    </>
  )
}

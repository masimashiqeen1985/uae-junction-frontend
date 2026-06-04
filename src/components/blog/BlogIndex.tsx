'use client'

import{useMemo,useState}from'react'
import Link from'next/link'
import{motion}from'framer-motion'
import{WPImage}from'@/components/ui/WPImage'
import type{WPPost}from'@/types/wordpress'

function fmtDate(d?:string){if(!d)return''
  try{return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}catch{return''}}

function strip(html?:string){return(html??'').replace(/<[^>]+>/g,'').trim()}

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
      {/* Featured post */}
      {featured&&(
        <motion.article
          initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.4}}
          className="mb-14"
        >
          <Link href={`/blogs/${featured.slug}`} className="group grid md:grid-cols-2 gap-6 lg:gap-10 bg-white rounded-card shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden">
            <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[340px] overflow-hidden bg-neutral-100">
              {featured.featuredImage?.node?.sourceUrl
                ?<WPImage image={featured.featuredImage.node} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:768px) 100vw,50vw" priority/>
                :<div className="w-full h-full flex items-center justify-center text-neutral-300 text-5xl">🌍</div>}
              <span className="absolute top-4 left-4 pill bg-primary text-white">Featured</span>
            </div>
            <div className="flex flex-col justify-center p-6 md:p-8 lg:pr-12">
              {featured.categories?.nodes?.[0]&&<span className="text-xs font-bold uppercase tracking-widest text-primary mb-3">{featured.categories.nodes[0].name}</span>}
              <h2 className="font-display font-extrabold text-2xl lg:text-3xl text-neutral-800 leading-tight mb-3 group-hover:text-primary transition-colors">{featured.title}</h2>
              {featured.excerpt&&<p className="text-neutral-500 leading-relaxed mb-4" style={clamp3}>{strip(featured.excerpt)}</p>}
              <div className="flex items-center gap-3 text-sm text-neutral-400">
                {featured.author?.node?.name&&<span>By {featured.author.node.name}</span>}
                <span>{fmtDate(featured.date)}</span>
              </div>
              <span className="mt-5 inline-flex items-center gap-1 font-display font-bold text-primary group-hover:gap-2 transition-all">Read article →</span>
            </div>
          </Link>
        </motion.article>
      )}

      {/* Category filter */}
      {cats.length>0&&(
        <div className="flex flex-wrap gap-2.5 mb-9">
          <button onClick={()=>setActive('all')} aria-pressed={active==='all'}
            className={`pill border-2 transition-all ${active==='all'?'bg-primary border-primary text-white':'bg-white border-neutral-200 text-neutral-500 hover:border-primary hover:text-primary'}`}>All</button>
          {cats.map(c=>(
            <button key={c.slug} onClick={()=>setActive(c.slug)} aria-pressed={active===c.slug}
              className={`pill border-2 transition-all ${active===c.slug?'bg-primary border-primary text-white':'bg-white border-neutral-200 text-neutral-500 hover:border-primary hover:text-primary'}`}>{c.name}</button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {visible.map((p,i)=>(
          <motion.div key={p.id}
            initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-40px'}}
            transition={{duration:0.35,delay:Math.min(i*0.05,0.3)}}>
            <Link href={`/blogs/${p.slug}`} className="group block h-full bg-white rounded-card shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden">
              <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
                {p.featuredImage?.node?.sourceUrl
                  ?<WPImage image={p.featuredImage.node} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"/>
                  :<div className="w-full h-full flex items-center justify-center text-neutral-300 text-4xl">🌍</div>}
              </div>
              <div className="p-6">
                {p.categories?.nodes?.[0]&&<span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-2">{p.categories.nodes[0].name}</span>}
                <h2 className="font-display font-semibold text-lg text-neutral-800 leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">{p.title}</h2>
                {p.date&&<p className="text-neutral-400 text-xs mb-3">{fmtDate(p.date)}</p>}
                {p.excerpt&&<p className="text-neutral-500 text-sm leading-relaxed line-clamp-2">{strip(p.excerpt)}</p>}
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

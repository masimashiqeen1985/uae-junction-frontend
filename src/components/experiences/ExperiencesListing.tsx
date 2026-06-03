'use client'
import{useMemo,useState,useCallback}from'react'
import{ProductCard}from'@/components/ui/ProductCard'
import{cn}from'@/lib/utils'
import type{WPProduct,WPCategory}from'@/types/wordpress'

const PAGE=12
type Sort='featured'|'price-asc'|'price-desc'|'name'
const SORTS:{value:Sort;label:string}[]=[
  {value:'featured',label:'Featured'},
  {value:'price-asc',label:'Price: Low to High'},
  {value:'price-desc',label:'Price: High to Low'},
  {value:'name',label:'Name: A–Z'},
]
const num=(p?:string)=>{const n=parseFloat((p??'').replace(/[^0-9.]/g,''));return isNaN(n)?0:n}
const priceOf=(p:WPProduct)=>num(p.salePrice||p.regularPrice||p.price)

export function ExperiencesListing({products,categories,initialCat=''}:{products:WPProduct[];categories:WPCategory[];initialCat?:string}){
  const[cat,setCat]=useState(initialCat)
  const[sort,setSort]=useState<Sort>('featured')
  const[visible,setVisible]=useState(PAGE)

  // Only show categories that actually have products
  const chips=useMemo(()=>categories.filter(c=>(c.count??0)>0),[categories])

  const syncUrl=useCallback((next:string)=>{
    if(typeof window==='undefined')return
    const url=new URL(window.location.href)
    if(next)url.searchParams.set('cat',next);else url.searchParams.delete('cat')
    window.history.replaceState(null,'',url.toString())
  },[])

  const selectCat=useCallback((slug:string)=>{setCat(slug);setVisible(PAGE);syncUrl(slug)},[syncUrl])

  const filtered=useMemo(()=>{
    let list=cat?products.filter(p=>p.productCategories?.nodes?.some(n=>n.slug===cat)):[...products]
    if(sort==='price-asc')list=[...list].sort((a,b)=>priceOf(a)-priceOf(b))
    else if(sort==='price-desc')list=[...list].sort((a,b)=>priceOf(b)-priceOf(a))
    else if(sort==='name')list=[...list].sort((a,b)=>a.name.localeCompare(b.name))
    return list
  },[products,cat,sort])

  const shown=filtered.slice(0,visible)

  return(
    <div className="container-xl py-10 sm:py-12">
      {/* Filter chips */}
      {chips.length>0&&(
        <div className="mb-6 -mx-1 overflow-x-auto" role="group" aria-label="Filter by category">
          <div className="flex gap-2 px-1 min-w-max">
            <button type="button" onClick={()=>selectCat('')} aria-pressed={cat===''}
              className={cn('px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border transition-colors min-h-[44px]',cat===''?'bg-secondary text-white border-secondary':'bg-white text-neutral-600 border-neutral-200 hover:border-secondary hover:text-secondary')}>
              All
            </button>
            {chips.map(c=>(
              <button key={c.id} type="button" onClick={()=>selectCat(c.slug)} aria-pressed={cat===c.slug}
                className={cn('px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border transition-colors min-h-[44px]',cat===c.slug?'bg-secondary text-white border-secondary':'bg-white text-neutral-600 border-neutral-200 hover:border-secondary hover:text-secondary')}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result count + sort */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <p className="text-sm text-neutral-500" aria-live="polite">{filtered.length} experience{filtered.length===1?'':'s'}</p>
        <label className="flex items-center gap-2 text-sm text-neutral-600">
          <span className="hidden sm:inline font-medium">Sort by</span>
          <select value={sort} onChange={e=>{setSort(e.target.value as Sort);setVisible(PAGE)}}
            className="border border-neutral-200 rounded-btn px-3 py-2 text-sm font-medium text-neutral-700 bg-white focus:outline-none focus:ring-2 focus:ring-secondary/40 min-h-[44px]">
            {SORTS.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
      </div>

      {/* Grid */}
      {shown.length>0?(
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {shown.map(p=><ProductCard key={p.id} product={p}/>)}
        </div>
      ):(
        <div className="text-center py-20">
          <p className="text-neutral-500 mb-4">No experiences found in this category yet.</p>
          {cat&&<button type="button" onClick={()=>selectCat('')} className="text-secondary font-semibold hover:text-secondary-dark">View all experiences →</button>}
        </div>
      )}

      {/* Load more */}
      {visible<filtered.length&&(
        <div className="text-center mt-10">
          <button type="button" onClick={()=>setVisible(v=>v+PAGE)}
            className="inline-flex items-center justify-center bg-white border-2 border-secondary text-secondary font-bold px-8 py-3 rounded-full hover:bg-secondary hover:text-white transition-colors min-h-[44px]">
            Load more ({filtered.length-visible} more)
          </button>
        </div>
      )}
    </div>
  )
}

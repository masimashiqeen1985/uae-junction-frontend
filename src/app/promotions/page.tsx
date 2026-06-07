import type{Metadata}from'next'
import Link from'next/link'
import{fetchGraphQL}from'@/lib/graphql-client'
import{GET_SUNDAY_PROMOTIONS,type SundayPromotionsData,type SundayDeal}from'@/lib/queries/promotions'
import{WPImage}from'@/components/ui/WPImage'
import{PromotionsClient}from'@/components/promotions/PromotionsClient'

export const metadata:Metadata={
  title:'Sunday Super Deals — Up to 70% Off | The UAE Junction',
  description:'Every Sunday, one hand-picked UAE experience at up to 70% off. Limited units, 1 per customer, plus 2.5% cashback on every booking.',
  alternates:{canonical:'https://theuaejunction.cloud/promotions'},
  openGraph:{title:'Sunday Super Deals — Up to 70% Off',description:'One product. Up to 70% off. Every Sunday. Limited units — 1 per customer.',url:'https://theuaejunction.cloud/promotions',type:'website'},
}
export const dynamic='force-dynamic'

const CMS='https://cms.theuaejunction.cloud'
const TZ_OFFSET='+04:00'

type ProductNode=NonNullable<SundayPromotionsData['products']>['nodes'][number]

function dubaiTodayISO():string{
  return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai'}).format(new Date())
}
function fmtDate(iso:string):string{
  return new Date(`${iso}T12:00:00${TZ_OFFSET}`).toLocaleDateString('en-GB',{timeZone:'Asia/Dubai',weekday:'short',day:'numeric',month:'short'})
}
function ordinalSunday(iso:string):string{
  const n=Math.ceil(Number(iso.slice(8,10))/7)
  return['1st','2nd','3rd','4th','5th'][n-1]??`${n}th`
}
function pctOff(d:SundayDeal):number{
  return d.originalPrice>0?Math.round((1-d.dealPrice/d.originalPrice)*100):0
}

async function getData():Promise<{data:SundayPromotionsData|null}>{
  try{
    // Two-step: first the deals (for ids), then products — single round trip is
    // not possible because ids come from the same query; WPGraphQL tolerates
    // include:[] so we fetch once with no ids, then again only if deals exist.
    const first=await fetchGraphQL<SundayPromotionsData>(GET_SUNDAY_PROMOTIONS,{ids:[]},false)
    const ids=(first.sundayPromotions?.deals??[]).map(d=>d.productId)
    if(!ids.length)return{data:first}
    const full=await fetchGraphQL<SundayPromotionsData>(GET_SUNDAY_PROMOTIONS,{ids},false)
    return{data:full}
  }catch{return{data:null}}
}

export default async function PromotionsPage(){
  const{data}=await getData()
  const promos=data?.sundayPromotions
  const deals=(promos?.deals??[]).slice().sort((a,b)=>a.dealDate.localeCompare(b.dealDate))
  const products=new Map<number,ProductNode>((data?.products?.nodes??[]).map(p=>[p.databaseId,p]))
  const today=dubaiTodayISO()
  const currentOrNext=deals.find(d=>d.dealDate>=today)??null
  const heroProduct=currentOrNext?products.get(currentOrNext.productId)??null:null
  const month=today.slice(0,7)
  const monthDeals=deals.filter(d=>d.dealDate.slice(0,7)===month)
  const nextMonthDeals=deals.filter(d=>d.dealDate.slice(0,7)>month)
  const heading=promos?.pageHeading||'Sunday Super Deal'
  const subheading=promos?.pageSubheading||'One product. Up to 70% off. Every Sunday.'
  const terms=promos?.termsText||'Limited units. 1 per customer. Valid Sunday 12:00 AM to 11:59 PM (UAE time) or while stock lasts.'

  const jsonLd={
    '@context':'https://schema.org','@type':'OfferCatalog',name:'Sunday Super Deals',
    url:'https://theuaejunction.cloud/promotions',
    itemListElement:deals.filter(d=>d.dealDate>=today).map(d=>{
      const p=products.get(d.productId)
      return{'@type':'Offer',name:p?.name??'Sunday Deal',price:d.dealPrice,priceCurrency:'AED',
        priceValidUntil:d.dealDate,availability:'https://schema.org/LimitedAvailability',
        url:p?`https://theuaejunction.cloud/product/${p.slug}`:'https://theuaejunction.cloud/promotions'}
    }),
  }

  return(
    <div className="bg-neutral-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>

      {/* HERO — countdown / live deal (client island) */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary-dark via-secondary to-neutral-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(255,176,32,0.25),transparent_45%)]" aria-hidden/>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_85%,rgba(255,90,95,0.18),transparent_40%)]" aria-hidden/>
        <div className="container-xl relative z-10 py-12 sm:py-16">
          <div className="max-w-3xl mb-8">
            <span className="inline-block bg-coral text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">Every Sunday · Limited Units</span>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-tight mb-3">{heading}</h1>
            <p className="text-neutral-100 text-lg leading-relaxed">{subheading}</p>
          </div>
          {currentOrNext&&heroProduct?(
            <PromotionsClient
              deal={currentOrNext}
              product={{databaseId:heroProduct.databaseId,slug:heroProduct.slug,name:heroProduct.name,image:heroProduct.image?{sourceUrl:heroProduct.image.sourceUrl,altText:heroProduct.image.altText??heroProduct.name}:null}}
              cmsBase={CMS}
              discountPct={pctOff(currentOrNext)}
            />
          ):(
            <div className="rounded-card bg-white/10 backdrop-blur border border-white/15 p-8 sm:p-12 text-center max-w-2xl">
              <p className="font-display font-bold text-2xl mb-2">Next deal announced soon</p>
              <p className="text-neutral-200">Our team is hand-picking the next Sunday Super Deal. Check back shortly — or explore today&apos;s <Link href="/experiences" className="underline font-semibold text-amber">experiences</Link>.</p>
            </div>
          )}
          <p className="mt-6 text-xs text-neutral-300 max-w-2xl">{terms}</p>
        </div>
      </section>

      {/* MONTH CALENDAR */}
      <section className="py-14 sm:py-16">
        <div className="container-xl">
          <p className="eyebrow mb-2">Plan your Sundays</p>
          <h2 className="font-display font-bold text-3xl text-ink mb-8">This Month&apos;s Sunday Deals</h2>
          {monthDeals.length===0?(
            <p className="text-neutral-500">This month&apos;s line-up is being finalised — first deal announced soon.</p>
          ):(
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {monthDeals.map(d=>{
                const p=products.get(d.productId)
                const past=d.dealDate<today
                const live=d.dealDate===today
                return(
                  <div key={d.dealDate} className={`group relative bg-white rounded-card shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden ${past?'opacity-55 saturate-50':''} ${live?'ring-2 ring-coral':''}`}>
                    {p&&<Link href={`/product/${p.slug}`} aria-label={p.name} className="absolute inset-0 z-[1] rounded-card focus-ring"/>}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {p?.image?<WPImage image={{sourceUrl:p.image.sourceUrl,altText:p.image.altText??p.name,mediaDetails:{width:p.image.mediaDetails?.width??800,height:p.image.mediaDetails?.height??600}}} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:1024px) 50vw,25vw"/>:<div className="w-full h-full bg-neutral-100"/>}
                      <span className={`absolute top-2.5 left-2.5 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${live?'bg-coral text-white animate-pulse':past?'bg-neutral-600 text-white':'bg-ink/80 text-white'}`}>
                        {live?'LIVE NOW':past?'Done ✓':`${ordinalSunday(d.dealDate)} Sunday · ${fmtDate(d.dealDate)}`}
                      </span>
                      {pctOff(d)>0&&<span className="absolute top-2.5 right-2.5 bg-amber text-ink text-[11px] font-extrabold px-2 py-1 rounded-full">−{pctOff(d)}%</span>}
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-bold text-sm sm:text-base text-ink leading-snug mb-2 line-clamp-2">{p?.name??'Sunday Deal'}</h3>
                      <p className="flex items-baseline gap-2">
                        <span className="text-neutral-400 line-through text-sm">AED {d.originalPrice}</span>
                        <span className="text-coral font-extrabold text-lg">AED {d.dealPrice}</span>
                      </p>
                      {d.heroBlurb&&<p className="text-neutral-500 text-xs mt-1.5 line-clamp-1">{d.heroBlurb}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {nextMonthDeals.length>0&&(
            <div className="mt-12">
              <h3 className="font-display font-bold text-xl text-ink mb-5">Next month preview</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {nextMonthDeals.slice(0,4).map(d=>{
                  const p=products.get(d.productId)
                  return(
                    <div key={d.dealDate} className="bg-white rounded-card shadow-card p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-secondary mb-1">{fmtDate(d.dealDate)}</p>
                      <p className="font-display font-bold text-sm text-ink leading-snug mb-1.5 line-clamp-2">{p?.name??'To be announced'}</p>
                      <p className="flex items-baseline gap-2"><span className="text-neutral-400 line-through text-xs">AED {d.originalPrice}</span><span className="text-coral font-extrabold">AED {d.dealPrice}</span></p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* VALUE BAND */}
      <section className="pb-16">
        <div className="container-xl">
          <div className="rounded-card bg-gradient-to-r from-primary to-secondary text-white p-7 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <h2 className="font-display font-bold text-2xl mb-1.5">Fair for everyone, every week</h2>
              <p className="text-white/90 text-sm sm:text-base">Limited units per deal · 1 per customer · instant e-tickets · 2.5% cashback on every booking.</p>
            </div>
            <Link href="/experiences" className="shrink-0 bg-white text-ink font-semibold px-6 py-3 rounded-btn hover:bg-neutral-100 transition-colors">Browse all experiences</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

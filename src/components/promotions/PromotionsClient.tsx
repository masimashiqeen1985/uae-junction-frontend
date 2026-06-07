'use client'
// Sunday Super Deal hero — countdown ring (anti-clockwise), 20%-step stock bar,
// guest-friendly buy CTA, notify-me capture, real-sale social proof.
// All enforcement is server-side (uaej-sunday-deal plugin); this UI is honest:
// it only renders what the status endpoint reports.
import{useCallback,useEffect,useMemo,useRef,useState}from'react'
import Link from'next/link'
import Image from'next/image'
import{useRouter}from'next/navigation'
import type{SundayDeal,DealStatus}from'@/lib/queries/promotions'

interface HeroProduct{databaseId:number;slug:string;name:string;image:{sourceUrl:string;altText:string}|null}
interface Props{deal:SundayDeal;product:HeroProduct;cmsBase:string;discountPct:number}

const DAY=86400000

/** Sunday window in epoch ms (UTC) for a Y-m-d date in Asia/Dubai (+04:00, no DST). */
function windowFor(dealDate:string){
  const start=Date.parse(`${dealDate}T00:00:00+04:00`)
  return{start,end:start+DAY-1000}
}
function split(ms:number){
  const s=Math.max(0,Math.floor(ms/1000))
  return{d:Math.floor(s/86400),h:Math.floor(s/3600)%24,m:Math.floor(s/60)%60,s:s%60}
}
const pad=(n:number)=>String(n).padStart(2,'0')

export function PromotionsClient({deal,product,cmsBase,discountPct}:Props){
  const router=useRouter()
  const{start,end}=useMemo(()=>windowFor(deal.dealDate),[deal.dealDate])
  // Server-time drift correction: status.now (CMS clock) vs local clock.
  const driftRef=useRef(0)
  const[nowMs,setNowMs]=useState(()=>Date.now())
  const[status,setStatus]=useState<DealStatus|null>(null)
  const[buying,setBuying]=useState(false)
  const[buyError,setBuyError]=useState<string|null>(null)
  const[celebrate,setCelebrate]=useState(false)
  const[toast,setToast]=useState<string|null>(null)
  const[email,setEmail]=useState('')
  const[notifyState,setNotifyState]=useState<'idle'|'busy'|'done'|'error'>('idle')
  const lastSaleRef=useRef<string|null>(null)
  const reducedMotion=useRef(false)

  useEffect(()=>{
    reducedMotion.current=window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },[])

  // 1s clock
  useEffect(()=>{
    const t=setInterval(()=>setNowMs(Date.now()+driftRef.current),1000)
    return()=>clearInterval(t)
  },[])

  // Status poll: 60s while live, on focus, once on mount.
  const poll=useCallback(async()=>{
    try{
      const r=await fetch(`${cmsBase}/wp-json/uaej/v1/sunday-deal/status`,{cache:'no-store'})
      if(!r.ok)return
      const s=(await r.json())as DealStatus
      driftRef.current=Date.parse(s.now)-Date.now()
      setStatus(s)
      if(s.active&&s.last_sale_at&&lastSaleRef.current&&s.last_sale_at!==lastSaleRef.current){
        setToast(`Someone${s.last_city?` in ${s.last_city}`:''} just grabbed this deal`)
        setTimeout(()=>setToast(null),5000)
      }
      if(s.last_sale_at)lastSaleRef.current=s.last_sale_at
    }catch{/* endpoint hiccup — keep last known state */}
  },[cmsBase])
  useEffect(()=>{
    void poll()
    const t=setInterval(()=>{void poll()},60000)
    const onFocus=()=>{void poll()}
    window.addEventListener('focus',onFocus)
    return()=>{clearInterval(t);window.removeEventListener('focus',onFocus)}
  },[poll])

  const live=nowMs>=start&&nowMs<=end&&!!status?.active
  const soldOut=live&&(status?.sold_out===true||status?.pct_left===0)
  const target=live?end:start
  const remaining=split(target-nowMs)
  // Ring progress: countdown phase = fraction of the wait week elapsed;
  // live phase = fraction of Sunday remaining. Anti-clockwise via scaleX(-1).
  const span=live?DAY:7*DAY
  const frac=Math.min(1,Math.max(0,(target-nowMs)/span))
  const R=84,C=2*Math.PI*R
  const pctLeft=soldOut?0:(status?.pct_left??100)

  const buy=useCallback(async()=>{
    setBuying(true);setBuyError(null)
    try{
      const res=await fetch('/api/cart',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'addDeal',productId:product.databaseId})})
      const j=await res.json().catch(()=>({}))
      if(!res.ok)throw new Error((j as{error?:string})?.error||'Could not add the deal — please try again.')
      if(!reducedMotion.current){setCelebrate(true);setTimeout(()=>setCelebrate(false),1400)}
      setTimeout(()=>router.push('/cart'),reducedMotion.current?0:700)
    }catch(e){
      setBuyError(e instanceof Error?e.message:'Could not add the deal — please try again.')
      void poll()
    }finally{setBuying(false)}
  },[product.databaseId,router,poll])

  const notify=useCallback(async(ev:React.FormEvent)=>{
    ev.preventDefault()
    if(!email)return
    setNotifyState('busy')
    try{
      const r=await fetch(`${cmsBase}/wp-json/uaej/v1/sunday-deal/notify`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})})
      if(!r.ok)throw new Error()
      setNotifyState('done')
    }catch{setNotifyState('error')}
  },[email,cmsBase])

  const savings=Math.max(0,deal.originalPrice-deal.dealPrice)

  return(
    <div className="relative">
      {/* social-proof toast (real events only) */}
      <div aria-live="polite" className="pointer-events-none fixed left-1/2 -translate-x-1/2 top-20 z-50">
        {toast&&<div className="bg-ink text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-card-hover animate-[fadeSlide_.4s_ease]">{toast} 🎉</div>}
      </div>

      <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center rounded-card bg-white/10 backdrop-blur border border-white/15 p-6 sm:p-10">
        {/* LEFT: product + price + CTA */}
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="relative w-full sm:w-56 aspect-[4/3] shrink-0 rounded-card overflow-hidden bg-white/10">
            {product.image&&<Image src={product.image.sourceUrl} alt={product.image.altText} fill priority className="object-cover" sizes="(max-width:640px) 100vw,224px"/>}
            {discountPct>0&&<span className="absolute top-2.5 left-2.5 bg-coral text-white text-xs font-extrabold px-2.5 py-1 rounded-full">−{discountPct}%</span>}
          </div>
          <div className="min-w-0">
            <p className="text-amber text-xs font-bold uppercase tracking-widest mb-1.5">{live?'LIVE NOW — ends tonight':`${new Date(start).toLocaleDateString('en-GB',{timeZone:'Asia/Dubai',weekday:'long',day:'numeric',month:'long'})}`}</p>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl leading-tight mb-2">
              <Link href={`/product/${product.slug}`} className="hover:underline">{product.name}</Link>
            </h2>
            {deal.heroBlurb&&<p className="text-neutral-200 text-sm mb-3">{deal.heroBlurb}</p>}
            <p className="flex items-baseline gap-3 mb-1">
              <span className="text-neutral-300 line-through text-lg">AED {deal.originalPrice}</span>
              <span className="text-amber font-display font-extrabold text-4xl">AED {deal.dealPrice}</span>
            </p>
            {savings>0&&<p className="text-primary-light font-bold text-sm mb-4">You save AED {savings}</p>}

            {/* stock bar — smooth gradient, 20% steps, count never shown */}
            <div className="max-w-sm mb-5">
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-wide text-neutral-200 mb-1.5">
                <span id="stock-label">{soldOut?'Sold out':live?`${pctLeft}% stock left`:'Stock reserved for Sunday'}</span>
                <span>1 per customer</span>
              </div>
              <div role="progressbar" aria-labelledby="stock-label" aria-valuenow={live?pctLeft:100} aria-valuemin={0} aria-valuemax={100}
                className="h-3 rounded-full bg-white/15 overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r from-coral via-amber to-amber transition-[width] duration-700 ${live&&pctLeft<=40&&!soldOut?'animate-pulse':''} ${soldOut?'grayscale':''}`}
                  style={{width:`${live?pctLeft:100}%`}}/>
              </div>
            </div>

            {live?(
              soldOut?(
                <div>
                  <p className="font-display font-bold text-xl text-white mb-1">SOLD OUT — see next Sunday ↓</p>
                  <p className="text-neutral-300 text-sm">Five lucky travellers were quicker this week.</p>
                </div>
              ):(
                <div>
                  <button onClick={()=>{void buy()}} disabled={buying}
                    className="relative bg-coral hover:bg-[#e84a4f] disabled:opacity-60 text-white font-display font-bold text-lg px-8 py-3.5 rounded-btn shadow-card-hover transition-colors focus-ring">
                    {buying?'Adding…':`Grab the Deal — AED ${deal.dealPrice}`}
                    {celebrate&&<span aria-hidden className="confetti-burst"/>}
                  </button>
                  {buyError&&<p role="alert" className="text-amber text-sm font-medium mt-2">{buyError}</p>}
                  <p className="text-neutral-300 text-xs mt-2.5">Instant e-ticket · 2.5% cashback · 1 per customer — fair for all</p>
                </div>
              )
            ):(
              <div className="max-w-sm">
                <p className="text-white/90 text-sm font-semibold mb-2">Deal opens Sunday 12:00 AM (UAE)</p>
                {notifyState==='done'?(
                  <p className="text-primary-light font-semibold text-sm">You&apos;re on the list — see you Sunday! ✓</p>
                ):(
                  <form onSubmit={notify} className="flex gap-2">
                    <label htmlFor="deal-email" className="sr-only">Email for Sunday deal reminder</label>
                    <input id="deal-email" type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                      placeholder="Email me Sunday deal reminders"
                      className="flex-1 min-w-0 rounded-btn px-4 py-2.5 text-sm text-ink bg-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber"/>
                    <button type="submit" disabled={notifyState==='busy'}
                      className="shrink-0 bg-amber text-ink font-bold text-sm px-5 py-2.5 rounded-btn hover:bg-amber-dark transition-colors disabled:opacity-60 focus-ring">
                      {notifyState==='busy'?'…':'Notify me'}
                    </button>
                  </form>
                )}
                {notifyState==='error'&&<p role="alert" className="text-amber text-xs mt-1.5">Could not save your email — please try again.</p>}
                <p className="text-neutral-400 text-[11px] mt-1.5">One reminder per week. Unsubscribe anytime.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: anti-clockwise countdown ring */}
        <div className="justify-self-center" aria-live="off">
          <div className="relative w-52 h-52 sm:w-60 sm:h-60">
            <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90 scale-x-[-1]" aria-hidden>
              <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10"/>
              <circle cx="100" cy="100" r={R} fill="none" stroke={live?'#ff5a5f':'#ffb020'} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={C*(1-frac)} style={{transition:'stroke-dashoffset 1s linear'}}/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-200 mb-1">{live?'Deal ends in':'Deal opens in'}</p>
              <p className="font-display font-extrabold text-2xl sm:text-3xl tabular-nums" suppressHydrationWarning>
                {remaining.d>0?`${pad(remaining.d)}:`:''}{pad(remaining.h)}:{pad(remaining.m)}:{pad(remaining.s)}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-neutral-300 mt-1">{remaining.d>0?'days · hrs · min · sec':'hrs · min · sec'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* sticky mobile CTA while live */}
      {live&&!soldOut&&(
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-ink/95 backdrop-blur border-t border-white/10">
          <button onClick={()=>{void buy()}} disabled={buying}
            className="w-full bg-coral text-white font-display font-bold text-lg py-3.5 rounded-btn disabled:opacity-60 focus-ring">
            {buying?'Adding…':`Grab the Deal — AED ${deal.dealPrice}`}
          </button>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeSlide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes confettiPop{0%{box-shadow:0 0 0 0 rgba(255,176,32,.9),0 0 0 0 rgba(255,90,95,.9),0 0 0 0 rgba(11,184,166,.9)}100%{box-shadow:-60px -50px 0 6px rgba(255,176,32,0),60px -55px 0 6px rgba(255,90,95,0),0 -70px 0 6px rgba(11,184,166,0)}}
        .confetti-burst{position:absolute;left:50%;top:0;width:6px;height:6px;border-radius:9999px;animation:confettiPop 1.2s ease-out forwards}
        @media (prefers-reduced-motion: reduce){.confetti-burst{animation:none}}
      `}</style>
    </div>
  )
}

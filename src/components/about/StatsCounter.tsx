'use client'
import{useEffect,useRef,useState}from'react'

export interface Stat{value:number;suffix?:string;prefix?:string;label:string;static?:string}

function useCountUp(target:number,run:boolean,ms=1600){
  const[n,setN]=useState(0)
  useEffect(()=>{
    if(!run)return
    if(typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches){setN(target);return}
    let raf=0;const start=performance.now()
    const tick=(t:number)=>{
      const p=Math.min((t-start)/ms,1)
      const eased=1-Math.pow(1-p,3)
      setN(Math.round(eased*target))
      if(p<1)raf=requestAnimationFrame(tick)
    }
    raf=requestAnimationFrame(tick)
    return()=>cancelAnimationFrame(raf)
  },[target,run,ms])
  return n
}

function StatItem({stat,run}:{stat:Stat;run:boolean}){
  const n=useCountUp(stat.value,run)
  return(
    <div>
      <p className="font-display font-extrabold text-4xl sm:text-5xl text-primary mb-1 tabular-nums">
        {stat.static??`${stat.prefix??''}${n.toLocaleString()}${stat.suffix??''}`}
      </p>
      <p className="text-white/80 text-sm sm:text-base">{stat.label}</p>
    </div>
  )
}

export function StatsCounter({stats}:{stats:Stat[]}){
  const ref=useRef<HTMLDivElement>(null)
  const[run,setRun]=useState(false)
  useEffect(()=>{
    const el=ref.current;if(!el)return
    const io=new IntersectionObserver((es)=>{es.forEach(e=>{if(e.isIntersecting){setRun(true);io.disconnect()}})},{threshold:0.3})
    io.observe(el)
    return()=>io.disconnect()
  },[])
  return(
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      {stats.map(s=><StatItem key={s.label} stat={s} run={run}/>)}
    </div>
  )
}

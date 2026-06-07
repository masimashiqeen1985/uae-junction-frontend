'use client'

import{useEffect,useState}from'react'

/** Slim fixed reading-progress bar using the global brand gradient. */
export function ReadingProgress(){
  const[p,setP]=useState(0)
  useEffect(()=>{
    let raf=0
    const onScroll=()=>{
      cancelAnimationFrame(raf)
      raf=requestAnimationFrame(()=>{
        const h=document.documentElement
        const max=h.scrollHeight-h.clientHeight
        setP(max>0?Math.min(100,(h.scrollTop/max)*100):0)
      })
    }
    onScroll()
    window.addEventListener('scroll',onScroll,{passive:true})
    return()=>{window.removeEventListener('scroll',onScroll);cancelAnimationFrame(raf)}
  },[])
  return(
    <div aria-hidden="true" className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent pointer-events-none">
      <div className="h-full bg-brand transition-[width] duration-100 ease-out" style={{width:`${p}%`}}/>
    </div>
  )
}

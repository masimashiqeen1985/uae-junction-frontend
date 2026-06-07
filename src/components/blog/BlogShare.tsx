'use client'

import{useState}from'react'

/** Share row for blog posts — copy link, WhatsApp, X. Matches site pill/btn primitives. */
export function BlogShare({title}:{title:string}){
  const[copied,setCopied]=useState(false)
  const url=typeof window!=='undefined'?window.location.href.split('?')[0]:''
  const enc=encodeURIComponent
  const copy=async()=>{
    try{
      await navigator.clipboard.writeText(`${url}?utm_source=copy_link&utm_medium=social_share`)
      setCopied(true)
      setTimeout(()=>setCopied(false),2000)
    }catch{/* clipboard unavailable */}
  }
  const cls='pill border-2 bg-white border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary-dark transition-all focus-ring'
  return(
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="eyebrow mr-1">Share</span>
      <button type="button" onClick={copy} className={cls} aria-label="Copy article link">
        {copied?'✓ Copied':'🔗 Copy link'}
      </button>
      <a className={cls} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp"
        href={`https://wa.me/?text=${enc(title)}%20${enc(url)}`}>WhatsApp</a>
      <a className={cls} target="_blank" rel="noopener noreferrer" aria-label="Share on X"
        href={`https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`}>X</a>
      <a className={cls} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook"
        href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`}>Facebook</a>
    </div>
  )
}

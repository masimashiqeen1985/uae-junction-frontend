'use client'
import{useState,useId}from'react'

export interface FaqItem{question:string;answer:string}

// Accessible accordion. Each header is a <button> toggling aria-expanded and
// controlling its panel via aria-controls/id. Keyboard + screen-reader friendly.
export function FaqAccordion({items}:{items:FaqItem[]}){
  const[open,setOpen]=useState<number|null>(0)
  const baseId=useId()
  return(
    <div className="divide-y divide-neutral-200 rounded-card border border-neutral-200 bg-white shadow-card overflow-hidden">
      {items.map((it,i)=>{
        const expanded=open===i
        const btnId=`${baseId}-b-${i}`
        const panelId=`${baseId}-p-${i}`
        return(
          <div key={i}>
            <h3 className="m-0">
              <button
                id={btnId}
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={()=>setOpen(expanded?null:i)}
                className="w-full flex items-center justify-between gap-4 text-left px-6 py-5 font-display font-semibold text-neutral-800 hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span>{it.question}</span>
                <span aria-hidden="true" className={`shrink-0 text-primary text-xl transition-transform duration-300 ${expanded?'rotate-45':''}`}>+</span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              hidden={!expanded}
              className="px-6 pb-5 -mt-1 text-neutral-600 leading-relaxed"
            >
              {it.answer}
            </div>
          </div>
        )
      })}
    </div>
  )
}

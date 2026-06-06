import{clsx,type ClassValue}from 'clsx'
import{twMerge}from 'tailwind-merge'
export const cn=(...i:ClassValue[])=>twMerge(clsx(i))
// AED fix (2026-06-06): Woo now returns "د.إ259.00" — the old regex kept the
// dot inside "د.إ" producing ".259.00". Strip symbols, then any leading
// separators left behind by the currency symbol.
export const formatPrice=(p?:string)=>p?.replace(/<[^>]+>/g,'').replace(/[^\d.,]/g,'').replace(/^[.,]+/,'').trim()??''
export const formatDate=(d:string)=>new Date(d).toLocaleDateString('en-AE',{year:'numeric',month:'long',day:'numeric'})
export const stripHtml=(h:string)=>h.replace(/<[^>]+>/g,'')
export const truncate=(s:string,n:number)=>s.length<=n?s:s.slice(0,n)+'...'

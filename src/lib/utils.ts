import{clsx,type ClassValue}from 'clsx'
import{twMerge}from 'tailwind-merge'
export const cn=(...i:ClassValue[])=>twMerge(clsx(i))
export const formatPrice=(p?:string)=>p?.replace(/<[^>]+>/g,'').replace(/[^\d.,]/g,'').trim()??''
export const formatDate=(d:string)=>new Date(d).toLocaleDateString('en-AE',{year:'numeric',month:'long',day:'numeric'})
export const stripHtml=(h:string)=>h.replace(/<[^>]+>/g,'')
export const truncate=(s:string,n:number)=>s.length<=n?s:s.slice(0,n)+'...'

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

// --- Booking date helpers (travel/visit date on PDP) -------------------------
// Work on plain YYYY-MM-DD strings only — never Date math across timezones.
// "Today" is resolved in the store's timezone (Asia/Dubai) so the earliest
// selectable date (tomorrow) is correct for UAE customers regardless of the
// visitor's locale.
const _DUBAI_TODAY_PARTS=()=>{const f=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit'});const[y,m,d]=f.format(new Date()).split('-').map(Number);return{y,m,d}}
const _toUTC=(y:number,m:number,d:number)=>Date.UTC(y,m-1,d)
const _fromUTC=(ms:number)=>{const dt=new Date(ms);return{y:dt.getUTCFullYear(),m:dt.getUTCMonth()+1,d:dt.getUTCDate()}}
export const pad2=(n:number)=>String(n).padStart(2,'0')
export const isoOf=(y:number,m:number,d:number)=>`${y}-${pad2(m)}-${pad2(d)}`
/** Earliest selectable travel date = tomorrow in Asia/Dubai, as YYYY-MM-DD. */
export const minBookingDate=()=>{const{y,m,d}=_DUBAI_TODAY_PARTS();const t=_fromUTC(_toUTC(y,m,d)+86400000);return isoOf(t.y,t.m,t.d)}
/** Latest selectable travel date = +12 months from today (Asia/Dubai). */
export const maxBookingDate=()=>{const{y,m,d}=_DUBAI_TODAY_PARTS();return isoOf(y+1,m,d)}
/** True when iso is a valid YYYY-MM-DD within [min,max]. */
export const isValidBookingDate=(iso:string)=>!!iso&&/^\d{4}-\d{2}-\d{2}$/.test(iso)&&iso>=minBookingDate()&&iso<=maxBookingDate()
/** Display form e.g. "Sat, 14 Jun 2026" from a YYYY-MM-DD string. */
export const formatBookingDate=(iso:string)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(iso))return iso;const[y,m,d]=iso.split('-').map(Number);return new Intl.DateTimeFormat('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'}).format(new Date(Date.UTC(y,m-1,d)))}

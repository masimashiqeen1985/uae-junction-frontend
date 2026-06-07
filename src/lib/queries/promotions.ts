// Sunday Super Deal — CMS data for /promotions.
// sundayPromotions is registered by the uaej-sunday-deal plugin (read-only).
const MEDIA_FIELDS='sourceUrl altText mediaDetails{width height}'

export const GET_SUNDAY_PROMOTIONS=`query SundayPromotions($ids:[Int]){
  sundayPromotions{pageHeading pageSubheading termsText deals{dealDate productId dealPrice originalPrice discountLabel heroBlurb}}
  products(first:20,where:{include:$ids}){nodes{id databaseId slug name shortDescription image{${MEDIA_FIELDS}} ... on SimpleProduct{regularPrice price}}}
}`

export interface SundayDeal{dealDate:string;productId:number;dealPrice:number;originalPrice:number;discountLabel?:string|null;heroBlurb?:string|null}
export interface SundayPromotionsData{
  sundayPromotions:{pageHeading?:string|null;pageSubheading?:string|null;termsText?:string|null;deals?:SundayDeal[]|null}|null
  products:{nodes:Array<{id:string;databaseId:number;slug:string;name:string;shortDescription?:string|null;image?:{sourceUrl:string;altText?:string|null;mediaDetails?:{width:number;height:number}|null}|null;regularPrice?:string|null;price?:string|null}>}|null
}

export interface DealStatus{
  now:string;active:boolean;product_id?:number;deal_date?:string;deal_price?:number;
  pct_left?:number;sold_out?:boolean;window_end?:string;window_start?:string;
  next_deal_date?:string;next_product_id?:number;last_sale_at?:string|null;last_city?:string|null
}

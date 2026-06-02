import type{MetadataRoute}from'next'
const B='https://theuaejunction.cloud'
const now=new Date()
function e(path:string,changeFrequency:MetadataRoute.Sitemap[number]['changeFrequency'],priority:number):MetadataRoute.Sitemap[number]{
  return{url:B+path,lastModified:now,changeFrequency,priority}
}
export default function sitemap():MetadataRoute.Sitemap{
  return[
    e('','daily',1),
    e('/services','weekly',0.9),
    e('/theme-parks','weekly',0.9),
    e('/water-parks','weekly',0.9),
    e('/desert-safari','weekly',0.9),
    e('/dhow-cruise','weekly',0.9),
    e('/uae-city-tours','weekly',0.8),
    e('/flight-booking','weekly',0.8),
    e('/hotel-booking','weekly',0.8),
    e('/umrah-packages','weekly',0.8),
    e('/experiences','weekly',0.8),
    e('/group-corporate-bookings','monthly',0.7),
    e('/promotions','weekly',0.8),
    e('/about-us','monthly',0.8),
    e('/contact-us','monthly',0.6),
    e('/faq','monthly',0.7),
    e('/industries','monthly',0.5),
    e('/case-studies','monthly',0.5),
    e('/blogs','daily',0.7),
    e('/careers','monthly',0.5),
    e('/privacy-policy','yearly',0.3),
    e('/terms-and-conditions','yearly',0.3),
    e('/rewards-policy','yearly',0.3),
  ]
}

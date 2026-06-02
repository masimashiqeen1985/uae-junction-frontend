import type{Metadata}from'next'
import{CmsLegalPage}from'@/components/sections/CmsLegalPage'
export const metadata:Metadata={title:'Rewards Policy',description:'How the 4% cashback rewards programme works at The UAE Junction.',alternates:{canonical:'https://theuaejunction.cloud/rewards-policy'}}
export const revalidate=3600
export default function Page(){return<CmsLegalPage title="Rewards Policy" uri="/rewards-policy/" fallback="Full details of our 4% cashback rewards programme are being finalised. Contact us to learn how cashback works."/>}

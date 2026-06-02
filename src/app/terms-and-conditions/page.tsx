import type{Metadata}from'next'
import{CmsLegalPage}from'@/components/sections/CmsLegalPage'
export const metadata:Metadata={title:'Terms & Conditions',description:'The terms and conditions for using The UAE Junction and our booking services.',alternates:{canonical:'https://theuaejunction.cloud/terms-and-conditions'}}
export const revalidate=3600
export default function Page(){return<CmsLegalPage title="Terms & Conditions" uri="/terms-and-conditions/" fallback="Our full terms and conditions are being finalised. For any questions, please contact us."/>}

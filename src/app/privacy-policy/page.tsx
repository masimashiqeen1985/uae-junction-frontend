import type{Metadata}from'next'
import{CmsLegalPage}from'@/components/sections/CmsLegalPage'
export const metadata:Metadata={title:'Privacy Policy',description:'How The UAE Junction collects, uses and protects your personal data.',alternates:{canonical:'https://theuaejunction.cloud/privacy-policy'}}
export const revalidate=3600
export default function Page(){return<CmsLegalPage title="Privacy Policy" uri="/privacy-policy/" fallback="Our full privacy policy is being finalised. For any questions about how we handle your data, please contact us."/>}

import type{Metadata}from'next'
import'./globals.css'
import{Header}from'@/components/layout/Header'
import{Footer}from'@/components/layout/Footer'
import{WhatsAppButton}from'@/components/layout/WhatsAppButton'
import{GroupCorporateTab}from'@/components/layout/GroupCorporateTab'
export const metadata:Metadata={title:{default:'The UAE Junction — Travel Deals with 4% Cashback',template:'%s | The UAE Junction'},description:'The UAE Junction provides flights, hotels, theme park tickets, desert safari, dhow cruise & holiday packages with 4% cashback.',metadataBase:new URL('https://theuaejunction.cloud'),openGraph:{siteName:'The UAE Junction',locale:'en_AE',type:'website'}}
export default function RootLayout({children}:{children:React.ReactNode}){
  return<html lang="en"><body><Header/><main>{children}</main><Footer/><WhatsAppButton/><GroupCorporateTab/></body></html>
}
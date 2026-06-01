import Image from 'next/image'
import type{WPImage as WPImageType}from'@/types/wordpress'
interface Props{image:WPImageType|null|undefined;className?:string;sizes?:string;priority?:boolean;fill?:boolean;quality?:number;alt?:string}
export function WPImage({image,className,sizes,priority=false,fill=false,quality=85,alt}:Props){
  if(!image?.sourceUrl)return null
  const a=alt??image.altText??''
  if(fill)return<Image src={image.sourceUrl} alt={a} fill className={className} sizes={sizes??'100vw'} priority={priority} quality={quality}/>
  return<Image src={image.sourceUrl} alt={a} width={image.mediaDetails?.width??800} height={image.mediaDetails?.height??600} className={className} sizes={sizes??'(max-width:768px) 100vw,(max-width:1200px) 50vw,33vw'} priority={priority} quality={quality}/>
}
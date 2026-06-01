import Link from'next/link'
import{WPImage}from'./WPImage'
import{Badge}from'./Badge'
import{cn,formatPrice}from'@/lib/utils'
import type{WPProduct}from'@/types/wordpress'
export function ProductCard({product,className}:{product:WPProduct;className?:string}){
  const{slug,name,image,regularPrice,salePrice,onSale,productFields}=product
  return(
    <Link href={`/product/${slug}`} className={cn('group block bg-white rounded-card shadow-card hover:shadow-card-hover transition-all duration-300',className)}>
      <div className="relative overflow-hidden rounded-t-card aspect-[4/3]">
        {image?<WPImage image={image} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw"/>:<div className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-400 text-sm">No image</div>}
        {onSale&&<div className="absolute top-3 left-3"><Badge variant="sale">Sale</Badge></div>}
        {productFields?.badgeActive&&productFields.badgeText&&<div className="absolute top-3 right-3"><Badge variant="primary">{productFields.badgeText}</Badge></div>}
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-neutral-800 text-sm leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-2">{name}</h3>
        <div className="flex items-center gap-2 mb-4">
          {onSale&&regularPrice&&<span className="text-neutral-400 text-sm line-through">AED {formatPrice(regularPrice)}</span>}
          <span className="text-primary font-bold text-base">AED {formatPrice(salePrice??regularPrice??'')}</span>
        </div>
        <button className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-btn text-sm transition-colors duration-200">Book Now</button>
      </div>
    </Link>
  )
}
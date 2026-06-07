import Link from'next/link'
import{WPImage}from'./WPImage'
import{Badge}from'./Badge'
import{cn,formatPrice}from'@/lib/utils'
import type{WPProduct}from'@/types/wordpress'
import{WishlistButton}from'@/components/wishlist/WishlistButton'
// Card is a relative shell with a stretched <Link> (absolute inset-0) so the
// WishlistButton can sit ABOVE it (z-10) as a real, valid button — interactive
// elements are never nested inside the anchor. Visual contract unchanged
// except: ACF badge moved under the Sale badge (top-left stack) to free the
// top-right corner for the heart.
export function ProductCard({product,className}:{product:WPProduct;className?:string}){
  const{databaseId,slug,name,image,regularPrice,salePrice,onSale,productFields}=product
  return(
    <div className={cn('group relative block bg-white rounded-card shadow-card hover:shadow-card-hover transition-all duration-300',className)}>
      <Link href={`/product/${slug}`} aria-label={name} className="absolute inset-0 z-[1] rounded-card focus-ring"/>
      <div className="relative overflow-hidden rounded-t-card aspect-[4/3]">
        {image?<WPImage image={image} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw"/>:<div className="w-full h-full bg-neutral-100 flex items-center justify-center text-neutral-400 text-sm">No image</div>}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {onSale&&<Badge variant="sale">Sale</Badge>}
          {productFields?.badgeActive&&productFields.badgeText&&<Badge variant="primary">{productFields.badgeText}</Badge>}
        </div>
        {databaseId>0&&<div className="absolute top-2 right-2 z-10"><WishlistButton productId={databaseId} productName={name} size="sm"/></div>}
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-neutral-800 text-sm leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-2">{name}</h3>
        <div className="flex items-center gap-2 mb-4">
          {onSale&&regularPrice&&<span className="text-neutral-400 text-sm line-through">AED {formatPrice(regularPrice)}</span>}
          <span className="text-primary font-bold text-base">AED {formatPrice(salePrice??regularPrice??'')}</span>
        </div>
        <span aria-hidden className="block w-full bg-primary group-hover:bg-primary-dark text-white text-center font-semibold py-2.5 rounded-btn text-sm transition-colors duration-200">Book Now</span>
      </div>
    </div>
  )
}

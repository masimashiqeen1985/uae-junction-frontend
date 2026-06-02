import{ProductCard}from'@/components/ui/ProductCard'
import type{WPProduct}from'@/types/wordpress'
export function TravelerFavorites({products}:{products:WPProduct[]}){
  if(!products||products.length===0)return null
  return(
    <section className="py-16 bg-white">
      <div className="container-xl">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-3xl text-secondary">Traveler Favorites This Season</h2>
            <p className="text-neutral-500 mt-1">Hand-picked experiences our guests love most.</p>
          </div>
          <a href="/experiences" className="hidden sm:inline text-primary font-semibold hover:text-primary-dark transition-colors whitespace-nowrap">View all →</a>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {products.slice(0,8).map(p=><ProductCard key={p.id} product={p}/>)}
        </div>
      </div>
    </section>
  )
}

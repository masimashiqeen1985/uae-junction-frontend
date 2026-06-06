'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2, Loader2, ShoppingBag } from 'lucide-react'
import { useCart } from './CartProvider'
import { OrderSummary } from '@/components/commerce/OrderSummary'
import { formatPrice } from '@/lib/utils'
import type { CartItem } from '@/lib/queries/cart'

function QtyStepper({ item }: { item: CartItem }) {
  const { updateQty, removeItem, status } = useCart()
  const busy = status === 'mutating'
  return (
    <div className="inline-flex items-center rounded-btn border border-neutral-200">
      <button
        type="button" aria-label="Decrease quantity" disabled={busy}
        onClick={() => (item.quantity <= 1 ? removeItem(item.key) : updateQty(item.key, item.quantity - 1))}
        className="grid h-9 w-9 place-items-center text-neutral-500 hover:text-primary disabled:opacity-50"
      ><Minus className="h-4 w-4" /></button>
      <span className="w-9 text-center text-sm font-semibold" aria-live="polite">{item.quantity}</span>
      <button
        type="button" aria-label="Increase quantity" disabled={busy}
        onClick={() => updateQty(item.key, item.quantity + 1)}
        className="grid h-9 w-9 place-items-center text-neutral-500 hover:text-primary disabled:opacity-50"
      ><Plus className="h-4 w-4" /></button>
    </div>
  )
}

function LineItem({ item }: { item: CartItem }) {
  const { removeItem, status } = useCart()
  const p = item.product.node
  return (
    <div className="flex gap-4 py-5">
      <Link href={`/product/${p.slug}`} className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-btn bg-neutral-100">
        {p.image?.sourceUrl
          ? <Image src={p.image.sourceUrl} alt={p.image.altText || p.name} fill className="object-cover" sizes="96px" />
          : <span className="grid h-full place-items-center text-xs text-neutral-400">No image</span>}
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/product/${p.slug}`} className="font-display font-semibold text-sm text-secondary hover:text-primary line-clamp-2">{p.name}</Link>
        <p className="mt-1 text-sm text-neutral-500">AED {formatPrice(item.subtotal)}</p>
        <div className="mt-3 flex items-center gap-4">
          <QtyStepper item={item} />
          <button type="button" onClick={() => removeItem(item.key)} disabled={status === 'mutating'}
            className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-red-600">
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
      </div>
      <div className="text-right font-display font-bold text-secondary">AED {formatPrice(item.total)}</div>
    </div>
  )
}

export function CartView() {
  const { cart, status } = useCart()

  if (status === 'loading' && !cart) {
    return <div className="grid place-items-center py-24 text-neutral-400"><Loader2 className="h-7 w-7 animate-spin" /></div>
  }

  const items = cart?.contents?.nodes ?? []
  if (!cart || cart.isEmpty || items.length === 0) {
    return (
      <div className="bg-white rounded-card shadow-card p-10 text-center max-w-lg mx-auto">
        <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-amber-50 text-primary"><ShoppingBag className="h-7 w-7" /></span>
        <h2 className="font-display font-bold text-xl text-secondary mb-2">Your cart is empty</h2>
        <p className="text-neutral-500 mb-6">Explore theme parks, desert safaris, dhow cruises and more — every booking earns 2.5% cashback.</p>
        <Link href="/experiences" className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-btn font-semibold transition-colors">Browse experiences</Link>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px] items-start">
      <div className="bg-white rounded-card shadow-card px-6 divide-y divide-neutral-100">
        {items.map((it) => <LineItem key={it.key} item={it} />)}
      </div>
      <div className="lg:sticky lg:top-24">
        <OrderSummary cart={cart}>
          <Link href="/checkout" className="block w-full text-center bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-btn transition-colors">Proceed to Checkout</Link>
          <Link href="/experiences" className="mt-3 block text-center text-sm text-neutral-500 hover:text-primary">Continue shopping</Link>
        </OrderSummary>
      </div>
    </div>
  )
}

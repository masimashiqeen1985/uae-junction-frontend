import { formatPrice } from '@/lib/utils'
import type { Cart } from '@/lib/queries/cart'

// Reusable order summary — shared by Cart, Checkout and Order Confirmation so
// totals + cashback are presented identically everywhere. Prices are displayed
// as "AED {n}" consistent with the rest of the site.
function num(s?: string) {
  const n = parseFloat(formatPrice(s).replace(/,/g, ''))
  return Number.isFinite(n) ? n : 0
}

export function OrderSummary({
  cart, children, heading = 'Order Summary',
}: { cart: Cart; children?: React.ReactNode; heading?: string }) {
  const subtotal = num(cart.subtotal)
  const total = num(cart.total)
  const cashback = +(total * 0.04).toFixed(2)
  const money = (n: number) => `AED ${n.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="bg-white rounded-card shadow-card p-6">
      <h2 className="font-display font-semibold text-lg text-secondary mb-5">{heading}</h2>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between text-neutral-600">
          <dt>Subtotal</dt><dd aria-live="polite">{money(subtotal)}</dd>
        </div>
        <div className="flex justify-between text-neutral-600">
          <dt>Taxes & fees</dt><dd>Calculated at booking</dd>
        </div>
        <div className="border-t border-neutral-100 pt-3 flex justify-between items-baseline">
          <dt className="font-display font-bold text-secondary text-base">Total</dt>
          <dd className="font-display font-bold text-primary text-xl" aria-live="polite">{money(total)}</dd>
        </div>
        <div className="flex items-center justify-between rounded-btn bg-emerald-50 px-3 py-2 text-emerald-700">
          <dt className="font-semibold">You’ll earn 2.5% cashback</dt>
          <dd className="font-bold">{money(cashback)}</dd>
        </div>
      </dl>
      {children && <div className="mt-5">{children}</div>}
    </div>
  )
}

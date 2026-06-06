'use client'
// Payment method selector. Only "Direct Account Transfer" (Woo `bacs`) is
// live today — Stripe / Tabby / PayPal are shown as disabled "Available soon"
// options until their gateways are activated. No card or credential fields
// are ever rendered here (PCI rule: gateways use their own hosted flows).

const COMING_SOON = [
  { id: 'stripe', label: 'Card (Visa / Mastercard)', hint: 'Secure card payment via Stripe' },
  { id: 'tabby', label: 'Tabby — pay in 4', hint: 'Split your booking into 4 payments' },
  { id: 'paypal', label: 'PayPal', hint: 'Pay with your PayPal account' },
]

export function PaymentMethods() {
  return (
    <fieldset className="space-y-3">
      <legend className="font-display font-semibold text-lg text-secondary mb-3">
        Payment method
      </legend>

      <label
        className="flex items-start gap-3 rounded-card border-2 border-primary bg-primary/5 p-4 cursor-pointer"
      >
        <input
          type="radio"
          name="paymentMethod"
          value="bacs"
          defaultChecked
          className="mt-1 h-4 w-4 accent-current focus-ring"
        />
        <span>
          <span className="block font-semibold text-secondary">Direct Account Transfer</span>
          <span className="mt-1 block text-sm text-neutral-600">
            Your booking is reserved instantly and you receive a pre-booking
            reference number. Pay by bank transfer using that reference — once
            the payment lands in our account, our team confirms your booking
            and sends your invoice.
          </span>
        </span>
      </label>

      {COMING_SOON.map((m) => (
        <label
          key={m.id}
          aria-disabled="true"
          className="flex items-start gap-3 rounded-card border border-neutral-200 bg-neutral-50 p-4 opacity-70 cursor-not-allowed"
        >
          <input
            type="radio"
            name="paymentMethod"
            value={m.id}
            disabled
            className="mt-1 h-4 w-4"
          />
          <span className="flex-1">
            <span className="flex items-center gap-2 font-semibold text-neutral-500">
              {m.label}
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-700">
                Available soon
              </span>
            </span>
            <span className="mt-1 block text-sm text-neutral-400">{m.hint}</span>
          </span>
        </label>
      ))}

      <p className="flex items-center gap-2 text-sm text-neutral-500 pt-1">
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5Zm-3 8V6a3 3 0 1 1 6 0v3H9Z"/></svg>
        No payment is taken online today — you pay by bank transfer with your reference.
      </p>
    </fieldset>
  )
}

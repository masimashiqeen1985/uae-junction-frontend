// WooGraphQL checkout — schema-verified live (2026-06-06) via controlled
// mutation probes (public introspection is disabled on this endpoint).
// Confirmed against cms.theuaejunction.cloud/graphql:
//  - CheckoutInput accepts: clientMutationId, paymentMethod, customerNote,
//    shipToDifferentAddress, billing (CustomerAddressInput)
//  - billing accepts: firstName, lastName, email, phone, country
//  - paymentMethod "bacs" (Direct Bank Transfer — enabled in Woo 2026-06-06,
//    ASIM-approved); "cod"/"cheque" rejected ("Invalid payment method")
//  - E2E proven: order #318 created ON_HOLD, cart emptied server-side.
// Uses the same `woocommerce-session: Session <token>` mechanism as /api/cart.

export const CHECKOUT = `mutation Checkout($input:CheckoutInput!){checkout(input:$input){result redirect order{databaseId orderNumber status total billing{email firstName}}}}`

export interface CheckoutBilling {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
}

export interface CheckoutMutationInput {
  clientMutationId: string
  paymentMethod: 'bacs'
  customerNote?: string
  billing: CheckoutBilling
}

export interface CheckoutOrder {
  databaseId: number
  orderNumber: string
  status: string
  total: string
  billing?: { email: string; firstName: string } | null
}

/** Shape returned by POST /api/checkout on success. */
export interface CheckoutResult {
  order: { orderNumber: string; total: string; status: string }
  redirect?: string
}

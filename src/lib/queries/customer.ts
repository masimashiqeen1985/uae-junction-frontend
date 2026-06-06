// Customer / account GraphQL operations — Phase 4 (Account Hub) + Phase 5
// (account sub-pages). Only fields PROVEN live against
// cms.theuaejunction.cloud (2026-06-07, JWT-bearer probes, two-customer
// ownership matrix — see PHASE-4 / PHASE-5 reports §2):
//  - registerCustomer(input:{email,password,firstName,lastName}) → customer{...}
//    (the JWT plugin refuses issuing tokens on register — register-then-login)
//  - login(input:{username,password}) → authToken refreshToken user{...}
//  - customer (Bearer) → own id/databaseId/email/firstName/lastName/date/
//    billing{phone country} + orders(first,after){...} with pageInfo cursor
//    pagination. Returns ONLY the token's own data.
//  - order(id,idType:DATABASE_ID) → "Not authorized" for non-owners (we still
//    render detail from the list payload — zero ID-route risk).
//  - updateCustomer(input:{firstName,lastName,email,password,billing{phone,country}})
//    → updates ONLY the bearer (cross-customer attempt → capability error).
//    JWT stays valid after email AND password change (proven).
//  - myLoyalty / myPointsHistory (uaej-loyalty plugin) → bearer-only loyalty
//    summary + ledger; guest → "You must be logged in."

export const REGISTER_CUSTOMER = `mutation RegisterCustomer($email:String!,$password:String!,$firstName:String,$lastName:String){
  registerCustomer(input:{clientMutationId:"web-register",email:$email,password:$password,firstName:$firstName,lastName:$lastName}){
    customer{ id databaseId email firstName lastName }
  }
}`

export const GET_CUSTOMER = `query GetCustomer{
  customer{
    id databaseId email firstName lastName
    orders(first:3){ nodes{ databaseId orderNumber date status total } }
  }
}`

export type CustomerOrderNode = {
  databaseId: number
  orderNumber: string | null
  date: string | null
  status: string | null
  total: string | null
}

export type CustomerData = {
  id: string
  databaseId: number | null
  email: string | null
  firstName: string | null
  lastName: string | null
  orders?: { nodes: CustomerOrderNode[] } | null
}

/* ────────────────────────── Phase 5 additions ────────────────────────── */

export const ORDER_LIST_FIELDS = `databaseId orderNumber date status total subtotal paymentMethodTitle
  lineItems{ nodes{ quantity total product{ node{ name slug image{ sourceUrl altText } } } } }`

export const GET_CUSTOMER_ORDERS = `query GetCustomerOrders($first:Int!,$after:String){
  customer{
    databaseId
    orders(first:$first,after:$after){
      nodes{ ${ORDER_LIST_FIELDS} }
      pageInfo{ hasNextPage endCursor }
    }
  }
}`

export const GET_CUSTOMER_PROFILE = `query GetCustomerProfile{
  customer{
    id databaseId email firstName lastName date
    billing{ phone country }
  }
}`

export const UPDATE_CUSTOMER = `mutation UpdateCustomer($firstName:String,$lastName:String,$email:String,$password:String,$billing:CustomerAddressInput){
  updateCustomer(input:{clientMutationId:"web-profile",firstName:$firstName,lastName:$lastName,email:$email,password:$password,billing:$billing}){
    customer{ databaseId email firstName lastName billing{ phone country } }
  }
}`

export const MY_LOYALTY = `query MyLoyalty{
  myLoyalty{
    pointsBalance pointsPending pointsLifetime
    tier tierLabel nextTier pointsToNextTier
    referralCode referralLink totalReferrals
    aedEquivalent canRedeem
  }
}`

export const MY_POINTS_HISTORY = `query MyPointsHistory($first:Int){
  myPointsHistory(first:$first){
    id points type source sourceLabel referenceId note createdAt
  }
}`

export type OrderLineItem = {
  quantity: number | null
  total: string | null
  product: {
    node: {
      name: string | null
      slug: string | null
      image?: { sourceUrl: string | null; altText: string | null } | null
    } | null
  } | null
}

export type CustomerOrderFull = CustomerOrderNode & {
  subtotal: string | null
  paymentMethodTitle: string | null
  lineItems?: { nodes: OrderLineItem[] } | null
}

export type OrdersPage = {
  customer: {
    databaseId: number | null
    orders: {
      nodes: CustomerOrderFull[]
      pageInfo: { hasNextPage: boolean; endCursor: string | null }
    } | null
  } | null
}

export type CustomerProfile = {
  id: string
  databaseId: number | null
  email: string | null
  firstName: string | null
  lastName: string | null
  date: string | null
  billing?: { phone: string | null; country: string | null } | null
}

export type LoyaltySummary = {
  pointsBalance: number | null
  pointsPending: number | null
  pointsLifetime: number | null
  tier: string | null
  tierLabel: string | null
  nextTier: string | null
  pointsToNextTier: number | null
  referralCode: string | null
  referralLink: string | null
  totalReferrals: number | null
  aedEquivalent: number | null
  canRedeem: boolean | null
}

export type PointsEntry = {
  id: string
  points: number | null
  type: string | null
  source: string | null
  sourceLabel: string | null
  referenceId: string | null
  note: string | null
  createdAt: string | null
}

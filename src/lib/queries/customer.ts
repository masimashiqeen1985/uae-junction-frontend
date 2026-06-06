// Customer / account GraphQL operations — Phase 4 (Account Hub) + Phase 5
// (account sub-pages) + traveller-details extension (2026-06-07).
// Only fields PROVEN live against cms.theuaejunction.cloud:
// - registerCustomer(input:{email,password,firstName,lastName}) → customer{...}
//   (the JWT plugin refuses issuing tokens on register — register-then-login)
// - login(input:{username,password}) → authToken refreshToken user{...}
// - customer (Bearer) → own id/databaseId/email/firstName/lastName/date/
//   billing{phone country} + orders(first,after){...} with pageInfo cursor
//   pagination. Returns ONLY the token's own data.
// - updateCustomer(input:{firstName,lastName,email,password,billing{phone,country},metaData})
//   → updates ONLY the bearer. metaData input + customer.metaData(keysIn:)
//   read-back schema-probed live 2026-06-07 (guest probe: no unknown-field
//   errors → fields exist; auth enforced upstream).
// - myLoyalty / myPointsHistory (uaej-loyalty plugin) → bearer-only loyalty
//   summary + ledger; guest → "You must be logged in."

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

// Traveller-details meta keys (uaej_nationality / uaej_residency / uaej_gender)
// — see src/lib/profile-fields.ts for the canonical constants.
export const GET_CUSTOMER_PROFILE = `query GetCustomerProfile{
customer{
id databaseId email firstName lastName date
billing{ phone country }
metaData(keysIn:["uaej_nationality","uaej_residency","uaej_gender"]){ key value }
}
}`

export const UPDATE_CUSTOMER = `mutation UpdateCustomer($firstName:String,$lastName:String,$email:String,$password:String,$billing:CustomerAddressInput,$metaData:[MetaDataInput]){
updateCustomer(input:{clientMutationId:"web-profile",firstName:$firstName,lastName:$lastName,email:$email,password:$password,billing:$billing,metaData:$metaData}){
customer{ databaseId email firstName lastName billing{ phone country } metaData(keysIn:["uaej_nationality","uaej_residency","uaej_gender"]){ key value } }
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

export type CustomerMetaEntry = { key: string | null; value: string | null }

export type CustomerProfile = {
  id: string
  databaseId: number | null
  email: string | null
  firstName: string | null
  lastName: string | null
  date: string | null
  billing?: { phone: string | null; country: string | null } | null
  metaData?: CustomerMetaEntry[] | null
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

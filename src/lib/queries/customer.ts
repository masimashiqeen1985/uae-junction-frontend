// Customer / account GraphQL operations — Phase 4 (Account Hub).
// Only fields PROVEN live on 2026-06-07 against cms.theuaejunction.cloud:
//  - registerCustomer(input:{email,password,firstName,lastName}) → customer{...}
//    (authToken on the register payload exists post-JWT-plugin but the plugin
//    refuses to issue it outside the requesting user's context — we therefore
//    register first, then login. Proven: "Only the user requesting a token...")
//  - login(input:{username,password}) → authToken refreshToken user{...}
//  - customer (Bearer-authed) → id databaseId email firstName lastName
//    orders(first:3){ nodes{ databaseId orderNumber date status total } }
//    Ownership proven: returns ONLY the token's own customer + orders.

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

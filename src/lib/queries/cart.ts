// WooGraphQL cart operations — schema-verified live against
// cms.theuaejunction.cloud/graphql (2026-06-06). Cart state is tied to the
// `woocommerce-session` header round-trip handled by /api/cart (httpOnly cookie).
// Prices are returned as formatted strings (store symbol); the UI strips the
// symbol via formatPrice() and prefixes "AED" to stay consistent with the site.

export const CART_ITEM_FIELDS = `key quantity total subtotal product{node{databaseId name slug type image{sourceUrl altText}}}`

export const GET_CART = `query GetCart{cart{isEmpty subtotal total contents{itemCount nodes{${CART_ITEM_FIELDS}}}}}`

export const ADD_TO_CART = `mutation AddToCart($id:Int!,$qty:Int=1){addToCart(input:{productId:$id,quantity:$qty}){cartItem{${CART_ITEM_FIELDS}}}}`

export const UPDATE_ITEM_QTY = `mutation UpdateQty($key:ID!,$qty:Int!){updateItemQuantities(input:{items:[{key:$key,quantity:$qty}]}){cart{isEmpty subtotal total contents{itemCount nodes{${CART_ITEM_FIELDS}}}}}}`

export const REMOVE_ITEMS = `mutation RemoveItems($keys:[ID]!){removeItemsFromCart(input:{keys:$keys}){cart{isEmpty subtotal total contents{itemCount nodes{${CART_ITEM_FIELDS}}}}}}`

export const EMPTY_CART = `mutation EmptyCart{emptyCart(input:{}){cart{isEmpty subtotal total contents{itemCount nodes{${CART_ITEM_FIELDS}}}}}}`

export interface CartItem {
  key: string
  quantity: number
  total: string
  subtotal: string
  product: { node: { databaseId: number; name: string; slug: string; type?: string; image?: { sourceUrl: string; altText?: string } | null } }
}
export interface Cart {
  isEmpty: boolean
  subtotal: string
  total: string
  contents: { itemCount: number; nodes: CartItem[] }
}

// ─── WP Media ────────────────────────────────────────────────────────────────
export interface WPMediaSize {
  sourceUrl: string
  width: number
  height: number
  name: string
}

export interface WPMediaDetails {
  width: number
  height: number
  sizes?: WPMediaSize[]
}

export interface WPImage {
  sourceUrl: string
  altText?: string
  mediaDetails: WPMediaDetails
}

// ─── SEO ──────────────────────────────────────────────────────────────────────
export interface WPSeo {
  title?: string
  metaDesc?: string
  opengraphImage?: WPImage
}

// ─── Blog Post ───────────────────────────────────────────────────────────────
export interface WPPost {
  id: string
  title: string
  slug: string
  date: string
  modified?: string
  content?: string
  excerpt?: string
  featuredImage?: { node: WPImage }
  author?: { node: { name: string; avatar?: { url: string } } }
  categories?: { nodes: Array<{ name: string; slug: string }> }
  seo?: WPSeo
}

// ─── WooCommerce Product ─────────────────────────────────────────────────────
export interface WPProduct {
  id: string
  name: string
  slug: string
  shortDescription?: string
  description?: string
  price?: string
  regularPrice?: string
  salePrice?: string
  image?: WPImage
  galleryImages?: { nodes: WPImage[] }
  productCategories?: { nodes: Array<{ name: string; slug: string }> }
  seo?: WPSeo
}

// ─── WP Page ─────────────────────────────────────────────────────────────────
export interface WPPage {
  id: string
  title: string
  slug: string
  content?: string
  seo?: WPSeo
}

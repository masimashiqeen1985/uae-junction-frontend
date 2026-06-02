import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchGraphQL } from '@/lib/graphql-client'
import { GET_PRODUCT, GET_ALL_PRODUCT_SLUGS } from '@/lib/queries'
import type { WPProduct } from '@/types'

interface ProductData {
  product: WPProduct | null
}

interface SlugData {
  products: { nodes: Array<{ slug: string }> }
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const data = await fetchGraphQL<SlugData>(GET_ALL_PRODUCT_SLUGS, {}, false)
    return data.products.nodes.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const data = await fetchGraphQL<ProductData>(GET_PRODUCT, { slug })
    const product = data.product
    if (!product) return {}
    return {
      title: product.seo?.title ?? product.name,
      description: product.seo?.metaDesc ?? product.shortDescription,
    }
  } catch {
    return {}
  }
}

export const revalidate = 3600

export default async function ProductPage({ params }: Props) {
  const { slug } = await params

  let product: WPProduct | null = null
  try {
    const data = await fetchGraphQL<ProductData>(GET_PRODUCT, { slug })
    product = data.product
  } catch {
    // GraphQL not yet configured — render placeholder
  }

  if (product === null && product !== undefined) notFound()

  return (
    <main className="container section-py">
      <h1>{product?.name ?? slug}</h1>
      {product?.shortDescription ? (
        <div dangerouslySetInnerHTML={{ __html: product.shortDescription }} />
      ) : (
        <p>Product detail page — full design in FE-04.</p>
      )}
    </main>
  )
}

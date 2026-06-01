/**
 * All WPGraphQL queries are centralised here.
 * No inline query strings in page components.
 */

// ─── Fragment: Full image details ───────────────────────────────────────────
export const MEDIA_FIELDS = `
  sourceUrl
  altText
  mediaDetails {
    width
    height
    sizes {
      sourceUrl
      width
      height
      name
    }
  }
`

// ─── Site Global Options (ACF Options Page) ─────────────────────────────────
export const GET_SITE_OPTIONS = `
  query GetSiteOptions {
    siteOptions: page(id: "/", idType: URI) {
      id
    }
  }
`

// ─── Homepage ───────────────────────────────────────────────────────────────
export const GET_HOMEPAGE = `
  query GetHomepage {
    page(id: "/", idType: URI) {
      id
      title
      slug
      seo {
        title
        metaDesc
        opengraphImage { ${MEDIA_FIELDS} }
      }
    }
  }
`

// ─── Product/Activity (WooCommerce product) ──────────────────────────────────
export const GET_PRODUCT = `
  query GetProduct($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      id
      name
      slug
      shortDescription
      description
      image { ${MEDIA_FIELDS} }
      galleryImages {
        nodes { ${MEDIA_FIELDS} }
      }
      ... on SimpleProduct {
        price
        regularPrice
        salePrice
      }
      productCategories {
        nodes { name slug }
      }
      seo {
        title
        metaDesc
        opengraphImage { ${MEDIA_FIELDS} }
      }
    }
  }
`

// ─── Product Listing by Category ────────────────────────────────────────────
export const GET_PRODUCTS_BY_CATEGORY = `
  query GetProductsByCategory($categorySlug: String!, $first: Int = 24) {
    products(where: { category: $categorySlug, status: "PUBLISH" }, first: $first) {
      nodes {
        id
        name
        slug
        image { ${MEDIA_FIELDS} }
        productCategories {
          nodes { name slug }
        }
        ... on SimpleProduct {
          price
          regularPrice
          salePrice
        }
      }
    }
  }
`

// ─── Blog Listing ────────────────────────────────────────────────────────────
export const GET_POSTS = `
  query GetPosts($first: Int = 12, $after: String) {
    posts(first: $first, after: $after, where: { status: PUBLISH }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        title
        slug
        date
        excerpt
        featuredImage {
          node { ${MEDIA_FIELDS} }
        }
        categories {
          nodes { name slug }
        }
      }
    }
  }
`

// ─── Single Blog Post ────────────────────────────────────────────────────────
export const GET_POST = `
  query GetPost($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      title
      slug
      content
      date
      modified
      excerpt
      featuredImage {
        node { ${MEDIA_FIELDS} }
      }
      author {
        node { name avatar { url } }
      }
      categories {
        nodes { name slug }
      }
      seo {
        title
        metaDesc
        opengraphImage { ${MEDIA_FIELDS} }
      }
    }
  }
`

// ─── Static Page ─────────────────────────────────────────────────────────────
export const GET_PAGE = `
  query GetPage($slug: ID!) {
    page(id: $slug, idType: URI) {
      id
      title
      content
      slug
      seo {
        title
        metaDesc
        opengraphImage { ${MEDIA_FIELDS} }
      }
    }
  }
`

// ─── All post slugs (for generateStaticParams) ───────────────────────────────
export const GET_ALL_POST_SLUGS = `
  query GetAllPostSlugs {
    posts(first: 1000, where: { status: PUBLISH }) {
      nodes { slug }
    }
  }
`

// ─── All product slugs (for generateStaticParams) ────────────────────────────
export const GET_ALL_PRODUCT_SLUGS = `
  query GetAllProductSlugs {
    products(first: 1000) {
      nodes { slug }
    }
  }
`

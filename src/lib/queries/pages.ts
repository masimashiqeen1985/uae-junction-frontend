import{MEDIA_FIELDS}from'./fragments'
// WPGraphQL `page(id:ID!,idType:URI)` — verified live against cms.theuaejunction.cloud
// (WPGraphQL 2.14.1). NO seo{} field (Yoast addon not installed) and NO ACF — do not request them.
// URI form is a leading+trailing-slashed path, e.g. "/services/flight-booking/".
export const GET_PAGE_BY_URI=`query GetPage($uri:ID!){page(id:$uri,idType:URI){id title slug uri date modified content featuredImage{node{${MEDIA_FIELDS}}}}}`
// All published page URIs — used by generateStaticParams for the custom-page catch-all.
export const GET_ALL_PAGE_URIS=`query GetAllPageUris{pages(first:200){nodes{uri slug}}}`

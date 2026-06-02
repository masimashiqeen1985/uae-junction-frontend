import{MEDIA_FIELDS}from'./fragments'
export const GET_POSTS=`query GetPosts($first:Int=12){posts(first:$first){nodes{id slug title date excerpt featuredImage{node{${MEDIA_FIELDS}}}categories{nodes{name slug}}}}}`
// NOTE: no `seo{...}` block here on purpose — that field requires the WPGraphQL Yoast SEO
// addon, which is NOT installed. Requesting it makes the whole query error -> null -> 404.
// Metadata is derived from title + excerpt instead. Add seo back only after that plugin is live.
export const GET_POST=`query GetPost($slug:String!){post(id:$slug,idType:SLUG){id slug title date content excerpt featuredImage{node{${MEDIA_FIELDS}}}categories{nodes{name slug}}author{node{name}}}}`
export const GET_ALL_POST_SLUGS=`query{posts(first:200){nodes{slug}}}`

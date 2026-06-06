import{MEDIA_FIELDS}from'./fragments'

/** All destinations (Country -> City tree) for the index page. */
export const GET_DESTINATIONS=`query GetDestinations{destinations(first:50,where:{hideEmpty:false}){nodes{id databaseId name slug count parentDatabaseId children{nodes{id name slug count}}}}}`

/** One destination + its products (products are tagged with BOTH city and country, so country slugs return everything inside). */
export const GET_DESTINATION_PRODUCTS=`query DestinationProducts($slug:ID!,$first:Int=100){destination(id:$slug,idType:SLUG){name slug description count parent{node{name slug}}children{nodes{name slug count}}products(first:$first){nodes{id databaseId slug name shortDescription onSale image{${MEDIA_FIELDS}} ... on SimpleProduct{regularPrice salePrice price} productCategories{nodes{name slug}}}}}}`

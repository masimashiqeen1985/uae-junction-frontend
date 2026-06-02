import{fetchGraphQL}from'@/lib/graphql-client'
import{GET_PAGE_BY_URI}from'@/lib/queries/pages'
import{PageHero,breadcrumbJsonLd}from'@/components/sections/PageHero'
import{JsonLd}from'@/components/ui/JsonLd'
import type{WPPage}from'@/types/wordpress'

async function getPage(uri:string):Promise<WPPage|null>{
  try{
    const d=await fetchGraphQL<{page?:WPPage}>(GET_PAGE_BY_URI,{uri},3600)
    return d.page??null
  }catch{return null}
}

// Renders a legal/static page from a WP Page body, degrading to a friendly fallback
// when the page has not been created in the CMS yet.
export async function CmsLegalPage({title,uri,fallback}:{title:string;uri:string;fallback:string}){
  const page=await getPage(uri)
  const crumbs=[{label:'Home',href:'/'},{label:title}]
  return(
    <div>
      <JsonLd data={breadcrumbJsonLd(crumbs)}/>
      <PageHero title={page?.title??title} crumbs={crumbs}/>
      <section className="container-xl max-w-3xl py-12">
        {page?.content
          ?<div className="blog-content text-neutral-700 leading-relaxed" dangerouslySetInnerHTML={{__html:page.content}}/>
          :<p className="text-neutral-500 leading-relaxed">{fallback}</p>}
      </section>
    </div>
  )
}

const GQL = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!
export async function fetchGraphQL<T>(query:string,variables?:Record<string,unknown>,revalidate:number|false=3600):Promise<T>{
  const res=await fetch(GQL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query,variables}),next:{revalidate}})
  if(!res.ok)throw new Error(`GraphQL failed:${res.status}`)
  const json=await res.json()
  if(json.errors)throw new Error(json.errors[0]?.message??'GraphQL error')
  return json.data as T
}
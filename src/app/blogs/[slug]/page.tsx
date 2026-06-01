import type{Metadata}from'next'
interface Props{params:Promise<{slug:string}>}
export async function generateMetadata({params}:Props):Promise<Metadata>{const{slug}=await params;return{title:slug.replace(/-/g,' ')}}
export default async function BlogPostPage({params}:Props){const{slug}=await params;return<div className="container-xl py-16 max-w-3xl"><h1 className="font-display font-bold text-4xl text-secondary mb-6">{slug.replace(/-/g,' ')}</h1><p className="text-neutral-500">Content loading from CMS...</p></div>}
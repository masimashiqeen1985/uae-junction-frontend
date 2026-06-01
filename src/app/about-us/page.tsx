import type{Metadata}from'next'
export const metadata:Metadata={title:'About Us',description:'Learn about The UAE Junction.'}
export default function AboutPage(){return<div className="container-xl py-16 max-w-3xl"><h1 className="font-display font-bold text-4xl text-secondary mb-6">About Us</h1><p className="text-neutral-600 text-lg leading-relaxed">Content managed via WordPress CMS.</p></div>}
import type{Metadata}from'next'
export const metadata:Metadata={title:'Careers',description:'Join The UAE Junction — send us a speculative application.',alternates:{canonical:'/careers'}}
export const revalidate=3600
export default function Page(){
  return(
    <div className="container-xl py-16 max-w-3xl">
      <h1 className="font-display font-bold text-4xl text-secondary mb-8">Careers</h1>
      <div className="prose prose-neutral max-w-none prose-headings:font-display prose-headings:text-secondary prose-h2:text-xl prose-h2:mt-8 prose-a:text-primary">
        <p>The UAE Junction is your gateway to global exploration &mdash; and we&rsquo;re always interested in meeting talented, service-minded people who share our passion for travel.</p>
        <p>We don&rsquo;t have any specific openings listed at the moment, but we welcome speculative applications across sales, customer experience, operations, content and technology.</p>
        <h2>How to apply</h2>
        <p>Send your CV and a short note about the role you&rsquo;re interested in to <a href="mailto:sales@theuaejunction.com">sales@theuaejunction.com</a>, and our team will get back to you if there&rsquo;s a fit.</p>
        <p>Phone: +971 58 589 8221<br/>Location: Dubai, United Arab Emirates</p>
      </div>
    </div>
  )
}

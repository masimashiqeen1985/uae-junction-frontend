import type{Metadata}from'next'
export const metadata:Metadata={title:'Privacy Policy',description:'How The UAE Junction collects, uses and protects your personal information.',alternates:{canonical:'/privacy-policy'}}
export const revalidate=3600
export default function Page(){
  return(
    <div className="container-xl py-16 max-w-3xl">
      <h1 className="font-display font-bold text-4xl text-secondary mb-8">Privacy Policy</h1>
      <div className="prose prose-neutral max-w-none prose-headings:font-display prose-headings:text-secondary prose-h2:text-xl prose-h2:mt-8 prose-a:text-primary">
        <p>At The UAE Junction, we respect the privacy of our valued customers and ensure that we collect only the information necessary to process your bookings efficiently. We are committed to protecting your privacy in all interactions with our website, mobile app, and customer support. The following outlines our policy regarding the collection, use, and protection of your information.</p>
        <h2>Collection of Personal Information</h2>
        <p>We collect personal information primarily when you reach out to us for inquiries or make a booking through our platform. This information typically includes your name, contact number, email address, physical address, payment details (such as credit/debit card information), travel requirements, and referral sources. By submitting your information, you consent to The UAE Junction using it to process your requests promptly and accurately.</p>
        <h2>Use of Information</h2>
        <p>The personal data we collect is used solely to:</p>
        <ul>
          <li>Process bookings and travel-related services.</li>
          <li>Verify and validate payment details.</li>
          <li>Provide service updates and travel documentation.</li>
          <li>Improve the quality and efficiency of our website and services.</li>
          <li>Conduct internal audits, research, and performance analysis.</li>
          <li>Use for internal marketing and promotions.</li>
        </ul>
        <h2>Privacy of Your Information</h2>
        <p>All customer information, including contact details and payment information, is treated with strict confidentiality. Disclosure of information is made only to trusted service providers or partners involved in fulfilling your booking, and only under agreements that uphold our privacy standards and data security protocols.</p>
        <h2>Legal Disclosure of Information</h2>
        <p>We may disclose personal information if required to comply with legal obligations, protect the rights of The UAE Junction, or respond to court orders or legal proceedings.</p>
        <h2>Non-Personal Information</h2>
        <p>The UAE Junction may automatically collect non-personal data (such as browser type, visit duration, and pages accessed) using cookies or third-party analytics tools. This data is used solely for improving our website&rsquo;s usability and performance.</p>
        <h2>Opt-Out Options</h2>
        <p>We provide customers with the choice to opt-out of receiving promotional communications. You can request not to receive newsletters or marketing emails from The UAE Junction or its affiliated partners at any time.</p>
        <h2>Contests and Surveys</h2>
        <p>Occasionally, The UAE Junction may run contests, surveys, or promotional offers, sometimes in partnership with third-party sponsors. We will clearly inform participants of any third-party involvement and the potential use of personal information before participation. Participation in such events is voluntary.</p>
        <h2>Secured Transactions</h2>
        <p>To ensure the safety and confidentiality of your transactions, The UAE Junction uses secure server technology. We implement industry-standard security measures, including encryption, SSL (Secure Socket Layers), and firewalls, to protect sensitive information like your payment details.</p>
        <h2>Contact</h2>
        <p>For any questions related to this policy:<br/>Email: <a href="mailto:customerservice@theuaejunction.com">customerservice@theuaejunction.com</a><br/>Phone: +971 58 589 8221<br/>Website: www.theuaejunction.com</p>
        <p><em>Note: By using our platform, you agree to the terms of this Privacy Policy.</em></p>
      </div>
    </div>
  )
}

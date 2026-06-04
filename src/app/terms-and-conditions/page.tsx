import type{Metadata}from'next'
export const metadata:Metadata={title:'Terms & Conditions',description:'Terms and conditions for booking travel services with The UAE Junction.',alternates:{canonical:'/terms-and-conditions'}}
export const revalidate=3600
export default function Page(){
  return(
    <div className="container-xl py-16 max-w-3xl">
      <h1 className="font-display font-bold text-4xl text-secondary mb-8">Terms & Conditions</h1>
      <div className="prose prose-neutral max-w-none prose-headings:font-display prose-headings:text-secondary prose-h2:text-xl prose-h2:mt-8 prose-a:text-primary">
        <p>Welcome to The UAE Junction. Please read the following terms and conditions carefully before booking any travel services with us. By using our services, you agree to be bound by these terms.</p>
        <h2>General Terms</h2>
        <ul>
          <li>The UAE Junction operates as a travel agency offering flight bookings, hotel reservations, visa assistance, holiday packages, and more.</li>
          <li>All bookings made through our platform are subject to availability and confirmation from suppliers.</li>
          <li>Prices are quoted in AED unless otherwise stated and are subject to change without prior notice.</li>
        </ul>
        <h2>Bookings &amp; Payments</h2>
        <ul>
          <li>Full payment or a specified deposit must be made at the time of booking to confirm your reservation.</li>
          <li>Payment methods accepted: Bank Transfer, Credit/Debit Cards, and secure online gateways.</li>
          <li>Bookings are only confirmed once payment is received, and you receive written confirmation from The UAE Junction.</li>
        </ul>
        <h2>Cancellations &amp; Refunds</h2>
        <ul>
          <li>Cancellation policies vary based on service providers.</li>
          <li>In case of cancellation by the customer, applicable cancellation charges will be deducted, and refunds will be processed as per supplier terms.</li>
          <li>Some services like visa fees or non-refundable hotel rates or flights are 100% non-refundable.</li>
          <li>Refunds may take up to 14&ndash;21 business days to process after approval.</li>
        </ul>
        <h2>Travel Documents &amp; Visas</h2>
        <ul>
          <li>Travelers are responsible for obtaining all necessary documents, including valid passports, visas, health certificates, and permits.</li>
          <li>The UAE Junction offers assistance but does not guarantee visa approvals.</li>
          <li>In case of visa rejection or delays, The UAE Junction is not liable for any resulting losses or missed travel arrangements.</li>
        </ul>
        <h2>Changes &amp; Amendments</h2>
        <ul>
          <li>Requests to change dates, names, or services after confirmation are subject to availability and may incur additional fees.</li>
          <li>Airlines, hotels, and service providers may have their own amendment policies which must be followed.</li>
        </ul>
        <h2>Liability &amp; Disclaimer</h2>
        <ul>
          <li>The UAE Junction acts as an intermediary and does not own or operate any airlines, hotels, or transport services.</li>
          <li>We are not liable for personal injury, loss, damage, delays, or changes in schedules caused by third-party providers or force majeure (e.g., weather, strikes, pandemics).</li>
          <li>We advise all travelers to purchase travel insurance for added protection.</li>
        </ul>
        <h2>Customer Responsibilities</h2>
        <ul>
          <li>Provide accurate information during booking.</li>
          <li>Follow all travel guidelines and regulations, including entry requirements.</li>
          <li>Arrive at airports or tour pickup points on time.</li>
        </ul>
        <h2>Privacy &amp; Data Protection</h2>
        <p>We respect your privacy. Personal information collected during the booking process is used solely for service fulfillment and will not be shared without consent. See our <a href="/privacy-policy">Privacy Policy</a> for details.</p>
        <h2>Governing Law</h2>
        <p>These terms are governed by the laws of the United Arab Emirates. Any disputes arising shall be subject to the jurisdiction of UAE courts.</p>
        <h2>Contact</h2>
        <p>For any questions related to these terms:<br/>Email: <a href="mailto:customerservice@theuaejunction.com">customerservice@theuaejunction.com</a><br/>Phone: +971 58 589 8221<br/>Website: www.theuaejunction.com</p>
      </div>
    </div>
  )
}

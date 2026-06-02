import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Flight Booking',
  description: 'Book flights to and from UAE with The UAE Junction.',
}

export const revalidate = 3600

export default function FlightBookingPage() {
  return (
    <main className="container section-py">
      <h1>Flight Booking</h1>
      <p>Content coming in FE-07 static pages phase.</p>
    </main>
  )
}

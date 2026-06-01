import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hotel Booking UAE',
  description: 'Book hotels across UAE with The UAE Junction. Best rates guaranteed.',
}

export const revalidate = 3600

export default function HotelBookingPage() {
  return (
    <main className="container section-py">
      <h1>Hotel Booking</h1>
      <p>Content coming in FE-07 static pages phase.</p>
    </main>
  )
}

import type { Metadata } from 'next'
import { VibrantHome } from '@/components/home/VibrantHome'

export const metadata: Metadata = {
  title: 'The UAE Junction — Travel Deals with 2.5% Cashback',
  description:
    'Book theme parks, desert safari, dhow cruise, hotels & flights in the UAE. Get 2.5% cashback on every booking.',
}
export const revalidate = 3600

export default function HomePage() {
  return <VibrantHome />
}

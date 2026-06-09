// Shared enquiry types + summary builder. Pure functions only (no server/client
// specific APIs) so the same code runs in the route handler and, if needed, the UI.

export type TripType = 'flights' | 'hotels' | 'both'
export type FlightTrip = 'round' | 'oneway' | 'multi'
export type StarTier = 'cheapest' | '3' | '4' | '5' | 'luxury'
export type Cabin = 'economy' | 'premium' | 'business' | 'first'
export type Board = 'room' | 'breakfast' | 'half' | 'full' | 'allinclusive'
export type ContactMethod = 'whatsapp' | 'call' | 'email'

export interface FlightLeg {
  from?: string
  to?: string
  date?: string
}

export interface EnquiryPayload {
  tripType: TripType
  // travellers
  adults: number
  childrenAges: number[]
  infants: number
  // destination
  country: string
  city: string
  flexibleDestination?: boolean
  routeNotes?: string
  // flights
  flightTrip?: FlightTrip
  departAirport?: string
  arriveAirport?: string
  departDate?: string
  returnDate?: string
  legs?: FlightLeg[]
  cabin?: Cabin
  directOnly?: boolean
  flexibleDates?: boolean
  baggage?: string
  // hotels
  checkIn?: string
  checkOut?: string
  starTier?: StarTier
  rooms?: number
  roomConfig?: string
  board?: Board
  bed?: string
  areaPreference?: string
  // preferences
  purpose?: string
  addOns?: string[]
  budget?: string
  specialRequirements?: string
  // contact
  name: string
  email?: string
  mobile?: string
  contactMethod?: ContactMethod
  whatsappSameAsMobile?: boolean
  travelMonth?: string
  flexibleTiming?: boolean
  contactConsent?: boolean // mandatory: agree to be contacted about this enquiry
  marketingConsent?: boolean // optional: deals & offers
}

const STAR_LABEL: Record<StarTier, string> = {
  cheapest: 'Cheapest available',
  '3': '3-star',
  '4': '4-star',
  '5': '5-star',
  luxury: 'Luxury (5-star+)',
}
const CABIN_LABEL: Record<Cabin, string> = {
  economy: 'Economy',
  premium: 'Premium Economy',
  business: 'Business',
  first: 'First',
}
const BOARD_LABEL: Record<Board, string> = {
  room: 'Room only',
  breakfast: 'Breakfast',
  half: 'Half board',
  full: 'Full board',
  allinclusive: 'All-inclusive',
}
const TRIP_LABEL: Record<FlightTrip, string> = {
  round: 'Round trip',
  oneway: 'One way',
  multi: 'Multi-city',
}

function travellersLine(p: EnquiryPayload): string {
  const parts = [`${p.adults} adult${p.adults === 1 ? '' : 's'}`]
  if (p.childrenAges.length) {
    parts.push(`${p.childrenAges.length} child (ages ${p.childrenAges.join(', ')})`)
  }
  if (p.infants) parts.push(`${p.infants} infant${p.infants === 1 ? '' : 's'}`)
  return parts.join(', ')
}

// Human-readable plain-text summary used for WhatsApp, email and the CMS record.
export function buildSummary(p: EnquiryPayload): string {
  const L: string[] = []
  const wantsFlights = p.tripType === 'flights' || p.tripType === 'both'
  const wantsHotels = p.tripType === 'hotels' || p.tripType === 'both'

  L.push('New enquiry — The UAE Junction')
  L.push(`Looking for: ${p.tripType === 'both' ? 'Flights + Hotel' : p.tripType === 'flights' ? 'Flights' : 'Hotel'}`)
  L.push(`Travellers: ${travellersLine(p)}`)
  L.push(`Destination: ${[p.city, p.country].filter(Boolean).join(', ')}`)
  if (p.flexibleDestination && p.routeNotes) L.push(`Route notes: ${p.routeNotes}`)

  if (wantsFlights) {
    L.push('')
    L.push('FLIGHTS')
    if (p.flightTrip) L.push(`Trip: ${TRIP_LABEL[p.flightTrip]}`)
    if (p.flightTrip === 'multi' && p.legs?.length) {
      p.legs.forEach((leg, i) =>
        L.push(`  Leg ${i + 1}: ${leg.from || '?'} -> ${leg.to || '?'} on ${leg.date || '?'}`),
      )
    } else {
      if (p.departAirport || p.arriveAirport)
        L.push(`Route: ${p.departAirport || '?'} -> ${p.arriveAirport || '?'}`)
      if (p.departDate) L.push(`Departure: ${p.departDate}`)
      if (p.returnDate) L.push(`Return: ${p.returnDate}`)
    }
    if (p.cabin) L.push(`Cabin: ${CABIN_LABEL[p.cabin]}`)
    if (p.directOnly) L.push('Direct flights only: yes')
    if (p.flexibleDates) L.push('Dates flexible: yes')
    if (p.baggage) L.push(`Baggage: ${p.baggage}`)
  }

  if (wantsHotels) {
    L.push('')
    L.push('HOTEL')
    if (p.checkIn) L.push(`Check-in: ${p.checkIn}`)
    if (p.checkOut) L.push(`Check-out: ${p.checkOut}`)
    if (p.starTier) L.push(`Standard: ${STAR_LABEL[p.starTier]}`)
    if (p.rooms) L.push(`Rooms: ${p.rooms}`)
    if (p.roomConfig) L.push(`Room config: ${p.roomConfig}`)
    if (p.board) L.push(`Meal plan: ${BOARD_LABEL[p.board]}`)
    if (p.bed) L.push(`Bed: ${p.bed}`)
    if (p.areaPreference) L.push(`Area/hotel preference: ${p.areaPreference}`)
  }

  const prefs: string[] = []
  if (p.purpose) prefs.push(`Purpose: ${p.purpose}`)
  if (p.addOns?.length) prefs.push(`Add-ons: ${p.addOns.join(', ')}`)
  if (p.budget) prefs.push(`Approx. budget: ${p.budget}`)
  if (p.specialRequirements) prefs.push(`Special requirements: ${p.specialRequirements}`)
  if (prefs.length) {
    L.push('')
    L.push('PREFERENCES')
    prefs.forEach((x) => L.push(x))
  }

  L.push('')
  L.push('CONTACT')
  L.push(`Name: ${p.name}`)
  if (p.mobile) L.push(`Mobile: ${p.mobile}`)
  if (p.email) L.push(`Email: ${p.email}`)
  if (p.contactMethod) L.push(`Preferred contact: ${p.contactMethod}`)
  if (p.travelMonth) L.push(`Travel timing: ${p.travelMonth}`)
  else if (p.flexibleTiming) L.push('Travel timing: flexible')

  return L.join('\n')
}

// Validation shared by the route handler. Returns an error string or null.
export function validateEnquiry(p: Partial<EnquiryPayload>): string | null {
  if (!p || typeof p !== 'object') return 'Invalid request.'
  if (!p.tripType || !['flights', 'hotels', 'both'].includes(p.tripType))
    return 'Please choose what you are looking for.'
  if (!p.adults || p.adults < 1) return 'At least one adult is required.'
  if (Array.isArray(p.childrenAges)) {
    if (p.childrenAges.some((a) => typeof a !== 'number' || a < 2 || a > 11))
      return 'Please provide a valid age (2-11) for each child.'
  }
  if (typeof p.infants === 'number' && p.infants > (p.adults || 0))
    return 'Each infant must be accompanied by an adult.'
  if (!p.country) return 'Please select a destination country.'
  if (!p.city) return 'Please enter a destination city.'

  const wantsFlights = p.tripType === 'flights' || p.tripType === 'both'
  const wantsHotels = p.tripType === 'hotels' || p.tripType === 'both'

  if (wantsFlights && p.flightTrip !== 'multi') {
    if (!p.departAirport || !p.arriveAirport) return 'Please choose departure and arrival airports.'
    if (!p.departDate) return 'Please choose a departure date.'
    if (p.flightTrip === 'round' && !p.returnDate) return 'Please choose a return date.'
    if (p.flightTrip === 'round' && p.returnDate && p.departDate && p.returnDate < p.departDate)
      return 'Return date must be on or after the departure date.'
  }
  if (wantsHotels) {
    if (!p.checkIn || !p.checkOut) return 'Please choose check-in and check-out dates.'
    if (p.checkOut < p.checkIn) return 'Check-out must be on or after check-in.'
    if (!p.starTier) return 'Please choose a hotel standard.'
  }
  if (!p.name || !p.name.trim()) return 'Please enter your name.'
  const hasEmail = !!p.email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email)
  const hasMobile = !!p.mobile && p.mobile.replace(/\D/g, '').length >= 7
  if (!hasEmail && !hasMobile) return 'Please provide a mobile number or email so we can send your quote.'
  if (!p.contactConsent) return 'Please confirm you agree to be contacted about this enquiry.'
  return null
}

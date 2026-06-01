import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The UAE Junction — Your Journey Is Our Passion | 4% Cashback',
  description:
    'Book theme parks, desert safaris, dhow cruises, and more. Earn 4% cashback on every travel booking with The UAE Junction.',
}

// ISR — revalidate every hour
export const revalidate = 3600

export default function HomePage() {
  return (
    <main>
      {/* ── Placeholder — FE-02 builds Header, FE-03 builds all sections ── */}
      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FFA500 0%, #2D9D9D 100%)',
          color: '#fff',
          fontFamily: 'Poppins, sans-serif',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', fontWeight: 800, marginBottom: '1rem' }}>
          The UAE Junction
        </h1>
        <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '480px', marginBottom: '2rem' }}>
          Your Journey Is Our Passion — 4% Cashback on Every Booking
        </p>
        <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
          Site launching soon. Build in progress.
        </p>
      </section>
    </main>
  )
}

import Link from 'next/link'

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Poppins, sans-serif',
        textAlign: 'center',
        padding: '2rem',
        color: '#1A1A1A',
      }}
    >
      <h1 style={{ fontSize: '6rem', fontWeight: 800, color: '#FFA500', lineHeight: 1 }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '1rem 0 0.5rem' }}>
        Page Not Found
      </h2>
      <p style={{ color: '#555', marginBottom: '2rem' }}>
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/" style={{ color: '#FFA500', fontWeight: 600, textDecoration: 'none' }}>
        ← Back to Home
      </Link>
    </main>
  )
}

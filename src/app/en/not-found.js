export default function EnNotFound() {
  return (
    <div style={{
      minHeight: '50vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '4rem 1.5rem',
    }}>
      <h1 style={{ fontSize: '2rem', color: '#1a1a2e' }}>Page Not Found</h1>
      <p style={{ color: '#6b7280' }}>The page you are looking for does not exist or has been moved.</p>
      <a href="/en" style={{
        marginTop: '0.5rem', padding: '0.6rem 1.4rem', background: '#1a1a2e',
        color: 'white', borderRadius: '6px', textDecoration: 'none',
      }}>Back to Home</a>
    </div>
  );
}

'use client';

export default function KasturiGuaranteeSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#F8FAF9',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>

        <div style={{
          background: '#FFFFFF',
          border: '2px solid #059669',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          boxShadow: '0 12px 36px rgba(5, 150, 105, 0.08)',
          position: 'relative',
        }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            padding: '0.4rem 1.2rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '1.25rem',
          }}>
            🛡️ Jaminan Pulangan Wang 30 Hari
          </div>

          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)',
            fontWeight: 900,
            color: '#0F172A',
            margin: '0 0 1rem 0',
            letterSpacing: '-0.025em',
            lineHeight: 1.3,
          }}>
            Ikhtiar Dengan Penuh Keyakinan{' '}
            <span style={{ color: '#047857' }}>— Jaminan 100% Tanpa Risiko</span>
          </h2>

          <p style={{
            fontSize: '0.98rem',
            lineHeight: 1.75,
            color: '#475569',
            maxWidth: '680px',
            margin: '0 auto 1.5rem auto',
          }}>
            Kami komited memberikan ikhtiar terbaik untuk anda sekeluarga. Jika selepas mengamalkan Minyak Kasturi Kijang E-Syifa’ selama 30 hari anda langsung tidak merasai sebarang ketenangan, tidur masih terganggu atau tidak berpuas hati dengan kualitinya, hubungi kami dan <strong>kami akan kembalikan 100% wang anda</strong> tanpa banyak soal.
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            color: '#166534',
            fontSize: '0.85rem',
            fontWeight: 700,
            padding: '0.5rem 1.2rem',
            borderRadius: '12px',
          }}>
            🤝 Tiada risiko kerugian. Kesihatan rohani dan ketenangan anda adalah keutamaan kami.
          </div>

        </div>

      </div>
    </section>
  );
}

'use client';

export default function GaramGuaranteeSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#FFFDFB',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #FED7AA',
    }}>
      <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center' }}>

        <div style={{
          background: '#FFFFFF',
          border: '2px solid #F59E0B',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          boxShadow: '0 12px 36px rgba(245, 158, 11, 0.1)',
          position: 'relative',
        }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
            color: '#B45309',
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
            Ikhtiar Tanpa Sebarang Risiko Kerugian{' '}
            <span style={{ color: '#D97706' }}>— 100% Wang Dikembalikan</span>
          </h2>

          <p style={{
            fontSize: '0.98rem',
            lineHeight: 1.75,
            color: '#475569',
            maxWidth: '680px',
            margin: '0 auto 1.5rem auto',
          }}>
            Kami begitu yakin dengan keberkatan ikhtiar ayat Al-Quran dan khasiat Garam Bukit Pengasihan ESyifaa ini. Jika selepas mengamalkannya dalam hidangan harian selama 30 hari anda langsung tidak merasai sebarang perubahan positif atau kelembutan pada hati pasangan anda, hubungi perawat kami dan <strong>kami akan pulangkan semula 100% wang anda</strong> tanpa banyak soal.
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
            🤝 Anda tidak rugi satu sen pun untuk mencuba menyelamatkan rumahtangga anda hari ini.
          </div>

        </div>

      </div>
    </section>
  );
}

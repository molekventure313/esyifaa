'use client';

export default function SabunGuaranteeSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#061510',
      padding: '4rem 1.25rem',
      fontFamily: ff,
      textAlign: 'center',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        <div style={{
          background: '#0D221B',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '18px',
          padding: '2.5rem 2rem',
        }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            margin: '0 auto 1.25rem auto',
          }}>
            🛡️
          </div>

          <span style={{
            display: 'inline-block',
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#FBBF24',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '0.5rem',
          }}>
            Jaminan Kepuasan Pelanggan
          </span>

          <h2 style={{
            fontSize: 'clamp(1.35rem, 3vw, 1.85rem)',
            fontWeight: 800,
            color: '#F8FAFC',
            margin: '0.2rem 0 0.75rem',
            letterSpacing: '-0.02em',
          }}>
            Beli Dengan Tenang & Yakin
          </h2>

          <p style={{
            fontSize: '0.92rem',
            color: '#94A3B8',
            lineHeight: 1.7,
            maxWidth: '560px',
            margin: '0 auto',
          }}>
            Jika parcel anda rosak semasa penghantaran, kami akan gantikan unit baru serta-merta tanpa sebarang caj tambahan. Pasukan kami sentiasa bersedia membimbing cara penggunaan terbaik melalui WhatsApp.
          </p>
        </div>

      </div>
    </section>
  );
}

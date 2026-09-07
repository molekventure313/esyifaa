'use client';

export default function SabunGuaranteeSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#FFFFFF',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      textAlign: 'center',
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        <div style={{
          background: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: '20px',
          padding: '2.5rem 2rem',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.05)',
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '1.5px solid #A7F3D0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            margin: '0 auto 1.25rem auto',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)',
          }}>
            🛡️
          </div>

          <span style={{
            display: 'inline-block',
            fontSize: '0.76rem',
            fontWeight: 700,
            color: '#047857',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '0.4rem',
          }}>
            Jaminan Kepuasan Pelanggan
          </span>

          <h2 style={{
            fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0.2rem 0 0.75rem',
            letterSpacing: '-0.02em',
          }}>
            Beli Dengan Tenang & Yakin
          </h2>

          <p style={{
            fontSize: '0.94rem',
            color: '#475569',
            lineHeight: 1.7,
            maxWidth: '560px',
            margin: '0 auto',
          }}>
            Jika parcel anda mengalami sebarang kerosakan semasa penghantaran, kami akan gantikan unit baharu serta-merta tanpa sebarang caj tambahan. Pasukan kami sentiasa bersedia membimbing cara penggunaan terbaik melalui WhatsApp.
          </p>
        </div>

      </div>
    </section>
  );
}

'use client';

export default function PengisianClosingSection() {
  const scrollToForm = (e) => {
    e.preventDefault();
    const target = document.getElementById('borang');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)',
      color: '#0F172A',
      padding: '5rem 1.25rem',
      fontFamily: ff,
      textAlign: 'center',
      borderTop: '1px solid #BBF7D0',
    }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        
        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>
          💎🤲🏻🛡️
        </span>

        <span style={{
          display: 'inline-block',
          background: '#FFFFFF', border: '1.5px solid #86EFAC',
          color: '#065F46', padding: '0.4rem 1.15rem', borderRadius: '50px',
          fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.04em',
          textTransform: 'uppercase', marginBottom: '1.25rem',
          boxShadow: '0 2px 8px rgba(5, 150, 105, 0.08)',
        }}>
          💎 Jangan Biarkan Diri Terus Ditindas
        </span>

        <h2 style={{
          fontSize: 'clamp(1.65rem, 4vw, 2.5rem)',
          fontWeight: 900, color: '#0F172A',
          marginTop: '0.25rem', marginBottom: '1rem',
          letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>
          Kembalikan Ketenangan Hidup Anda &amp; Keluarga Hari Ini
        </h2>

        <p style={{
          fontSize: '1.05rem', color: '#475569',
          lineHeight: 1.8, marginBottom: '2.5rem',
          maxWidth: '620px', margin: '0 auto 2.5rem auto',
        }}>
          Setiap malam yang berlalu dengan mimpi ngeri dan ketakutan adalah kerugian besar.
          Kini anda ada ikhtiar untuk memegang sendiri benteng ruqyah di tangan anda — siap dalam 3 hari, rawat diri bila-bila masa, dengan jaminan pulangan wang 30 hari penuh.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          {/* FPX Button */}
          <a
            href="#borang"
            onClick={scrollToForm}
            style={{
              display: 'inline-block', padding: '1.2rem 2.8rem',
              fontSize: '1.12rem', fontWeight: 800, color: '#042E23',
              background: 'linear-gradient(180deg, #FDE047 0%, #EAB308 100%)',
              borderRadius: '50px', textDecoration: 'none',
              boxShadow: '0 8px 25px rgba(234, 179, 8, 0.4)',
              border: '2px solid #FEF08A',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            👉🏻 Tempah Pengisian Item Anda Sekarang
          </a>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', maxWidth: '340px', margin: '0.5rem 0' }}>
            <div style={{ flex: 1, borderTop: '1px solid #CBD5E1' }} />
            <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>atau</span>
            <div style={{ flex: 1, borderTop: '1px solid #CBD5E1' }} />
          </div>

          {/* WA Payment Button */}
          <a
            href="https://wa.me/601118939984?text=Assalamualaikum%20ustaz,%20saya%20nak%20buat%20pengisian%20item%20ESyifaa"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.6rem', padding: '0.95rem 2.2rem',
              fontSize: '0.98rem', fontWeight: 800, color: '#FFFFFF',
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              borderRadius: '50px', textDecoration: 'none',
              boxShadow: '0 8px 25px rgba(37,211,102,0.3)',
              border: '2px solid rgba(37,211,102,0.5)',
            }}
          >
            💬 Nak Tanya Perawat / Daftar Di WhatsApp?
          </a>

          <p style={{ marginTop: '0.5rem', fontSize: '0.84rem', color: '#64748B' }}>
            🔒 Jaminan Wang Dikembalikan 100% · Pelarasan Mingguan Percuma
          </p>
        </div>

      </div>
    </section>
  );
}

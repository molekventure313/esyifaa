'use client';

const PROMO_SLOTS_TAKEN = 42;
const TOTAL_PROMO_SLOTS = 50;
const slotsLeft = TOTAL_PROMO_SLOTS - PROMO_SLOTS_TAKEN;
const slotPct = (PROMO_SLOTS_TAKEN / TOTAL_PROMO_SLOTS) * 100;

export default function PengisianPaymentSection() {
  const scrollToForm = (e) => {
    e.preventDefault();
    const target = document.getElementById('borang');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#031E17',
      color: '#FFFFFF',
      padding: '4.5rem 1.25rem 2rem',
      fontFamily: ff,
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Urgency slot bar */}
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1.5px solid rgba(239,68,68,0.4)',
          borderRadius: '16px', padding: '1.25rem 1.6rem', marginBottom: '2.5rem',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem',
          }}>
            <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 800, color: '#FCA5A5', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              🔴 Slot Harga Promosi Pengenalan — {PROMO_SLOTS_TAKEN}/{TOTAL_PROMO_SLOTS} Diambil
            </p>
            <p style={{ margin: 0, fontSize: '0.86rem', fontWeight: 800, color: '#4ADE80' }}>
              Baki {slotsLeft} slot sahaja lagi
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '999px', height: '10px', overflow: 'hidden', marginBottom: '0.65rem' }}>
            <div style={{
              width: `${slotPct}%`, height: '100%',
              background: 'linear-gradient(90deg, #EF4444, #DC2626)',
              borderRadius: '999px',
            }} />
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#FCA5A5', fontStyle: 'italic' }}>
            Selepas {TOTAL_PROMO_SLOTS} slot terawal habis, yuran pengisian akan kembali ke harga asal <strong style={{ color: '#FFFFFF' }}>RM120 seunit</strong>.
          </p>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(253,224,71,0.1)', border: '1px solid rgba(253,224,71,0.4)',
            color: '#FDE047', padding: '0.4rem 1.1rem', borderRadius: '50px',
            fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            💎 Pilihan Pakej Pengisian E-Syifa&apos;
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.5vw, 2.3rem)',
            fontWeight: 800, color: '#FDE047',
            marginTop: '0.4rem', marginBottom: '0.75rem',
            letterSpacing: '-0.02em', lineHeight: 1.25,
          }}>
            Pilih Pakej Anda &amp; Buat Tempahan Jarak Jauh Di Bawah
          </h2>
          <p style={{ fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.7, maxWidth: '640px', margin: '0 auto' }}>
            Satu bayaran upah solat hajat &amp; wirid ruqyah 3 hari. Nikmati pelarasan mingguan percuma selamanya.
          </p>
        </div>

      </div>
    </section>
  );
}

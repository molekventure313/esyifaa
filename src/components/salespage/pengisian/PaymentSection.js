'use client';

const PROMO_SLOTS_TAKEN = 42;
const TOTAL_PROMO_SLOTS = 50;
const slotsLeft = TOTAL_PROMO_SLOTS - PROMO_SLOTS_TAKEN;
const slotPct = (PROMO_SLOTS_TAKEN / TOTAL_PROMO_SLOTS) * 100;

export default function PengisianPaymentSection() {
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  return (
    <section style={{
      background: '#F0FDF4',
      color: '#0F172A',
      padding: '4.5rem 1.25rem 2rem',
      fontFamily: ff,
      borderBottom: '1px solid #BBF7D0',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Urgency slot bar (Light theme with red accent) */}
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #FECACA',
          borderRadius: '18px', padding: '1.4rem 1.8rem', marginBottom: '2.5rem',
          boxShadow: '0 4px 20px rgba(220, 38, 38, 0.06)',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem',
          }}>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              🔴 Slot Promosi Pengenalan — {PROMO_SLOTS_TAKEN}/{TOTAL_PROMO_SLOTS} Diambil
            </p>
            <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: '#059669' }}>
              Baki {slotsLeft} slot sahaja lagi
            </p>
          </div>
          <div style={{ background: '#F1F5F9', borderRadius: '999px', height: '10px', overflow: 'hidden', marginBottom: '0.75rem' }}>
            <div style={{
              width: `${slotPct}%`, height: '100%',
              background: 'linear-gradient(90deg, #EF4444, #DC2626)',
              borderRadius: '999px',
            }} />
          </div>
          <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748B' }}>
            Selepas {TOTAL_PROMO_SLOTS} slot terawal habis, yuran pengisian akan kembali ke harga asal <strong style={{ color: '#DC2626' }}>RM120 seunit</strong>.
          </p>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{
            display: 'inline-block',
            background: '#FFFFFF', border: '1.5px solid #86EFAC',
            color: '#065F46', padding: '0.4rem 1.15rem', borderRadius: '50px',
            fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.04em',
            textTransform: 'uppercase', marginBottom: '1rem',
            boxShadow: '0 2px 8px rgba(5, 150, 105, 0.08)',
          }}>
            💎 Pilihan Pakej Pengisian E-Syifa&apos;
          </span>
          <h2 style={{
            fontSize: 'clamp(1.55rem, 3.5vw, 2.35rem)',
            fontWeight: 900, color: '#064E3B',
            marginTop: '0.3rem', marginBottom: '0.75rem',
            letterSpacing: '-0.02em', lineHeight: 1.25,
          }}>
            Pilih Pakej Anda &amp; Buat Tempahan Jarak Jauh Di Bawah
          </h2>
          <p style={{ fontSize: '1.02rem', color: '#475569', lineHeight: 1.7, maxWidth: '640px', margin: '0 auto' }}>
            Satu bayaran upah wirid ruqyah khusus. Nikmati pelarasan mingguan percuma sehingga perawat mati.
          </p>
        </div>

      </div>
    </section>
  );
}

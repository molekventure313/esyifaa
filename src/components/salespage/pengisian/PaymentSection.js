'use client';

// ─── Slot-based promo config ──────────────────────────────────────────────────
// Admin: kemaskini PROMO_SLOTS_TAKEN bila ada pembeli RM90 baru
const PROMO_SLOTS_TAKEN = 8;
const TOTAL_PROMO_SLOTS = 50;

const slotsLeft = TOTAL_PROMO_SLOTS - PROMO_SLOTS_TAKEN;
const slotPct = (PROMO_SLOTS_TAKEN / TOTAL_PROMO_SLOTS) * 100;

const INCLUDES = [
  { icon: '🔥', text: 'Pengisian Ayat Ruqyah Pembakar & Pemusnah Jin' },
  { icon: '✂️', text: 'Pengisian Ayat Pembatal Sihir' },
  { icon: '🛡️', text: 'Pengisian Ayat Benteng Sihir & Gangguan Jin' },
  { icon: '💚', text: 'Pengisian Ayat-ayat Kesembuhan' },
  { icon: '🔄', text: 'Pelarasan & Pengisian Semula Setiap Minggu (PERCUMA Selamanya)', highlight: true },
  { icon: '📋', text: 'Monitoring Hasil Pengisian (3 hari pertama)' },
  { icon: '📞', text: 'Konsultasi Ringkas Via WhatsApp Sebelum Pengisian' },
];

export default function PengisianPaymentSection() {
  const scrollToForm = (e) => {
    e.preventDefault();
    const target = document.getElementById('borang');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section style={{
      background: '#031E17', color: '#FFFFFF',
      padding: '4rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Urgency slot bar */}
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1.5px solid rgba(239,68,68,0.4)',
          borderRadius: '14px', padding: '1.1rem 1.5rem', marginBottom: '2rem',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem',
          }}>
            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: '#FCA5A5', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              🔴 Slot Harga RM90 — {PROMO_SLOTS_TAKEN}/{TOTAL_PROMO_SLOTS} Diambil
            </p>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#4ADE80' }}>
              {slotsLeft} slot lagi
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '999px', height: '10px', overflow: 'hidden', marginBottom: '0.65rem' }}>
            <div style={{
              width: `${slotPct}%`, height: '100%',
              background: 'linear-gradient(90deg, #EF4444, #DC2626)',
              borderRadius: '999px',
            }} />
          </div>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#FCA5A5', fontStyle: 'italic' }}>
            Selepas {TOTAL_PROMO_SLOTS} slot habis, harga akan naik ke <strong style={{ color: '#FFFFFF' }}>RM120</strong>.
          </p>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(253,224,71,0.1)', border: '1px solid rgba(253,224,71,0.4)',
            color: '#FDE047', padding: '0.4rem 1.1rem', borderRadius: '50px',
            fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            💎 Pakej Pengisian — Harga Pengenalan
          </span>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
            fontWeight: 800, color: '#FDE047',
            marginTop: '0.4rem', marginBottom: '0.75rem',
            letterSpacing: '-0.02em', lineHeight: 1.25,
          }}>
            Satu Pakej. Empat Lapisan Perlindungan.{' '}
            <span style={{ color: '#4ADE80' }}>RM90 Sahaja.</span>
          </h2>
          <p style={{ fontSize: '1rem', color: '#D1FAE5', lineHeight: 1.7, maxWidth: '600px', margin: '0 auto' }}>
            Bayar sekali, nikmati perlindungan seumur hidup dengan pelarasan mingguan automatik dari perawat ESyifaa.
          </p>
        </div>

        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          {/* Card */}
          <div style={{
            background: 'linear-gradient(135deg, #064E3B 0%, #042E23 100%)',
            border: '3px solid rgba(253,224,71,0.5)',
            borderRadius: '24px', overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(253,224,71,0.06)',
          }}>
            {/* Top banner */}
            <div style={{
              background: 'linear-gradient(90deg, #EF4444, #DC2626)',
              color: '#FFFFFF', fontWeight: 800,
              textAlign: 'center', padding: '0.65rem',
              fontSize: '0.85rem', letterSpacing: '0.02em',
            }}>
              🔥 HARGA PENGENALAN — {TOTAL_PROMO_SLOTS} Terawal Sahaja · {slotsLeft} Slot Berbaki
            </div>

            {/* Price area */}
            <div style={{ padding: '2rem', textAlign: 'center', borderBottom: '1px solid rgba(74,222,128,0.2)' }}>
              <div style={{ fontSize: '0.85rem', color: '#6EE7B7', marginBottom: '0.5rem' }}>
                Pakej Pengisian Ayat Ruqyah
              </div>

              {/* Crossed out next price */}
              <div style={{ marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.9rem', color: '#F87171', marginRight: '0.5rem' }}>
                  Harga selepas slot habis:
                </span>
                <span style={{ fontSize: '1.15rem', color: '#F87171', textDecoration: 'line-through', fontWeight: 700 }}>
                  RM120
                </span>
              </div>

              {/* Current promo price */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                <div style={{
                  background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                  color: '#FCA5A5', padding: '0.2rem 0.65rem', borderRadius: '50px',
                  fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase',
                }}>
                  Harga Sekarang
                </div>
                <span style={{ fontSize: '3.5rem', fontWeight: 900, color: '#FDE047', lineHeight: 1 }}>RM90</span>
              </div>

              <p style={{ margin: 0, fontSize: '0.82rem', color: '#A7F3D0' }}>
                Sekali bayar · Pelarasan mingguan percuma selamanya
              </p>
            </div>

            {/* Includes list */}
            <div style={{ padding: '1.75rem 2rem' }}>
              {INCLUDES.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                  marginBottom: i < INCLUDES.length - 1 ? '0.85rem' : 0,
                }}>
                  <span style={{ fontSize: '1.15rem', flexShrink: 0 }}>{item.icon}</span>
                  <span style={{
                    fontSize: '0.9rem', lineHeight: 1.5,
                    color: item.highlight ? '#FDE047' : '#D1FAE5',
                    fontWeight: item.highlight ? 700 : 400,
                  }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA inside card */}
            <div style={{ padding: '0 2rem 2rem' }}>
              <a href="#borang" onClick={scrollToForm} style={{
                display: 'block', textAlign: 'center',
                padding: '1.1rem', borderRadius: '50px',
                fontSize: '1.05rem', fontWeight: 800,
                color: '#042E23',
                background: 'linear-gradient(180deg, #FDE047 0%, #EAB308 100%)',
                textDecoration: 'none',
                boxShadow: '0 8px 25px rgba(234,179,8,0.4)',
                border: '2px solid #FEF08A',
              }}>
                💎 Tempah Pengisian RM90 Sekarang
              </a>
            </div>
          </div>

          {/* Urgency note */}
          <div style={{
            marginTop: '1.25rem', textAlign: 'center',
            background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '12px', padding: '0.9rem 1.25rem',
          }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#FCA5A5', lineHeight: 1.6, fontWeight: 600 }}>
              ⚠️ Harga RM90 adalah <strong style={{ color: '#FDE047' }}>harga pengenalan — {TOTAL_PROMO_SLOTS} pembeli terawal sahaja</strong>.
              Selepas slot habis, harga naik ke <strong style={{ color: '#F87171' }}>RM120</strong>. Jangan lepaskan peluang ini.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

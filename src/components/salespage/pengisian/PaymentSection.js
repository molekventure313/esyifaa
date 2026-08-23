'use client';

import { useState, useEffect } from 'react';

// ─── Countdown to 31 August 2026 (end of day MYT) ────────────────────────────
const DEADLINE = new Date('2026-08-31T23:59:59+08:00').getTime();

function useCountdown() {
  const calc = () => {
    const diff = DEADLINE - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

// ─── Countdown Box ────────────────────────────────────────────────────────────
function CountdownBox({ value, label }) {
  return (
    <div style={{ textAlign: 'center', minWidth: '54px' }}>
      <div style={{
        fontSize: '1.75rem', fontWeight: 900, color: '#FDE047', lineHeight: 1,
        background: 'rgba(253,224,71,0.1)', border: '2px solid rgba(253,224,71,0.35)',
        borderRadius: '10px', padding: '0.5rem 0.6rem', marginBottom: '0.3rem',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {String(value).padStart(2, '0')}
      </div>
      <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#6EE7B7', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </div>
    </div>
  );
}

const INCLUDES = [
  { icon: '🔥', text: 'Pengisian Ayat Ruqyah Pembakar & Pemusnah Jin' },
  { icon: '✂️', text: 'Pengisian Ayat Pembatal Sihir' },
  { icon: '🛡️', text: 'Pengisian Ayat Benteng Sihir & Gangguan Jin' },
  { icon: '💚', text: 'Pengisian Ayat-ayat Kesembuhan' },
  { icon: '🔄', text: 'Pelarasan & Pengisian Semula Setiap Minggu (PERCUMA Selamanya)', highlight: true },
  { icon: '📋', text: 'Monitoring Hasil Pengisian (7 hari pertama)' },
  { icon: '📞', text: 'Konsultasi Ringkas Via WhatsApp Sebelum Pengisian' },
];

export default function PengisianPaymentSection() {
  const { days, hours, minutes, seconds } = useCountdown();
  const isExpired = days === 0 && hours === 0 && minutes === 0 && seconds === 0;

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

        {/* Urgency countdown bar */}
        {!isExpired && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1.5px solid rgba(239,68,68,0.4)',
            borderRadius: '14px', padding: '1.1rem 1.5rem', marginBottom: '2rem',
            display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            <div style={{ textAlign: 'center', flex: 1, minWidth: '180px' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: '#FCA5A5', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                ⏳ Harga RM90 Tamat Pada
              </p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '1rem', fontWeight: 900, color: '#FFFFFF' }}>
                31 Ogos 2026 — Lepas tu naik ke RM120
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <CountdownBox value={days} label="Hari" />
              <span style={{ fontSize: '1.5rem', color: '#FDE047', fontWeight: 900, marginBottom: '1.2rem' }}>:</span>
              <CountdownBox value={hours} label="Jam" />
              <span style={{ fontSize: '1.5rem', color: '#FDE047', fontWeight: 900, marginBottom: '1.2rem' }}>:</span>
              <CountdownBox value={minutes} label="Min" />
              <span style={{ fontSize: '1.5rem', color: '#FDE047', fontWeight: 900, marginBottom: '1.2rem' }}>:</span>
              <CountdownBox value={seconds} label="Saat" />
            </div>
          </div>
        )}

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
              🔥 HARGA PENGENALAN — Sehingga 31 Ogos 2026 Sahaja
            </div>

            {/* Price area */}
            <div style={{ padding: '2rem', textAlign: 'center', borderBottom: '1px solid rgba(74,222,128,0.2)' }}>
              <div style={{ fontSize: '0.85rem', color: '#6EE7B7', marginBottom: '0.5rem' }}>
                Pakej Pengisian Ayat Ruqyah
              </div>

              {/* Crossed out original price */}
              <div style={{ marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.9rem', color: '#F87171', marginRight: '0.5rem' }}>
                  Harga asal selepas 31 Ogos:
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
              ⚠️ Harga RM90 adalah <strong style={{ color: '#FDE047' }}>harga pengenalan produk baru</strong> —
              hanya sehingga <strong style={{ color: '#FFFFFF' }}>31 Ogos 2026</strong>.
              Selepas tarikh ini, harga akan naik ke <strong style={{ color: '#F87171' }}>RM120</strong>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import { useState, useEffect } from 'react';

// ─── Promo config ─────────────────────────────────────────────────────────────
// Tukar PROMO_SLOTS_TAKEN bila ada pembeli baru masuk
const PROMO_SLOTS_TAKEN = 7;   // ← Admin: kemaskini bila ada pembeli RM60
const TOTAL_PROMO_SLOTS = 50;

// Deadline harga RM60 — tukar bila perlu
const DEADLINE_RM60 = new Date('2026-09-30T23:59:59+08:00').getTime();

function useCountdown() {
  const calc = () => {
    const diff = DEADLINE_RM60 - Date.now();
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

const PACKAGE_ITEMS = [
  { icon: '🔥', title: 'Video Rawatan Menyeluruh', desc: 'Membersihkan diri dari segala gangguan jin dalam badan' },
  { icon: '⛓️', title: 'Rawatan Memutuskan Ikatan Jin Saka', desc: 'Putuskan ikatan-ikatan perjanjian dengan jin-jin saka' },
  { icon: '🔗', title: 'Rawatan Memutuskan Buhulan Sihir', desc: 'Putuskan segala ikatan & buhulan sihir dalam badan' },
  { icon: '🧲', title: 'Rawatan Pertalian Barang Sihir', desc: 'Putuskan pertalian diri anda dengan barang-barang sihir' },
  { icon: '💧', title: 'Video Air Tawar, Air Mandian & Garam Mandian', desc: 'Buat bekalan air tawar & garam mandian sendiri di rumah' },
  { icon: '🧂', title: 'Video Garam Pagar Rumah', desc: 'Pagar & lindungi rumah dari gangguan jin & sihir' },
  { icon: '🐍', title: 'Rawatan Sakit & Bisa Badan', desc: 'Rawatan khusus bisa-bisa badan yang disebabkan jin' },
  { icon: '🛡️', title: 'Rawatan Pagar, Benteng & Perlindungan Diri', desc: 'Perlindungan menyeluruh dari serangan jin, sihir & gangguan' },
  { icon: '⭐', title: 'Amalan Ringkas Harian', desc: 'BONUS: Booster pendinding — amalan harian untuk kekalkan perlindungan', isBonus: true },
];

const slotsLeft = TOTAL_PROMO_SLOTS - PROMO_SLOTS_TAKEN;
const slotPct = (PROMO_SLOTS_TAKEN / TOTAL_PROMO_SLOTS) * 100;

const TIERS = [
  { price: 'RM60', label: '50 Terawal', tag: 'SEKARANG', active: true },
  { price: 'RM90', label: 'Selepas 50 slot pertama', tag: 'AKAN DATANG', active: false },
  { price: 'RM150', label: 'Harga Tetap', tag: 'AKAN DATANG', active: false },
];

export default function EVideoPaymentSection() {
  const { days, hours, minutes, seconds } = useCountdown();
  const isExpired = days === 0 && hours === 0 && minutes === 0 && seconds === 0;

  const scrollToForm = (e) => {
    e.preventDefault();
    const target = document.getElementById('borang');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section style={{
      background: 'linear-gradient(180deg, #021812 0%, #042E23 100%)',
      color: '#FFFFFF', padding: '4rem 1rem',
      fontFamily: 'var(--font-inter), -apple-system, sans-serif',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>

        {/* ── Countdown urgency bar ────────────────────────────── */}
        {!isExpired && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1.5px solid rgba(239,68,68,0.4)',
            borderRadius: '14px', padding: '1.1rem 1.5rem', marginBottom: '2rem',
            display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            <div style={{ textAlign: 'center', flex: 1, minWidth: '180px' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: '#FCA5A5', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                ⏳ Harga RM60 Untuk {TOTAL_PROMO_SLOTS} Terawal Sahaja
              </p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.95rem', fontWeight: 900, color: '#FFFFFF' }}>
                Slot diambil: {PROMO_SLOTS_TAKEN}/{TOTAL_PROMO_SLOTS} · {slotsLeft} slot lagi pada harga ini
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

        {/* ── Header ─────────────────────────────────────────────── */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(253,224,71,0.12)', border: '1px solid #FDE047',
          padding: '0.4rem 1.1rem', borderRadius: '50px', marginBottom: '1.25rem',
          fontSize: '0.78rem', fontWeight: 800, color: '#FDE047',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          🎬 Pakej E-Video — Harga Pengenalan Produk Baru
        </div>

        <h2 style={{
          fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
          fontWeight: 800, color: '#FEF3C7',
          marginTop: '0.4rem', marginBottom: '0.5rem',
          letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>
          Pakej E-Video Rawatan ESyifaa
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#A7F3D0', marginBottom: '2rem' }}>
          8 video rawatan + 1 amalan bonus — harga akan terus naik mengikut fasa.
        </p>

        {/* ── Price tiers ──────────────────────────────────────── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem', marginBottom: '2rem',
        }}>
          {TIERS.map((tier, i) => (
            <div key={i} style={{
              background: tier.active
                ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                : 'rgba(255,255,255,0.04)',
              border: tier.active
                ? '2px solid #FCA5A5'
                : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '14px', padding: '1rem 0.75rem',
              position: 'relative', overflow: 'hidden',
            }}>
              {tier.active && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  background: '#FDE047', color: '#7F1D1D',
                  fontSize: '0.6rem', fontWeight: 900, textAlign: 'center',
                  padding: '0.2rem', letterSpacing: '0.08em',
                }}>
                  ✅ HARGA SEKARANG
                </div>
              )}
              <div style={{ marginTop: tier.active ? '1rem' : 0 }}>
                <div style={{
                  fontSize: '1.65rem', fontWeight: 900,
                  color: tier.active ? '#FFFFFF' : '#475569',
                  lineHeight: 1,
                  textDecoration: tier.active ? 'none' : 'line-through',
                }}>
                  {tier.price}
                </div>
                <div style={{
                  fontSize: '0.72rem', fontWeight: 700,
                  color: tier.active ? 'rgba(255,255,255,0.85)' : '#475569',
                  marginTop: '0.3rem',
                }}>
                  {tier.label}
                </div>
                {!tier.active && (
                  <div style={{
                    fontSize: '0.6rem', fontWeight: 800, color: '#94A3B8',
                    marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em',
                    textDecoration: 'none',
                  }}>
                    {tier.tag}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Slot progress bar ─────────────────────────────────── */}
        <div style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '12px', padding: '1rem 1.25rem',
          marginBottom: '2rem',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.6rem',
          }}>
            <span style={{ color: '#FCA5A5' }}>🔴 Slot Harga RM60 ({PROMO_SLOTS_TAKEN}/{TOTAL_PROMO_SLOTS} diambil)</span>
            <span style={{ color: '#4ADE80' }}>{slotsLeft} slot lagi</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
            <div style={{
              width: `${slotPct}%`, height: '100%',
              background: 'linear-gradient(90deg, #EF4444, #DC2626)',
              borderRadius: '999px', transition: 'width 0.5s',
            }} />
          </div>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', color: '#FCA5A5', fontStyle: 'italic' }}>
            Selepas 50 slot habis, harga akan naik ke RM90 — kemudian ke RM150 harga tetap.
          </p>
        </div>

        {/* ── Main price card ─────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)',
          border: '2px solid #FDE047',
          borderRadius: '24px', overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          marginBottom: '2rem',
          position: 'relative',
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
              Pakej E-Video Rawatan Ruqyah — 8 Video + 1 Bonus
            </div>

            {/* Tier progression display */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.9rem', color: '#F87171', textDecoration: 'line-through', fontWeight: 700 }}>RM90</span>
              <span style={{ fontSize: '0.7rem', color: '#6EE7B7' }}>→</span>
              <span style={{ fontSize: '0.9rem', color: '#F87171', textDecoration: 'line-through', fontWeight: 700 }}>RM150</span>
            </div>

            {/* Current price */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <div style={{
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                color: '#FCA5A5', padding: '0.2rem 0.65rem', borderRadius: '50px',
                fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase',
              }}>
                Harga Sekarang
              </div>
              <span style={{ fontSize: '3.5rem', fontWeight: 900, color: '#FDE047', lineHeight: 1 }}>RM60</span>
            </div>

            <p style={{ margin: 0, fontSize: '0.82rem', color: '#A7F3D0' }}>
              Sekali bayar · Guna seumur hidup · Dihantar via WhatsApp
            </p>
          </div>

          {/* Package items */}
          <div style={{ padding: '1.5rem 2rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {PACKAGE_ITEMS.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
                  background: item.isBonus ? 'rgba(253,224,71,0.08)' : 'rgba(255,255,255,0.04)',
                  border: item.isBonus ? '1px solid rgba(253,224,71,0.25)' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px', padding: '0.6rem 0.85rem',
                  position: 'relative',
                }}>
                  {item.isBonus && (
                    <div style={{
                      position: 'absolute', top: '-1px', right: '0.6rem',
                      background: '#FDE047', color: '#042E23',
                      fontSize: '0.58rem', fontWeight: 900,
                      padding: '0.1rem 0.55rem', borderRadius: '0 0 5px 5px',
                      letterSpacing: '0.05em', textTransform: 'uppercase',
                    }}>
                      BONUS
                    </div>
                  )}
                  <span style={{ fontSize: '1rem', flexShrink: 0, lineHeight: 1.5 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: item.isBonus ? '#FDE047' : '#FEF3C7', lineHeight: 1.3 }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#A7F3D0', lineHeight: 1.4, marginTop: '0.1rem' }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
              🎬 Tempah Pakej E-Video RM60 Sekarang
            </a>
          </div>
        </div>

        {/* Urgency note */}
        <div style={{
          background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '12px', padding: '0.9rem 1.25rem', marginBottom: '1.5rem',
        }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#FCA5A5', lineHeight: 1.6, fontWeight: 600 }}>
            ⚠️ Harga <strong style={{ color: '#FDE047' }}>RM60</strong> adalah{' '}
            <strong style={{ color: '#FDE047' }}>harga pengenalan produk baru</strong>{' '}
            untuk {TOTAL_PROMO_SLOTS} pembeli terawal sahaja.
            Selepas slot habis, harga naik ke <strong style={{ color: '#F87171' }}>RM90</strong>{' '}
            — kemudian naik semula ke <strong style={{ color: '#F87171' }}>RM150</strong> harga tetap.
          </p>
        </div>

        {/* Delivery info */}
        <div style={{
          background: 'rgba(96,165,250,0.07)',
          border: '1px solid rgba(96,165,250,0.2)',
          borderRadius: '14px', padding: '1.25rem 1.5rem',
          display: 'flex', gap: '0.85rem', alignItems: 'flex-start', textAlign: 'left',
        }}>
          <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>📱</span>
          <div>
            <div style={{ fontWeight: 800, color: '#60A5FA', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
              Cara Terima Pakej E-Video
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#D1FAE5', lineHeight: 1.65 }}>
              Selepas bayaran berjaya, perawat ESyifaa akan hubungi anda melalui{' '}
              <strong style={{ color: '#FEF3C7' }}>WhatsApp dalam masa 24 jam</strong>{' '}
              dan hantar semua video rawatan secara langsung.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}

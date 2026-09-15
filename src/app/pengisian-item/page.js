'use client';

import { useState, useEffect } from 'react';

// ─── Config ───────────────────────────────────────────────────────────────────
const FALLBACK_WA = '601135172611';
const WA_MSG      = encodeURIComponent('Saya nak buat pengisian item RM90');
const LS_KEY      = 'esyifaa_wa_idx';
const ff          = "var(--font-inter), -apple-system, sans-serif";

const buildLink = (n) => `https://wa.me/${n}?text=${WA_MSG}`;

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: 'Hana S.', location: 'Kuala Lumpur', time: 'Semalam',
    tag: '👻 Gangguan Berulang → Boleh Rawat Sendiri',
    text: '"Sebelum ni sy mmg penat sgt, asal balik berubat kat luar je rasa lega sekejap tapi bila smpai rumah gangguan tu masuk balik. Lepas ada tasbih ni dan sy amalkan ikut cara ustaz ajar bila rasa seram sejuk, masyaAllah terus rasa lapang bdan! Gangguan x berani dekat langsung skrg. Puas hati sgt dpt ikhtiar sndiri kat umah 👍"',
  },
  {
    name: 'Aisyah K.', location: 'Melaka', time: '3 hari lepas',
    tag: '🌙 Kena Tindih Jam 3 Pagi → Selesai < 5 Minit',
    text: '"Malam td kul 3.30 pagi tibe2 dada rse kena hempap tindih mcm dlu. Kalau dlu mampus nk tggu pagi baru cari ustaz. Ni sy terus capai minyak wangi ruqyah tu n sapu ikut cara ustaz ajar, x smpai 5 minit terus lapang dada n dpt tido lena smpai subuh! Mmg btol kata ustaz, x payah susah2 tggu perawat lg bila ada alat ikhtiar sndiri kat tgn 🙏"',
  },
  {
    name: 'Salmah N.', location: 'Pahang', time: '2 minggu lepas',
    tag: '💰 Berhenti Bakar Duit Berubat Luar',
    text: '"Ikhlas ckp mmg jimat byk. Sblom ni entah bpe ribu habis melayang asyik bayar yuran rawatan luar asal gangguan datang balik. Skrg bila ada item pengisian ni, rse berbaloi sgt skali bayar je sy dah ada alat ikhtiar sndiri kat rumah. Bila anak demam pelik ke bdan sy sengal ke, terus guna item ni rawat sndiri smpai sembuh 👍"',
  },
  {
    name: 'Ummi R.', location: 'Ipoh, Perak', time: '6 hari lepas',
    tag: '👧 Anak Histeria → Tidur Lena',
    text: '"Sy buatkan pengisian rantai utk anak sy. Sy ajar dia cara amalkan bila rasa gelisah. Alhamdulillah dah masuk 2 mggu dia ckp dah x nampak kelibat menakutkan n tido nyenyak sgt kat dorm. Sy kat rumah pon dah x risau dah syukur ya Allah 🤲"',
  },
];

// ─── WA Button ────────────────────────────────────────────────────────────────
function WABtn({ href, label = '🟢 Tempah Pengisian Via WhatsApp →', full = false }) {
  return (
    <a
      href={href} target="_blank" rel="noopener noreferrer"
      onClick={() => { try { window.fbq('track', 'Lead'); } catch (_) {} }}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: '0.55rem',
        width: full ? '100%' : undefined,
        padding: '1.1rem 2rem',
        fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF',
        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
        borderRadius: '50px', textDecoration: 'none',
        boxShadow: '0 8px 28px rgba(37,211,102,0.45)',
        border: '2px solid rgba(255,255,255,0.2)',
        letterSpacing: '-0.01em', fontFamily: ff,
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      {label}
    </a>
  );
}

// ─── Testimonial Card ─────────────────────────────────────────────────────────
function TestiCard({ t }) {
  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #E2E8F0',
      borderRadius: '16px', overflow: 'hidden',
      boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        background: '#F0FDF4', borderBottom: '1px solid #E2E8F0',
        padding: '0.7rem 1rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: 700, color: '#fff',
          }}>{t.name.charAt(0)}</div>
          <div>
            <div style={{ fontSize: '0.83rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>{t.name}</div>
            <div style={{ fontSize: '0.69rem', color: '#64748B' }}>📍 {t.location}</div>
          </div>
        </div>
        <div style={{ fontSize: '0.69rem', color: '#94A3B8' }}>{t.time}</div>
      </div>
      <div style={{ padding: '1rem', flex: 1 }}>
        <div style={{
          background: '#F8FAFC', borderRadius: '10px', padding: '0.85rem',
          borderLeft: '3px solid #10B981', marginBottom: '0.75rem',
        }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155', lineHeight: 1.6, fontStyle: 'italic' }}>{t.text}</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.2rem', marginTop: '0.4rem' }}>
            <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>{t.time}</span>
            <span style={{ fontSize: '0.7rem', color: '#10B981' }}>✓✓</span>
          </div>
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          background: '#ECFDF5', border: '1px solid #A7F3D0',
          color: '#047857', fontSize: '0.72rem', fontWeight: 700,
          padding: '0.22rem 0.65rem', borderRadius: '9999px',
        }}>{t.tag}</span>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function PengisianItemPage() {
  const [waLink, setWaLink] = useState(buildLink(FALLBACK_WA));

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch('/api/public/wasap');
        const json = await res.json();
        const nums = json.success && json.data?.length > 0
          ? json.data.map(d => d.number)
          : [FALLBACK_WA];
        const idx  = (parseInt(localStorage.getItem(LS_KEY) || '0', 10) + 1) % nums.length;
        localStorage.setItem(LS_KEY, String(idx));
        setWaLink(buildLink(nums[idx]));
      } catch { /* fallback kekal */ }
    })();
  }, []);

  return (
    <main style={{ minHeight: '100vh', background: '#042E23', fontFamily: ff }}>

      {/* ── HERO ──────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(180deg, #021812 0%, #042E23 100%)',
        padding: 'clamp(3rem, 8vw, 5rem) 1.25rem clamp(2.5rem, 6vw, 4rem)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>

          {/* Brand */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#A7F3D0', letterSpacing: '0.06em' }}>
              🌿 ESyifaa&apos;
            </span>
          </div>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'rgba(253,224,71,0.12)', border: '1px solid rgba(253,224,71,0.4)',
            padding: '0.35rem 1rem', borderRadius: '50px', marginBottom: '1.25rem',
            fontSize: '0.74rem', fontWeight: 800, color: '#FDE047',
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            💎 Pengisian Item Ayat Ruqyah
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(1.75rem, 5.5vw, 2.9rem)',
            fontWeight: 900, color: '#FEF3C7',
            lineHeight: 1.2, letterSpacing: '-0.025em',
            margin: '0 0 0.85rem',
          }}>
            Mula Rawat Diri Sendiri<br />
            <span style={{
              background: 'linear-gradient(90deg, #FDE047, #4ADE80)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Guna Item Pengisian
            </span>
          </h1>

          {/* Subtext */}
          <p style={{
            fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
            color: '#A7F3D0', lineHeight: 1.7,
            margin: '0 auto 2rem', maxWidth: '500px',
          }}>
            Tak perlu lagi bergantung pada perawat untuk kes berulang
          </p>

          {/* CTA */}
          <WABtn href={waLink} full />

          {/* Micro-trust */}
          <p style={{ fontSize: '0.78rem', color: '#4ADE80', marginTop: '0.85rem', fontStyle: 'italic' }}>
            Balas dalam 30 minit · Isnin–Ahad · 100% Patuh Syariah
          </p>
        </div>
      </section>

      {/* ── TRUST STRIP ──────────────────────────────── */}
      <section style={{ background: '#031E17', padding: '1.25rem 1.25rem' }}>
        <div style={{
          maxWidth: '640px', margin: '0 auto',
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.6rem',
        }}>
          {[
            '✅ 100% Ayat Al-Quran',
            '🌍 Rawatan Jarak Jauh',
            '🔄 Pelarasan Mingguan Percuma',
            '🛡️ Jaminan Refund',
          ].map((t, i) => (
            <span key={i} style={{
              background: 'rgba(167,243,208,0.07)', border: '1px solid rgba(167,243,208,0.2)',
              color: '#A7F3D0', fontSize: '0.78rem', fontWeight: 600,
              padding: '0.3rem 0.85rem', borderRadius: '999px',
            }}>{t}</span>
          ))}
        </div>
      </section>

      {/* ── TESTIMONI ─────────────────────────────────── */}
      <section style={{ background: '#F8FAF9', padding: 'clamp(2.5rem, 6vw, 4rem) 1.25rem' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{
              display: 'inline-block',
              background: '#fff', border: '1px solid #A7F3D0',
              color: '#047857', padding: '0.3rem 0.9rem', borderRadius: '9999px',
              fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.05em', marginBottom: '0.7rem',
            }}>💬 Mereka Dah Cuba</span>
            <h2 style={{
              fontSize: 'clamp(1.35rem, 3.5vw, 1.9rem)',
              fontWeight: 800, color: '#0F172A',
              margin: '0.2rem 0 0.4rem', letterSpacing: '-0.02em',
            }}>Apa Kata Mereka Yang Dah Ikhtiar Sendiri</h2>
            <p style={{ fontSize: '0.9rem', color: '#64748B', margin: 0 }}>
              Mesej WhatsApp terus dari pelanggan — dengan izin Allah.
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: '1rem',
          }}>
            {TESTIMONIALS.map((t, i) => <TestiCard key={i} t={t} />)}
          </div>
        </div>
      </section>

      {/* ── HARGA + BARANG + CTA ──────────────────────── */}
      <section style={{
        background: 'linear-gradient(180deg, #021812 0%, #042E23 100%)',
        padding: 'clamp(2.5rem, 6vw, 4.5rem) 1.25rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>

          <span style={{
            fontSize: '0.74rem', fontWeight: 800, color: '#FDE047',
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>💎 Pakej Pengisian — 4 Lapisan Ayat Ruqyah</span>

          {/* Price card */}
          <div style={{
            background: 'linear-gradient(135deg, #064E3B 0%, #042E23 100%)',
            border: '2px solid #FDE047', borderRadius: '20px',
            padding: '2rem 1.75rem', margin: '1.25rem 0 1.5rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          }}>
            <div style={{ fontSize: 'clamp(3rem, 10vw, 4.5rem)', fontWeight: 900, color: '#FDE047', lineHeight: 1 }}>
              RM90
            </div>
            <div style={{ fontSize: '0.9rem', color: '#A7F3D0', marginTop: '0.35rem', marginBottom: '1.5rem' }}>
              Sekali bayar · Pelarasan mingguan percuma selamanya
            </div>

            {/* Items */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center', marginBottom: '1.75rem' }}>
              {['💍 Cincin', '📿 Tasbih', '⌚ Jam Tangan', '📿 Gelang', '🔗 Rantai', '🧴 Minyak Wangi', '💧 Air Penawar', '🔑 Barang Lain'].map((item, i) => (
                <span key={i} style={{
                  background: 'rgba(253,224,71,0.12)', border: '1px solid rgba(253,224,71,0.35)',
                  color: '#FEF3C7', fontSize: '0.8rem', fontWeight: 600,
                  padding: '0.28rem 0.75rem', borderRadius: '999px',
                }}>{item}</span>
              ))}
            </div>

            <WABtn href={waLink} label="💬 Tempah Pengisian RM90 Via WhatsApp →" full />
          </div>

          {/* Steps */}
          <div style={{ textAlign: 'left' }}>
            {[
              'Klik butang WhatsApp di atas',
              'Beritahu item yang nak dibuat pengisian',
              'Perawat bagi arahan bayaran & proses pengisian',
            ].map((step, i) => (
              <div key={i} style={{
                display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                marginBottom: i < 2 ? '0.65rem' : 0,
              }}>
                <span style={{
                  width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                  background: '#FDE047', color: '#042E23',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 900,
                }}>{i + 1}</span>
                <span style={{ fontSize: '0.875rem', color: '#D1FAE5', lineHeight: 1.55 }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────── */}
      <footer style={{
        background: '#010E09', color: '#4B5563',
        padding: '1.25rem 1rem', textAlign: 'center',
        fontSize: '0.78rem', lineHeight: 1.6,
      }}>
        © {new Date().getFullYear()} ESyifaa · Pengisian berasaskan Al-Quran &amp; Sunnah Nabi SAW · Tiada unsur syirik.
      </footer>

      {/* ── STICKY WA ─────────────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(2,24,18,0.96)',
        borderTop: '1px solid rgba(37,211,102,0.25)',
        padding: '0.75rem 1.25rem',
        display: 'flex', justifyContent: 'center',
        zIndex: 999, boxShadow: '0 -6px 25px rgba(0,0,0,0.5)',
      }}>
        <a
          href={waLink} target="_blank" rel="noopener noreferrer"
          onClick={() => { try { window.fbq('track', 'Lead'); } catch (_) {} }}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.5rem', width: '100%', maxWidth: '420px',
            padding: '0.85rem 1.5rem', fontSize: '0.95rem', fontWeight: 800,
            color: '#FFFFFF',
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            borderRadius: '50px', textDecoration: 'none',
            boxShadow: '0 4px 15px rgba(37,211,102,0.4)',
            border: '2px solid rgba(255,255,255,0.18)',
            fontFamily: ff,
          }}
        >
          🟢 Tempah Pengisian Via WhatsApp →
        </a>
      </div>

    </main>
  );
}

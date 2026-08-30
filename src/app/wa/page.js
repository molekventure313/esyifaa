'use client';

import { useState, useEffect } from 'react';
import FspRuqyahTestSection from '@/components/salespage/fsp/RuqyahTestSection';

// ─── Config ──────────────────────────────────────────────────────────────────
const FALLBACK_NUMBER = '601135172611';
const WA_MESSAGE = encodeURIComponent('Assalamualaikum, saya ingin mendapatkan rawatan ESyifaa. Boleh bantu saya?');
const buildWaLink = (num) => `https://wa.me/${num}?text=${WA_MESSAGE}`;
const LS_KEY = 'esyifaa_wa_idx';

// ─── WhatsApp Button ──────────────────────────────────────────────────────────
function WAButton({ label = '🟢 Hubungi ESyifaa Sekarang', id = 'cta-wa', size = 'large', href = '#' }) {
  const handleClick = () => {
    try { window.fbq('track', 'Lead'); } catch (_) {}
  };

  const isLarge = size === 'large';
  return (
    <a
      id={id}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: '0.6rem',
        padding: isLarge ? '1.1rem 2rem' : '0.85rem 1.6rem',
        fontSize: isLarge ? '1.05rem' : '0.95rem',
        fontWeight: 800, color: '#FFFFFF',
        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
        borderRadius: '50px', textDecoration: 'none',
        boxShadow: '0 8px 25px rgba(37,211,102,0.5)',
        border: '2px solid rgba(255,255,255,0.25)',
        letterSpacing: '-0.01em',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(37,211,102,0.6)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(37,211,102,0.5)';
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      {label}
    </a>
  );
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'Macam mana rawatan ESyifaa berfungsi?',
    a: 'Rawatan ESyifaa dilakukan secara jarak jauh menggunakan kaedah ruqyah syar\'iyyah — bacaan ayat-ayat Al-Quran dan doa-doa Sunnah Nabi SAW. Perawat akan lakukan rawatan dari jauh dan pesakit akan merasakan kesannya walaupun berada di lokasi yang berbeza.',
  },
  {
    q: 'Berapa lama proses rawatan?',
    a: 'Sesi rawatan biasanya mengambil masa 30-60 minit. Selepas rawatan, perawat akan pantau perkembangan pesakit selama 7 hari dan berikan rawatan susulan percuma jika masih diperlukan.',
  },
  {
    q: 'Rawatan jarak jauh betul ke berkesan?',
    a: 'Ya, rawatan jarak jauh adalah berkesan. Kekuatan bacaan ruqyah syar\'iyyah tidak terhad oleh jarak fizik. Kami sudah membantu 500+ pesakit dari seluruh Malaysia dan luar negara melalui rawatan jarak jauh ini.',
  },
  {
    q: 'Adakah rawatan ESyifaa patuh syariah?',
    a: 'Ya, 100% patuh syariah. Semua rawatan adalah berdasarkan Al-Quran, doa-doa Sunnah Nabi SAW dan tiada unsur syirik sama sekali. Kami tidak menggunakan sebarang kaedah bomoh, jampi atau perkara yang dilarang Islam.',
  },
  {
    q: 'Berapa kos rawatan ESyifaa?',
    a: 'Rawatan penuh hanya RM50 sahaja — sekali bayar, ikhtiar sampai sembuh, in shaa Allah. Termasuk monitoring 7 hari, rawatan susulan percuma, air tawar, garam mandian & garam pagar rumah. Tiada caj tersembunyi.',
  },
];

function FAQItem({ q, a, isOpen, onToggle }) {
  return (
    <div style={{
      background: '#042E23', border: isOpen ? '2px solid #FDE047' : '1px solid rgba(253,224,71,0.2)',
      borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.15s ease',
    }}>
      <button onClick={onToggle} style={{
        width: '100%', padding: '1rem 1.25rem', background: 'transparent', border: 'none',
        textAlign: 'left', fontWeight: 800, fontSize: '0.95rem',
        color: isOpen ? '#FDE047' : '#FEF3C7', cursor: 'pointer',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
        fontFamily: 'var(--font-inter), -apple-system, sans-serif',
      }}>
        <span>{q}</span>
        <span style={{ fontSize: '1.4rem', color: '#FDE047', flexShrink: 0, lineHeight: 1 }}>{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div style={{
          padding: '0 1.25rem 1rem 1.25rem', fontSize: '0.875rem', color: '#D1FAE5',
          lineHeight: 1.65, borderTop: '1px solid rgba(253,224,71,0.15)',
          paddingTop: '0.85rem',
        }}>
          {a}
        </div>
      )}
    </div>
  );
}

// ─── Symptoms ─────────────────────────────────────────────────────────────────
const SYMPTOMS = [
  'Mimpi buruk atau tidur terganggu hampir setiap malam',
  'Badan rasa berat, penat tidak berasas atau sering sakit tanpa punca',
  'Emosi tidak stabil — mudah marah, sedih atau cemas tanpa sebab',
  'Rezeki terasa sempit walaupun sudah berusaha keras',
  'Hubungan rumahtangga atau keluarga makin renggang',
  'Rasa ada sesuatu yang "ikut" atau mata sering terasa berat',
  'Sudah pergi hospital tapi doktor kata tiada masalah',
  'Gangguan berulang walaupun dah pernah dirawat',
];

// ─── After-sales ──────────────────────────────────────────────────────────────
const AFTER_SALES = [
  { icon: '💧', title: 'Isian Air Tawar Percuma', desc: 'Unlimited refill — boleh minta bila-bila masa diperlukan.' },
  { icon: '🧂', title: 'Isian Garam Mandian Percuma', desc: 'Garam mandian berisian untuk membantu proses pembersihan.' },
  { icon: '🏠', title: 'Isian Garam Pagar Percuma', desc: 'Perlindungan rumah dengan garam pagar berisian tanpa bayaran tambahan.' },
  { icon: '📋', title: 'Monitoring 7 Hari', desc: 'Perawat pantau perkembangan pesakit selama 7 hari selepas rawatan.' },
  { icon: '🔄', title: 'Rawatan Susulan Percuma', desc: 'Jika masih diperlukan, rawatan susulan diberikan tanpa kos tambahan.' },
];

const COVERED = ['Sihir', 'Saka', 'Gangguan Jin', 'Asyik', 'Badi', 'Sumpahan', 'Penyakit Misteri', 'Perniagaan Tersekat'];

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function WaPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [showSticky, setShowSticky] = useState(false);
  const [waLink, setWaLink] = useState(buildWaLink(FALLBACK_NUMBER));
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  useEffect(() => {
    const initWaRotation = async () => {
      try {
        const res = await fetch('/api/public/wasap');
        const json = await res.json();
        const numbers = (json.success && json.data?.length > 0)
          ? json.data.map(d => d.number)
          : [FALLBACK_NUMBER];
        const lastIdx = parseInt(localStorage.getItem(LS_KEY) || '0', 10);
        const nextIdx = (lastIdx + 1) % numbers.length;
        localStorage.setItem(LS_KEY, String(nextIdx));
        setWaLink(buildWaLink(numbers[nextIdx]));
      } catch {
        setWaLink(buildWaLink(FALLBACK_NUMBER));
      }
    };
    initWaRotation();

    const handleScroll = () => setShowSticky(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main style={{ minHeight: '100vh', background: '#042E23', fontFamily: ff }}>

      {/* ══════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(180deg, #021812 0%, #042E23 100%)', padding: '3.5rem 1rem 3rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(37,211,102,0.12)', border: '1px solid #25D366',
            padding: '0.4rem 1.1rem', borderRadius: '50px', marginBottom: '1.5rem',
            fontSize: '0.78rem', fontWeight: 800, color: '#25D366',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            🌿 ESyifaa · Rawatan Ruqyah Syar&apos;iyyah
          </div>

          {/* H1 */}
          <h1 style={{
            fontSize: 'clamp(1.7rem, 5vw, 2.8rem)',
            fontWeight: 900, color: '#FEF3C7',
            lineHeight: 1.2, letterSpacing: '-0.02em',
            marginBottom: '1rem',
          }}>
            Rawat Gangguan Jin, Sihir &amp; Saka{' '}
            <span style={{
              background: 'linear-gradient(90deg, #FDE047, #25D366)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Serendah RM50
            </span>
          </h1>

          <p style={{
            fontSize: '1.05rem', color: '#A7F3D0', lineHeight: 1.75,
            marginBottom: '1rem', maxWidth: '560px', margin: '0 auto 1rem auto',
          }}>
            Badan rasa tak kena, tidur terganggu, hidup rasa tersekat?
            Ini bukan perkara kecil.{' '}
            <strong style={{ color: '#FEF3C7' }}>
              Rawatan ruqyah syar&apos;iyyah ESyifaa — ikhtiar sampai sembuh, in shaa Allah.
            </strong>
          </p>

          {/* Trust pills */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
            gap: '0.5rem', margin: '0.85rem auto 1.75rem',
          }}>
            {[
              '✅ 100% Patuh Syariah',
              '🌍 Rawatan Jarak Jauh',
              '500+ Pesakit Dibantu',
              '🔒 Jaminan Refund',
            ].map((p, i) => (
              <span key={i} style={{
                background: 'rgba(167,243,208,0.1)', border: '1px solid rgba(167,243,208,0.25)',
                color: '#A7F3D0', fontSize: '0.8rem', fontWeight: 600,
                padding: '0.3rem 0.85rem', borderRadius: '999px',
              }}>{p}</span>
            ))}
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <WAButton id="cta-hero" label="🟢 Hubungi ESyifaa — Rawatan RM50 Sekarang" href={waLink} />
          </div>
          <p style={{ fontSize: '0.8rem', color: '#6EE7B7', fontStyle: 'italic' }}>
            Balas dalam masa 30 minit · Isnin hingga Ahad · Melalui WhatsApp
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2 — SIMPTOM CHECKLIST
      ══════════════════════════════════════════ */}
      <section style={{ background: '#042E23', padding: '3.5rem 1rem' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{
              display: 'inline-block', background: 'rgba(253,224,71,0.1)',
              border: '1px solid rgba(253,224,71,0.4)', color: '#FDE047',
              padding: '0.35rem 1rem', borderRadius: '50px',
              fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em',
              textTransform: 'uppercase', marginBottom: '0.85rem',
            }}>
              ⚠️ Adakah Anda Mengalami Ini?
            </span>
            <h2 style={{
              fontSize: 'clamp(1.35rem, 3.5vw, 2rem)', fontWeight: 800,
              color: '#FEF3C7', letterSpacing: '-0.02em', lineHeight: 1.25,
              marginTop: '0.4rem', marginBottom: '0.6rem',
            }}>
              8 Tanda Anda Mungkin Mengalami Gangguan Spiritual
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#A7F3D0', lineHeight: 1.65, margin: 0 }}>
              Jika anda alami 3 atau lebih simptom ini, jangan tangguh lagi — hubungi perawat ESyifaa sekarang.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {SYMPTOMS.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.85rem',
                background: '#031E17', borderRadius: '10px',
                padding: '0.85rem 1.1rem',
                border: '1px solid rgba(74,222,128,0.15)',
              }}>
                <span style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: 'rgba(253,224,71,0.15)', border: '2px solid #FDE047',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: '0.75rem', color: '#FDE047', fontWeight: 900,
                }}>✓</span>
                <span style={{ fontSize: '0.875rem', color: '#FEF3C7', lineHeight: 1.45 }}>{s}</span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ fontSize: '0.9rem', color: '#FCA5A5', fontWeight: 700, marginBottom: '1.25rem' }}>
              Semakin lama dibiarkan, semakin sukar untuk ditangani. Jangan tunggu ia bertambah teruk.
            </p>
            <WAButton id="cta-symptom" label="🟢 Hubungi Perawat ESyifaa Sekarang" href={waLink} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2b — TEST AIR SENDIRI
      ══════════════════════════════════════════ */}
      <FspRuqyahTestSection />

      {/* ══════════════════════════════════════════
          SECTION 3 — PAKEJ RAWATAN RM50
      ══════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(180deg, #021812 0%, #042E23 100%)', padding: '4rem 1rem' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>

          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FDE047', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            PAKEJ RAWATAN
          </span>
          <h2 style={{
            fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
            fontWeight: 800, color: '#FEF3C7',
            marginTop: '0.4rem', marginBottom: '0.5rem', letterSpacing: '-0.02em',
          }}>
            Satu Harga. Satu Ikhtiar.{' '}
            <span style={{ color: '#FDE047' }}>In Shaa Allah Sembuh.</span>
          </h2>
          <p style={{ color: '#A7F3D0', fontSize: '1rem', marginBottom: '2.5rem', lineHeight: 1.7 }}>
            Kami percaya rawatan yang ikhlas tidak perlu membebankan. Bayar sekali sahaja,
            kami akan berusaha bersama anda sehingga pulih — dengan izin Allah.
          </p>

          {/* Price card */}
          <div style={{ maxWidth: '520px', margin: '0 auto' }}>
            <div style={{
              background: 'linear-gradient(135deg, #065F46 0%, #047857 50%, #059669 100%)',
              border: '2px solid #FDE047',
              borderRadius: '20px', padding: '2.5rem 2rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(253,224,71,0.2)',
              marginBottom: '1.5rem', position: 'relative', overflow: 'hidden',
            }}>
              {/* Glow */}
              <div style={{
                position: 'absolute', top: '-60px', right: '-60px',
                width: '200px', height: '200px',
                background: 'radial-gradient(circle, rgba(253,224,71,0.15) 0%, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none',
              }} />

              <div style={{
                display: 'inline-block', background: '#FDE047', color: '#042E23',
                fontWeight: 800, fontSize: '0.75rem', padding: '0.3rem 1rem',
                borderRadius: '999px', marginBottom: '1.2rem',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                ✨ Pakej Lengkap — Semua Dalam Satu
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <span style={{ fontSize: 'clamp(3rem, 8vw, 4.5rem)', fontWeight: 900, color: '#FDE047', lineHeight: 1, display: 'block' }}>
                  RM50
                </span>
                <span style={{ fontSize: '1rem', color: '#D1FAE5', fontWeight: 500, display: 'block', marginTop: '0.3rem' }}>
                  Sekali bayar — ikhtiar sampai sembuh, in shaa Allah
                </span>
              </div>

              <div style={{ borderTop: '1px solid rgba(253,224,71,0.3)', margin: '1.5rem 0' }} />

              <p style={{ fontSize: '0.8rem', color: '#A7F3D0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.8rem' }}>
                Merangkumi Semua Kes:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                {COVERED.map((item, i) => (
                  <span key={i} style={{
                    background: 'rgba(253,224,71,0.15)', border: '1px solid rgba(253,224,71,0.4)',
                    color: '#FEF3C7', fontSize: '0.82rem', fontWeight: 600,
                    padding: '0.3rem 0.85rem', borderRadius: '999px',
                  }}>{item}</span>
                ))}
              </div>

              <WAButton id="cta-pricing" label="🟢 Hubungi ESyifaa — Mula Rawatan Anda" href={waLink} />
            </div>

            {/* After-sales */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(253,224,71,0.2)',
              borderRadius: '16px', padding: '2rem 1.5rem', textAlign: 'left',
            }}>
              <p style={{
                textAlign: 'center', fontWeight: 800, fontSize: '1rem', color: '#FDE047',
                marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                🎁 After-Sales Service — Semuanya PERCUMA
              </p>
              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#A7F3D0', marginBottom: '1.5rem' }}>
                Termasuk dalam pakej RM50 — tiada bayaran tambahan.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {AFTER_SALES.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', flexDirection: 'column', gap: '0.5rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(167,243,208,0.15)',
                    borderRadius: '10px', padding: '1rem', position: 'relative',
                  }}>
                    <div style={{
                      position: 'absolute', top: '0.7rem', right: '0.7rem',
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px',
                    }}>
                      <span style={{ fontSize: '0.7rem', color: '#F87171', textDecoration: 'line-through', fontWeight: 700 }}>RM50</span>
                      <span style={{ fontSize: '0.65rem', background: '#22C55E', color: '#fff', fontWeight: 800, padding: '1px 6px', borderRadius: '999px' }}>PERCUMA</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
                      <span style={{ fontSize: '1.6rem', lineHeight: 1, flexShrink: 0 }}>{s.icon}</span>
                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', fontWeight: 700, fontSize: '0.9rem', color: '#FEF3C7', paddingRight: '2.5rem' }}>{s.title}</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#A7F3D0', lineHeight: 1.5 }}>{s.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total value */}
              <div style={{
                marginTop: '1.5rem', borderTop: '1px dashed rgba(253,224,71,0.3)', paddingTop: '1.2rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem',
              }}>
                <p style={{ margin: 0, color: '#D1FAE5', fontSize: '0.9rem', fontWeight: 600 }}>
                  Jumlah nilai keseluruhan perkhidmatan:
                </p>
                <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#F87171', textDecoration: 'line-through', opacity: 0.9 }}>RM300</span>
              </div>
            </div>

            {/* Value banner */}
            <div style={{
              marginTop: '1.5rem',
              background: 'linear-gradient(135deg, #854D0E 0%, #A16207 50%, #CA8A04 100%)',
              border: '2px solid #FDE047', borderRadius: '14px',
              padding: '1.5rem 1.8rem', textAlign: 'center',
              boxShadow: '0 8px 30px rgba(253,224,71,0.2)',
            }}>
              <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.85rem', color: '#FEF9C3', fontWeight: 600 }}>
                Semua perkhidmatan bernilai
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: 900, color: '#FCA5A5', textDecoration: 'line-through', opacity: 0.85 }}>RM300</span>
                <span style={{ fontSize: '1.5rem', color: '#FEF3C7', fontWeight: 800 }}>→</span>
                <span style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: 900, color: '#FDE047' }}>RM50 sahaja</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#FEF9C3', lineHeight: 1.6 }}>
                Anda tidak perlu bayar RM300. Cukup <strong>bayar RM50</strong> untuk rawatan penuh<br/>
                berserta semua after-sales service — <strong>in shaa Allah, ikhtiar sampai sembuh.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 4 — STATS
      ══════════════════════════════════════════ */}
      <section style={{ background: '#0B382D', padding: '2.5rem 1rem' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { num: '500+', label: 'Pesakit Dibantu', icon: '🏥' },
              { num: '100%', label: 'Patuh Syariah', icon: '📖' },
              { num: '98%', label: 'Puas Hati', icon: '⭐' },
              { num: 'RM50', label: 'Kos Rawatan', icon: '💰' },
            ].map((s, i) => (
              <div key={i} style={{
                textAlign: 'center', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(253,224,71,0.2)', borderRadius: '12px',
                padding: '1rem 1.25rem', minWidth: '120px',
              }}>
                <div style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>{s.icon}</div>
                <div style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: 900, color: '#FDE047' }}>{s.num}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#A7F3D0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 5 — TESTIMONI PART 1
      ══════════════════════════════════════════ */}
      <section style={{ background: '#FFFFFF', color: '#0F172A', padding: '3.5rem 1rem' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Testimoni Pesakit (Bahagian 1)
          </span>
          <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', fontWeight: 800, color: '#0F172A', marginTop: '0.4rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Apa Kata Mereka Yang Dah Cuba Rawatan ESyifaa?
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#4B5563', marginBottom: '2rem', lineHeight: 1.6 }}>
            Bukan kami yang cakap — biar pesakit sendiri yang kongsikan pengalaman mereka.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
            {[
              '/images/testimonials/testimoni_1.jpg',
              '/images/testimonials/testimoni_2.jpg',
              '/images/testimonials/testimoni_3.jpg',
              '/images/testimonials/testimoni_part2_1.jpg',
            ].map((src, i) => (
              <div key={i} style={{ borderRadius: '16px', overflow: 'hidden', border: '2px solid #059669', boxShadow: '0 8px 25px rgba(0,0,0,0.08)', background: '#F8FAFC' }}>
                <img src={src} alt={`Testimoni ESyifaa ${i + 1}`} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 6 — KENAPA ESYIFAA
      ══════════════════════════════════════════ */}
      <section style={{ background: '#031E17', padding: '3.5rem 1rem' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FDE047', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Kenapa ESyifaa?
          </span>
          <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', fontWeight: 800, color: '#FDE047', marginTop: '0.4rem', marginBottom: '0.75rem', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
            3 Sebab Ribuan Pesakit Percayakan ESyifaa
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', marginBottom: '2rem' }}>
            {[
              { icon: '📖', title: '100% Ruqyah Syar\'iyyah', desc: 'Semua rawatan berdasarkan Al-Quran dan doa-doa Sunnah Nabi SAW. Tiada ayat karut, tiada bomoh — hanya kaedah yang diiktiraf Islam.' },
              { icon: '🌍', title: 'Rawatan Jarak Jauh — Seluruh Malaysia & Luar Negara', desc: 'Tidak perlu keluar rumah. Rawatan dilakukan secara jarak jauh — berkesan untuk pesakit di mana-mana sahaja di dunia.' },
              { icon: '🛡️', title: 'Jaminan Refund — Tiada Risiko', desc: 'Jaminan refund selepas rawatan jika langsung tiada perubahan. Dijamin bebas unsur khurafat — pengisian 100% menggunakan ayat Al-Quran & asma Allah.' },
            ].map((p, i) => (
              <div key={i} style={{
                display: 'flex', gap: '1rem', alignItems: 'flex-start',
                background: '#042E23', border: '1px solid rgba(253,224,71,0.15)',
                borderRadius: '12px', padding: '1.25rem',
              }}>
                <span style={{
                  fontSize: '1.75rem', flexShrink: 0,
                  background: 'rgba(253,224,71,0.1)', borderRadius: '10px',
                  padding: '0.35rem', display: 'inline-flex', lineHeight: 1,
                }}>{p.icon}</span>
                <div>
                  <div style={{ fontWeight: 800, color: '#FDE047', fontSize: '0.95rem', marginBottom: '0.3rem' }}>{p.title}</div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#D1FAE5', lineHeight: 1.65 }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <WAButton id="cta-why" label="🟢 Hubungi Perawat ESyifaa Sekarang" href={waLink} />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 7 — TESTIMONI PART 2
      ══════════════════════════════════════════ */}
      <section style={{ background: '#0B382D', padding: '3.5rem 1rem' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FDE047', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Testimoni Pesakit (Bahagian 2)
          </span>
          <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', fontWeight: 800, color: '#FDE047', marginTop: '0.4rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Betulkah ESyifaa Berkesan Untuk Selesaikan Gangguan?
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#FFFFFF', marginBottom: '2rem', opacity: 0.9, lineHeight: 1.6 }}>
            Jom baca apa kata mereka yang dah cuba rawatan ESyifaa 👇
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
            {[
              '/images/testimonials/testimoni_part2_1.jpg',
              '/images/testimonials/testimoni_part2_2.jpg',
              '/images/testimonials/testimoni_part2_3.jpg',
            ].map((src, i) => (
              <div key={i} style={{ borderRadius: '16px', overflow: 'hidden', border: '2px solid #FDE047', boxShadow: '0 8px 25px rgba(0,0,0,0.3)', background: '#042E23' }}>
                <img src={src} alt={`Testimoni ESyifaa ${i + 4}`} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            ))}
          </div>
          <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#A7F3D0', fontStyle: 'italic', lineHeight: 1.6 }}>
            Semua testimoni adalah daripada pesakit sebenar ESyifaa. Alhamdulillah.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 8 — FAQ
      ══════════════════════════════════════════ */}
      <section style={{ background: '#042E23', padding: '3.5rem 1rem' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FDE047', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              ❓ Soalan Lazim
            </span>
            <h2 style={{ fontSize: 'clamp(1.35rem, 3.5vw, 1.9rem)', fontWeight: 800, color: '#FDE047', marginTop: '0.4rem', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
              Soalan Yang Sering Ditanya
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {FAQS.map((f, i) => (
              <FAQItem key={i} q={f.q} a={f.a} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 9 — CLOSING CTA
      ══════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(180deg, #031E17 0%, #021812 100%)', padding: '4rem 1rem 6rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '620px', margin: '0 auto' }}>
          <span style={{ fontSize: '1.5rem' }}>🩺</span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 900, color: '#FEF3C7', marginTop: '0.5rem', marginBottom: '0.75rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Jangan Tangguh Lagi —{' '}
            <span style={{ color: '#FDE047' }}>Hubungi ESyifaa Sekarang</span>
          </h2>
          <p style={{ fontSize: '1rem', color: '#A7F3D0', lineHeight: 1.75, maxWidth: '500px', margin: '0 auto 2rem auto' }}>
            Setiap hari tanpa rawatan adalah hari yang terbuang.
            RM50 sahaja — ikhtiar sampai sembuh, in shaa Allah.
          </p>
          <WAButton id="cta-closing" label="🟢 Hubungi ESyifaa Sekarang — RM50 Sahaja" href={waLink} />
          <p style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: '#6EE7B7', fontStyle: 'italic' }}>
            Balas dalam masa 30 minit · Isnin hingga Ahad · 100% Patuh Syariah
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STICKY BOTTOM BAR
      ══════════════════════════════════════════ */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(2,24,18,0.97)',
        borderTop: '2px solid rgba(37,211,102,0.4)',
        padding: '0.85rem 1rem',
        display: showSticky ? 'flex' : 'none',
        justifyContent: 'center', alignItems: 'center',
        zIndex: 1000,
        boxShadow: '0 -8px 30px rgba(0,0,0,0.5)',
      }}>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => { try { window.fbq('track', 'Lead'); } catch (_) {} }}
          id="cta-sticky-wa"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.6rem', width: '100%', maxWidth: '380px',
            padding: '0.9rem 1.5rem', fontSize: '0.95rem', fontWeight: 800,
            color: '#FFFFFF',
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            borderRadius: '50px', textDecoration: 'none',
            boxShadow: '0 4px 15px rgba(37,211,102,0.4)',
            fontFamily: ff,
          }}
        >
          🟢 Rawatan ESyifaa — Hubungi Sekarang
        </a>
      </div>

      {/* Footer */}
      <footer style={{ background: '#010E09', color: '#4B5563', padding: '1.5rem 1rem', textAlign: 'center', fontSize: '0.78rem', lineHeight: 1.6 }}>
        © {new Date().getFullYear()} ESyifaa. Rawatan berasaskan Al-Quran &amp; Sunnah Nabi SAW. Tiada unsur syirik.
      </footer>

    </main>
  );
}

'use client';

import { useState, useEffect } from 'react';

// ─── Config ──────────────────────────────────────────────────────────────────
// Nombor WA diambil dari DB via /api/public/wasap (boleh urus di /dashboard/admin/wasap)
// Fallback jika API gagal:
const FALLBACK_NUMBER = '601135172611';
const WA_MESSAGE = encodeURIComponent('Assalamualaikum, saya ingin dapatkan Scanning & Air Tawar PERCUMA. Boleh bantu saya?');
const buildWaLink = (num) => `https://wa.me/${num}?text=${WA_MESSAGE}`;
const LS_KEY = 'esyifaa_wa_idx';

// ─── WhatsApp Button ─────────────────────────────────────────────────────────
function WAButton({ label = '🟢 Hubungi Kami Di WhatsApp — PERCUMA', id = 'cta-wa', size = 'large', href = '#' }) {
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
  { q: 'Betulkah scanning & air tawar ini percuma?', a: 'Ya, 100% percuma. Tiada sebarang bayaran untuk sesi scanning dan dapatkan air tawar. Kami percaya pesakit perlu tahu dahulu masalah mereka sebelum membuat apa-apa keputusan.' },
  { q: 'Berapa lama masa untuk scanning?', a: 'Biasanya 15-30 minit melalui WhatsApp. Perawat akan tanya beberapa soalan tentang simptom, kemudian lakukan scanning jarak jauh dan maklumkan keputusan.' },
  { q: 'Adakah rawatan ESyifaa patuh syariah?', a: 'Ya, 100% patuh syariah. Semua rawatan adalah berdasarkan Al-Quran, doa-doa Sunnah Nabi SAW dan tiada unsur syirik sama sekali.' },
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

// ─── Symptom list ─────────────────────────────────────────────────────────────
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

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function WaPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [showSticky, setShowSticky] = useState(false);
  const [waLink, setWaLink] = useState(buildWaLink(FALLBACK_NUMBER));
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  useEffect(() => {
    // ── Fetch active WA numbers from DB ──
    const initWaRotation = async () => {
      try {
        const res = await fetch('/api/public/wasap');
        const json = await res.json();
        const numbers = (json.success && json.data?.length > 0)
          ? json.data.map(d => d.number)
          : [FALLBACK_NUMBER]; // fallback jika API gagal atau tiada nombor

        // ── Round-robin rotation ──
        const lastIdx = parseInt(localStorage.getItem(LS_KEY) || '0', 10);
        const nextIdx = (lastIdx + 1) % numbers.length;
        localStorage.setItem(LS_KEY, String(nextIdx));
        setWaLink(buildWaLink(numbers[nextIdx]));
      } catch {
        // Fallback silent — guna nombor default
        setWaLink(buildWaLink(FALLBACK_NUMBER));
      }
    };

    initWaRotation();

    // ── Sticky bar scroll listener ──
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
            Scanning &amp; Air Tawar{' '}
            <span style={{
              background: 'linear-gradient(90deg, #FDE047, #25D366)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>PERCUMA</span>{' '}
            — Tahu Punca Gangguan Anda Hari Ini
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#A7F3D0', lineHeight: 1.75, marginBottom: '0.85rem', maxWidth: '560px', margin: '0 auto 0.85rem auto' }}>
            Tak tahu kenapa badan rasa tak kena, tidur terganggu, atau hidup rasa tersekat?
            Kami bantu scanning jarak jauh — <strong style={{ color: '#FEF3C7' }}>percuma, tanpa komitmen.</strong>
          </p>
          <p style={{ fontSize: '0.95rem', color: '#FDE047', fontWeight: 700, lineHeight: 1.65, marginBottom: '2rem' }}>
            + Dapatkan air tawar bacaan ruqyah percuma melalui WhatsApp 💧
          </p>

          <div style={{ marginBottom: '1.25rem' }}>
            <WAButton id="cta-hero" label="🟢 Dapatkan Scanning & Air Tawar PERCUMA" href={waLink} />
          </div>
          <p style={{ fontSize: '0.8rem', color: '#6EE7B7', fontStyle: 'italic' }}>
            Tiada bayaran · Tiada komitmen · Melalui WhatsApp
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2 — OFFER DETAILS CARD
      ══════════════════════════════════════════ */}
      <section style={{ background: '#031E17', padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{
            background: 'linear-gradient(135deg, #064E3B 0%, #042E23 100%)',
            border: '2px solid rgba(253,224,71,0.4)',
            borderRadius: '20px', padding: '2rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span style={{
                display: 'inline-block', background: 'rgba(253,224,71,0.15)',
                border: '1px solid #FDE047', color: '#FDE047',
                padding: '0.35rem 1rem', borderRadius: '50px',
                fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                🎁 Apa Yang Anda Akan Dapat — PERCUMA
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { icon: '🔍', title: 'Scanning Gangguan Jarak Jauh', desc: 'Perawat akan lakukan scanning untuk kenal pasti jenis gangguan — sihir, jin asyik, saka, ain atau lain-lain.' },
                { icon: '💧', title: 'Air Tawar Bacaan Ruqyah', desc: 'Cara mudah buat sendiri air tawar berkesan dari rumah — panduan penuh diberikan oleh perawat melalui WhatsApp.' },
                { icon: '📋', title: 'Pelan Rawatan Ringkas', desc: 'Selepas scanning, perawat cadangkan langkah rawatan yang sesuai berdasarkan situasi anda.' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '1rem', alignItems: 'flex-start',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: '12px', padding: '1rem 1.25rem',
                  border: '1px solid rgba(74,222,128,0.15)',
                }}>
                  <span style={{
                    fontSize: '1.75rem', flexShrink: 0,
                    background: 'rgba(74,222,128,0.1)',
                    borderRadius: '10px', padding: '0.35rem',
                    display: 'inline-flex', lineHeight: 1,
                  }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, color: '#FDE047', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{item.title}</div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#D1FAE5', lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.75rem', textAlign: 'center' }}>
              <WAButton id="cta-offer" label="🟢 Saya Mahu Scanning Percuma" href={waLink} />
              <p style={{ marginTop: '0.65rem', fontSize: '0.78rem', color: '#6EE7B7' }}>
                Balas dalam masa 30 minit — Isnin hingga Jumaat
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 3 — SYMPTOMS CHECKLIST
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
              Jika anda alami 3 atau lebih simptom ini, dapatkan scanning percuma sekarang.
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
              Jangan tangguh — semakin lama dibiarkan, semakin sukar untuk ditangani.
            </p>
            <WAButton id="cta-symptom" label="🟢 Scanning Percuma Sekarang" href={waLink} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 4 — SOCIAL PROOF STATS
      ══════════════════════════════════════════ */}
      <section style={{ background: '#0B382D', padding: '2.5rem 1rem' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { num: '500+', label: 'Pesakit Dibantu', icon: '🏥' },
              { num: '100%', label: 'Patuh Syariah', icon: '📖' },
              { num: '98%', label: 'Puas Hati', icon: '⭐' },
              { num: 'PERCUMA', label: 'Kos Scanning', icon: '🎁' },
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
          SECTION 6 — WHY ESYIFAA
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
              { icon: '🛡️', title: 'Jaminan Pulang Wang 100%', desc: 'Jika tiada perubahan selepas rawatan selesai, kami kembalikan wang anda sepenuhnya. Kami yakin dengan ikhtiar kami.' },
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
          <span style={{ fontSize: '1.5rem' }}>💧</span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 900, color: '#FEF3C7', marginTop: '0.5rem', marginBottom: '0.75rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Jangan Tangguh Lagi —{' '}
            <span style={{ color: '#FDE047' }}>Scanning Percuma Hanya Untuk Anda</span>
          </h2>
          <p style={{ fontSize: '1rem', color: '#A7F3D0', lineHeight: 1.75, marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem auto' }}>
            Setiap hari tanpa tahu punca masalah adalah hari yang terbuang.
            Hubungi perawat ESyifaa sekarang — percuma, tiada komitmen.
          </p>
          <WAButton id="cta-closing" label="🟢 Dapatkan Scanning & Air Tawar PERCUMA" href={waLink} />
          <p style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: '#6EE7B7', fontStyle: 'italic' }}>
            Tiada bayaran · Balas dalam masa 30 minit · 100% Patuh Syariah
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STICKY BOTTOM BAR — Mobile
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
          🟢 Scanning Percuma Via WhatsApp
        </a>
      </div>

      {/* Footer */}
      <footer style={{ background: '#010E09', color: '#4B5563', padding: '1.5rem 1rem', textAlign: 'center', fontSize: '0.78rem', lineHeight: 1.6 }}>
        © {new Date().getFullYear()} ESyifaa. Rawatan berasaskan Al-Quran &amp; Sunnah Nabi SAW. Tiada unsur syirik.
      </footer>

    </main>
  );
}

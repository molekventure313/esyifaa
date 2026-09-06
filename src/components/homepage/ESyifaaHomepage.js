'use client';

import { useState, useEffect } from 'react';
import FspTestimonialSection from '@/components/salespage/fsp/TestimonialSection';
import FspTestimonialPart2Section from '@/components/salespage/fsp/TestimonialPart2Section';

// ─── WA Rotator ───────────────────────────────────────────────────────────────
const FALLBACK_NUMBER = '601135172611';
const WA_MESSAGE      = encodeURIComponent('Assalamualaikum, saya ingin mendapatkan maklumat lanjut mengenai perkhidmatan ESyifaa.');
const LS_KEY          = 'esyifaa_wa_idx';
const buildWaLink     = (num) => `https://wa.me/${num}?text=${WA_MESSAGE}`;

// ─── Data ─────────────────────────────────────────────────────────────────────
const SERVICES = [
  {
    id: 'rawatan',
    icon: '🏥',
    badge: 'SERVIS UTAMA',
    badgeColor: '#10B981',
    name: 'Rawatan Ruqyah',
    tagline: 'Rawatan Gangguan Jin, Sihir & Saka Jarak Jauh',
    price: 'Dari RM50',
    priceSub: 'per sesi rawatan',
    color: '#10B981',
    cardBorder: 'rgba(16,185,129,0.4)',
    cardGlow: 'rgba(16,185,129,0.08)',
    bullets: [
      'Rawatan jarak jauh — boleh dari mana-mana',
      'Diagnosis & rawatan dalam satu sesi',
      'Termasuk sesi follow-up & panduan amalan',
      '100% patuh syariah, tiada unsur syirik',
    ],
    ctaLabel: '🏥 Mulakan Rawatan Sekarang',
    ctaUrl: '/fsp-checkout',
    ctaColor: '#10B981',
    ctaTextColor: '#042E23',
    secondaryLabel: 'Cuba Air Tawar Percuma →',
    secondaryUrl: '/wa',
  },
  {
    id: 'pengisian',
    icon: '💎',
    badge: '50 SLOT TERAWAL',
    badgeColor: '#D97706',
    name: "Pengisian E-Syifa'",
    tagline: 'Tenaga Ruqyah Dipaksakan Ke Dalam Item Peribadi Anda',
    price: 'RM90',
    priceSub: 'bayar sekali, guna seumur hidup',
    color: '#FDE047',
    cardBorder: 'rgba(253,224,71,0.4)',
    cardGlow: 'rgba(253,224,71,0.06)',
    bullets: [
      '4 lapisan ayat: Pembakar · Pembatal · Benteng · Kesembuhan',
      'Diisi selama 3 hari berturut-turut',
      'Pelarasan mingguan PERCUMA selamanya',
      'Berubat sendiri tanpa bergantung pada perawat',
    ],
    ctaLabel: '💎 Tempah Pengisian Sekarang',
    ctaUrl: '/pengisian-wasap',
    ctaColor: '#FDE047',
    ctaTextColor: '#042E23',
    secondaryLabel: 'Lihat butiran penuh →',
    secondaryUrl: '/pengisian-esyifa',
  },
  {
    id: 'evideo',
    icon: '🎬',
    badge: 'PRODUK DIGITAL',
    badgeColor: '#8B5CF6',
    name: 'E-Video Rawatan',
    tagline: 'Pakej Video Rawatan Ruqyah — Ulang Tonton Bila-Bila Masa',
    price: 'RM60',
    priceSub: 'harga promo 50 terawal',
    color: '#A78BFA',
    cardBorder: 'rgba(139,92,246,0.4)',
    cardGlow: 'rgba(139,92,246,0.08)',
    bullets: [
      '8 video rawatan + 1 amalan harian bonus',
      'Rawatan sebenar — bukan sekadar rakaman biasa',
      'Ulang tonton percuma, tanpa bayar extra',
      'Dihantar via WhatsApp dalam 24 jam selepas bayar',
    ],
    ctaLabel: '🎬 Dapatkan E-Video Sekarang',
    ctaUrl: '/e-video',
    ctaColor: '#8B5CF6',
    ctaTextColor: '#FFFFFF',
    secondaryLabel: 'Lihat butiran penuh →',
    secondaryUrl: '/e-video',
  },
];

const TRUST_ITEMS = [
  { icon: '🌍', title: 'Rawatan Jarak Jauh', desc: 'Boleh dari mana-mana. Selagi ada WhatsApp, rawatan boleh berjalan.' },
  { icon: '📖', title: 'Berasaskan Al-Quran & Sunnah', desc: 'Tiada unsur syirik atau khufarat. 100% kaedah syar\'iyyah yang diiktiraf.' },
  { icon: '🔄', title: 'Bukan Rawatan Sekali', desc: 'Ada follow-up, pelarasan & pemantauan — bukan bayar terus tinggalkan.' },
  { icon: '💬', title: 'Respons Dalam 30 Minit', desc: 'Perawat bertugas Isnin hingga Ahad, balas segera semasa waktu operasi.' },
];

const FAQS = [
  {
    q: 'Boleh ke rawatan jarak jauh ni berkesan?',
    a: 'Ya — ruqyah syar\'iyyah tidak terhad oleh jarak. Bacaan Al-Quran dan doa perawat tetap sampai kepada pesakit walaupun berjauhan. Ramai pesakit kami yang berada di luar negara turut merasai kesan rawatan.',
  },
  {
    q: "Apa beza antara Rawatan, Pengisian E-Syifa' dan E-Video?",
    a: "Rawatan (RM50) — sesi rawatan berdepan (jarak jauh) dengan perawat. Pengisian E-Syifa' (RM90) — tenaga ruqyah dipaksakan ke dalam item peribadi anda untuk rawatan berterusan tanpa sesi. E-Video (RM60) — pakej video rawatan untuk anda gunakan sendiri di rumah, bila-bila masa.",
  },
  {
    q: 'Berapa lama untuk rasa kesan rawatan?',
    a: 'Bergantung kepada tahap gangguan. Sesetengah pesakit rasa kesan sejurus dalam sesi pertama. Sesetengah yang lain memerlukan beberapa sesi. Perawat akan beri panduan ikut keadaan masing-masing.',
  },
  {
    q: 'Adakah perlu buat banyak sesi rawatan?',
    a: 'Tidak semestinya. Kes ringan mungkin selesai dalam 1-2 sesi. Kes gangguan lama & berulang mungkin perlukan lebih. Perawat akan nilai dan cadangkan ikut keperluan sebenar — tiada paksaan untuk teruskan.',
  },
  {
    q: 'Bagaimana cara nak mula?',
    a: 'Mudah sahaja — pilih servis yang sesuai di atas, klik butang, dan ikut arahan. Untuk Rawatan, anda boleh terus bayar dan perawat akan hubungi. Untuk Pengisian & E-Video, proses serupa melalui WhatsApp atau bayaran FPX.',
  },
];

const ff = 'var(--font-inter), -apple-system, sans-serif';

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function Navbar({ waLink, firePixel }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav style={{
      background: 'rgba(4,46,35,0.97)',
      borderBottom: '1px solid rgba(74,222,128,0.15)',
      padding: '0.9rem 1.5rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: '0.75rem',
      fontFamily: ff,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #065F46, #FDE047)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 900 }}>
          ☽
        </div>
        <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#FEF3C7', letterSpacing: '-0.02em' }}>
          ESyifaa
        </span>
        <span style={{ fontSize: '0.7rem', color: '#6EE7B7', fontWeight: 600, display: 'none' }}>
          — Rawatan Ruqyah Syar&apos;iyyah
        </span>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Servis Kami', id: 'servis-kami' },
          { label: 'Kenapa ESyifaa', id: 'kenapa-esyifaa' },
          { label: 'Testimoni', id: 'testimoni' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A7F3D0', fontSize: '0.83rem', fontWeight: 600, fontFamily: ff, padding: 0 }}
          >
            {item.label}
          </button>
        ))}

        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={firePixel}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.45rem 1.1rem', borderRadius: '50px',
            fontSize: '0.8rem', fontWeight: 800, color: '#042E23',
            background: 'linear-gradient(135deg, #25D366, #128C7E)',
            textDecoration: 'none',
          }}
        >
          💬 Hubungi Kami
        </a>
      </div>
    </nav>
  );
}

function HeroSection({ waLink, firePixel }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section style={{
      background: 'linear-gradient(180deg, #021812 0%, #042E23 100%)',
      padding: '5rem 1.5rem 4rem',
      textAlign: 'center', fontFamily: ff,
    }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', padding: '0.4rem 1.1rem', borderRadius: '50px', marginBottom: '1.5rem' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4ADE80', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Rawatan Ruqyah Syar&apos;iyyah Online
          </span>
        </div>

        {/* H1 */}
        <h1 style={{
          fontSize: 'clamp(1.8rem, 5vw, 3rem)',
          fontWeight: 900, color: '#FEF3C7',
          margin: '0 0 1rem 0',
          letterSpacing: '-0.03em', lineHeight: 1.15,
        }}>
          Rawat Gangguan Jin, Sihir & Saka{' '}
          <span style={{ color: '#FDE047' }}>Dari Rumah</span>
        </h1>

        {/* Sub */}
        <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', color: '#A7F3D0', lineHeight: 1.7, maxWidth: '580px', margin: '0 auto 2.5rem auto' }}>
          Tiga perkhidmatan rawatan ruqyah syar&apos;iyyah dalam satu tempat — rawatan terus, pengisian item, atau pakej video. Pilih yang sesuai untuk anda.
        </p>

        {/* 3 service pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.65rem', marginBottom: '2.5rem' }}>
          {[
            { label: '🏥 Rawatan RM50', id: 'rawatan', color: '#10B981' },
            { label: "💎 Pengisian RM90", id: 'pengisian', color: '#D97706' },
            { label: '🎬 E-Video RM60', id: 'evideo', color: '#8B5CF6' },
          ].map(pill => (
            <button
              key={pill.id}
              onClick={() => scrollTo(`service-${pill.id}`)}
              style={{
                padding: '0.6rem 1.3rem', borderRadius: '50px',
                fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                background: `${pill.color}22`, border: `1.5px solid ${pill.color}66`,
                color: '#FEF3C7', fontFamily: ff,
                transition: 'all 0.15s',
              }}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Main CTA */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.85rem' }}>
          <button
            onClick={() => scrollTo('servis-kami')}
            style={{
              padding: '0.9rem 2rem', borderRadius: '50px',
              fontSize: '1rem', fontWeight: 800, cursor: 'pointer',
              background: 'linear-gradient(180deg, #FDE047 0%, #EAB308 100%)',
              border: '2px solid #FEF08A', color: '#042E23',
              boxShadow: '0 8px 25px rgba(234,179,8,0.35)', fontFamily: ff,
            }}
          >
            Lihat Semua Servis ↓
          </button>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={firePixel}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.9rem 2rem', borderRadius: '50px',
              fontSize: '1rem', fontWeight: 800, color: '#FFFFFF',
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              textDecoration: 'none',
              boxShadow: '0 8px 25px rgba(37,211,102,0.3)',
              border: '2px solid rgba(255,255,255,0.2)',
            }}
          >
            💬 Tanya Perawat Dulu
          </a>
        </div>
      </div>
    </section>
  );
}

function ServicesSection({ waLink, firePixel }) {
  return (
    <section id="servis-kami" style={{ background: '#031E17', padding: '4rem 1.5rem', fontFamily: ff }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ display: 'inline-block', background: 'rgba(253,224,71,0.1)', border: '1px solid rgba(253,224,71,0.4)', color: '#FDE047', padding: '0.4rem 1.1rem', borderRadius: '50px', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            🛎️ Perkhidmatan Kami
          </span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 900, color: '#FEF3C7', margin: '0.4rem 0 0.6rem', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
            Tiga Servis, Satu Tujuan — Sembuh & Terlindung
          </h2>
          <p style={{ fontSize: '1rem', color: '#A7F3D0', lineHeight: 1.65, maxWidth: '560px', margin: '0 auto' }}>
            Pilih servis mengikut keperluan dan kemampuan anda. Semua berasaskan ruqyah syar&apos;iyyah.
          </p>
        </div>

        {/* 3 Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {SERVICES.map(svc => (
            <div
              key={svc.id}
              id={`service-${svc.id}`}
              style={{
                background: `linear-gradient(135deg, #042E23 0%, #031E17 100%)`,
                border: `2px solid ${svc.cardBorder}`,
                borderRadius: '20px', overflow: 'hidden',
                boxShadow: `0 20px 50px rgba(0,0,0,0.4), 0 0 40px ${svc.cardGlow}`,
                display: 'flex', flexDirection: 'column',
              }}
            >
              {/* Top banner */}
              <div style={{ background: `${svc.color}22`, borderBottom: `1px solid ${svc.cardBorder}`, padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.3rem' }}>{svc.icon}</span>
                <span style={{ fontSize: '0.68rem', fontWeight: 900, color: svc.color, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{svc.badge}</span>
              </div>

              {/* Body */}
              <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#FEF3C7', marginBottom: '0.3rem' }}>{svc.name}</div>
                  <div style={{ fontSize: '0.82rem', color: '#A7F3D0', lineHeight: 1.5 }}>{svc.tagline}</div>
                </div>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 900, color: svc.color, lineHeight: 1 }}>{svc.price}</span>
                  <span style={{ fontSize: '0.78rem', color: '#6EE7B7' }}>{svc.priceSub}</span>
                </div>

                {/* Bullets */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  {svc.bullets.map((b, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                      <span style={{ color: svc.color, fontWeight: 900, fontSize: '0.85rem', flexShrink: 0, marginTop: '1px' }}>✓</span>
                      <span style={{ fontSize: '0.85rem', color: '#D1FAE5', lineHeight: 1.45 }}>{b}</span>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div style={{ marginTop: 'auto', paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <a
                    href={svc.ctaUrl}
                    style={{
                      display: 'block', textAlign: 'center',
                      padding: '0.9rem', borderRadius: '50px',
                      fontSize: '0.9rem', fontWeight: 800,
                      color: svc.ctaTextColor,
                      background: svc.ctaColor,
                      textDecoration: 'none',
                      boxShadow: `0 6px 20px ${svc.color}44`,
                    }}
                  >
                    {svc.ctaLabel}
                  </a>
                  {svc.secondaryUrl !== svc.ctaUrl && (
                    <a
                      href={svc.secondaryUrl}
                      style={{ textAlign: 'center', fontSize: '0.78rem', color: svc.color, textDecoration: 'none', fontWeight: 600, opacity: 0.85 }}
                    >
                      {svc.secondaryLabel}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section id="kenapa-esyifaa" style={{ background: '#042E23', padding: '4rem 1.5rem', fontFamily: ff }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ display: 'inline-block', background: 'rgba(253,224,71,0.1)', border: '1px solid rgba(253,224,71,0.4)', color: '#FDE047', padding: '0.4rem 1.1rem', borderRadius: '50px', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            🌟 Kenapa ESyifaa?
          </span>
          <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', fontWeight: 900, color: '#FEF3C7', margin: '0.4rem 0 0', letterSpacing: '-0.02em' }}>
            Lebih Dari Sekadar Rawatan Biasa
          </h2>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { value: '200+', label: 'Pesakit Dirawat' },
            { value: '100%', label: 'Patuh Syariah' },
            { value: '3', label: 'Servis Lengkap' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '16px', padding: '1.5rem 1rem' }}>
              <div style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, color: '#FDE047', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#A7F3D0', marginTop: '0.4rem', fontWeight: 600 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Trust cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {TRUST_ITEMS.map((item, i) => (
            <div key={i} style={{ background: '#031E17', border: '1px solid rgba(74,222,128,0.15)', borderRadius: '14px', padding: '1.5rem' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{item.icon}</div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#FDE047', marginBottom: '0.4rem' }}>{item.title}</div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#A7F3D0', lineHeight: 1.55 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [open, setOpen] = useState(null);

  return (
    <section style={{ background: '#031E17', padding: '4rem 1.5rem', fontFamily: ff }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ display: 'inline-block', background: 'rgba(253,224,71,0.1)', border: '1px solid rgba(253,224,71,0.4)', color: '#FDE047', padding: '0.4rem 1.1rem', borderRadius: '50px', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            ❓ Soalan Lazim
          </span>
          <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.9rem)', fontWeight: 900, color: '#FEF3C7', margin: '0.4rem 0 0', letterSpacing: '-0.02em' }}>
            Ada Pertanyaan?
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {FAQS.map((faq, i) => (
            <div
              key={i}
              style={{ background: '#042E23', border: `1px solid ${open === i ? 'rgba(253,224,71,0.4)' : 'rgba(74,222,128,0.15)'}`, borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.2s' }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: '100%', padding: '1.1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: ff }}
              >
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FEF3C7', lineHeight: 1.4 }}>{faq.q}</span>
                <span style={{ fontSize: '1rem', color: '#FDE047', flexShrink: 0, transform: open === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
              </button>
              {open === i && (
                <div style={{ padding: '0 1.5rem 1.1rem', fontSize: '0.875rem', color: '#D1FAE5', lineHeight: 1.7 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer({ waLink, firePixel }) {
  return (
    <footer style={{ background: '#010E09', padding: '3rem 1.5rem 2rem', fontFamily: ff }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Top row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          {/* Brand */}
          <div>
            <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#FEF3C7', marginBottom: '0.5rem' }}>ESyifaa</div>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#6EE7B7', lineHeight: 1.6 }}>
              Pusat rawatan & produk ruqyah syar&apos;iyyah online. Berasaskan Al-Quran & Sunnah Nabi SAW.
            </p>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={firePixel}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: '#25D366', textDecoration: 'none' }}
            >
              💬 Hubungi Via WhatsApp
            </a>
          </div>

          {/* Servis */}
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#FDE047', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.85rem' }}>Servis Rawatan</div>
            {[
              { label: 'Rawatan Ruqyah (RM50)', url: '/fsp-checkout' },
              { label: 'Rawatan Via WhatsApp', url: '/wa' },
              { label: 'Rawatan Sihir', url: '/sihir' },
              { label: 'Rawatan Saka', url: '/saka' },
              { label: 'Penyakit Misteri', url: '/penyakit-misteri' },
            ].map(l => (
              <a key={l.url} href={l.url} style={{ display: 'block', fontSize: '0.8rem', color: '#A7F3D0', textDecoration: 'none', marginBottom: '0.4rem', opacity: 0.85 }}>{l.label}</a>
            ))}
          </div>

          {/* Produk */}
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#FDE047', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.85rem' }}>Produk</div>
            {[
              { label: "Pengisian E-Syifa' (RM90)", url: '/pengisian-wasap' },
              { label: "Pengisian — Bayar FPX", url: '/pengisian-esyifa' },
              { label: 'E-Video Rawatan (RM60)', url: '/e-video' },
              { label: 'Rawat Sendiri', url: '/rawat-sendiri' },
            ].map(l => (
              <a key={l.url} href={l.url} style={{ display: 'block', fontSize: '0.8rem', color: '#A7F3D0', textDecoration: 'none', marginBottom: '0.4rem', opacity: 0.85 }}>{l.label}</a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.25rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#4B5563' }}>
            © {new Date().getFullYear()} ESyifaa. Hak cipta terpelihara.
          </p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#4B5563' }}>
            Rawatan berasaskan Al-Quran & Sunnah Nabi SAW. Tiada unsur syirik.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export default function ESyifaaHomepage() {
  const [waLink, setWaLink] = useState(buildWaLink(FALLBACK_NUMBER));

  useEffect(() => {
    const initWa = async () => {
      try {
        const res     = await fetch('/api/public/wasap');
        const json    = await res.json();
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
    initWa();
  }, []);

  const firePixel = () => {
    try { window.fbq('track', 'Lead'); } catch (_) {}
  };

  return (
    <main style={{ minHeight: '100vh', background: '#042E23', fontFamily: ff }}>
      <Navbar waLink={waLink} firePixel={firePixel} />
      <HeroSection waLink={waLink} firePixel={firePixel} />
      <ServicesSection waLink={waLink} firePixel={firePixel} />
      <TrustSection />
      <div id="testimoni">
        <FspTestimonialSection />
        <FspTestimonialPart2Section />
      </div>
      <FAQSection />
      <Footer waLink={waLink} firePixel={firePixel} />
    </main>
  );
}

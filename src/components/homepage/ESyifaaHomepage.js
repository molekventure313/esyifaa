'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import FspTestimonialSection from '@/components/salespage/fsp/TestimonialSection';

// ─── WA Rotator ───────────────────────────────────────────────────────────────
const FALLBACK_NUMBER = '601135172611';
const WA_MESSAGE      = encodeURIComponent('Assalamualaikum, saya ingin mendapatkan maklumat lanjut mengenai perkhidmatan ESyifaa.');
const LS_KEY          = 'esyifaa_wa_idx';
const buildWaLink     = (num) => `https://wa.me/${num}?text=${WA_MESSAGE}`;

// ─── Data ─────────────────────────────────────────────────────────────────────
// Produk fizikal — dipapar DULU (sumber jualan utama). Butang terus ke SP produk.
const PRODUCTS = [
  {
    id: 'sabun',
    name: 'Sabun Garam Himalaya Pengisian',
    sub: '200g · mandian ruqyah',
    badge: 'PALING LARIS',
    color: '#10B981',
    image: '/images/sabun-garam/hero-saka-sihir-santau.png',
    price: 'Dari RM39',
    priceSub: '+ postage RM5 · 3 unit RM90',
    bullets: [
      'Larut dalam baldi & mandi — amalkan di rumah',
      'Ikhtiar saka, sihir, santau & lenguh badan',
      'COD tersedia seluruh Semenanjung',
    ],
    url: '/sabun-garam-1',
    cta: '🧼 Tempah Sabun Garam',
  },
  {
    id: 'garam',
    name: 'Garam Pengasihan Masakan',
    sub: '250g · secubit dalam masakan',
    badge: 'BELI 1 FREE 1',
    color: '#F59E0B',
    image: null,
    emoji: '🧂',
    price: 'Dari RM39',
    priceSub: '2 pek (250g x 2)',
    bullets: [
      'Masukkan secubit dalam masakan & minuman harian',
      'Ikhtiar keharmonian & kemesraan rumahtangga',
      '6 pek: FREE postage + FREE Minyak Kasturi',
    ],
    url: '/garam-pengasihan',
    cta: '🧂 Tempah Garam Pengasihan',
  },
  {
    id: 'kasturi',
    name: 'Minyak Kasturi Kijang Ruqyah',
    sub: 'botol poket · calit & sapu',
    badge: 'MESRA POKET',
    color: '#A78BFA',
    image: '/images/kasturi-kijang-opt.jpg',
    price: 'Dari RM20',
    priceSub: '5 botol hanya RM40',
    bullets: [
      'Calit di nadi, ubun-ubun & bantal sebelum tidur',
      'Pendinding diri & anak dari gangguan waktu malam',
      'Kecil & mudah dibawa ke mana-mana',
    ],
    url: '/kasturi-kijang',
    cta: '🌿 Tempah Kasturi Kijang',
  },
];

// Testimoni produk (dari SP produk) — dicampur dengan testimoni rawatan (gambar WhatsApp)
const PRODUCT_TESTIMONIALS = [
  { product: '🧼 Sabun Garam', name: 'Aishah M.', place: 'Kuala Lumpur', tag: 'Susah Tidur → Tidur Nyenyak',
    quote: 'Dulu kul 3 pagi masih terkebil-kebil dada gelisah tak boleh tidur. Lepas mandi sabun ni malam terus tidur lena sampai subuh, alhamdulillah.' },
  { product: '🧼 Sabun Garam', name: 'Rahman A.', place: 'Selangor', tag: 'Lenguh Urat → Lega',
    quote: 'Bahu saya yang lenguh tegang bertahun tu terus lega lepas mandi. Rasa ringan badan sekarang.' },
  { product: '🧂 Garam Pengasihan', name: 'Puan Noraini', place: 'Shah Alam', tag: 'Suami Kembali Mesra',
    quote: 'Saya ikhtiar letak secubit garam ni dalam teh O dan sup ayam dia. Masuk hari ke-5, tiba-tiba dia ajak makan sama-sama dan minta maaf.' },
  { product: '🌿 Kasturi Kijang', name: 'Puan Shikin', place: 'Seremban', tag: 'Anak Berhenti Meracau',
    quote: 'Lepas calit kasturi kijang di ubun-ubun dan belakang telinga anak, masyaAllah terus berhenti menangis dan tidur dengan sangat tenang.' },
];

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
    ctaUrl: '/pengisian-esyifa',
    ctaColor: '#FDE047',
    ctaTextColor: '#042E23',
    secondaryLabel: 'Tanya perawat dulu di WhatsApp →',
    secondaryUrl: '/pengisian-wasap',
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
    q: "Apa beza produk-produk E-Syifa'?",
    a: "Sabun Garam Himalaya — mandian ruqyah untuk ikhtiar saka, sihir, santau & lenguh badan. Garam Pengasihan — secubit dalam masakan harian untuk keharmonian rumahtangga. Minyak Kasturi Kijang — calit & sapu sebagai pendinding diri dan anak. Pengisian E-Syifa' — ayat ruqyah dipasakkan ke dalam item peribadi anda (cincin, tasbih dll) untuk rawat diri sendiri. Rawatan Ruqyah — sesi rawatan jarak jauh terus bersama perawat.",
  },
  {
    q: 'Boleh bayar masa terima barang (COD)?',
    a: 'Boleh — COD tersedia untuk produk fizikal (Sabun Garam, Garam Pengasihan, Kasturi Kijang) ke seluruh Semenanjung. Untuk Sabah & Sarawak, bayaran melalui FPX (online banking).',
  },
  {
    q: 'Berapa lama barang sampai?',
    a: 'Order diproses setiap hari bekerja dan dihantar melalui kurier. Kebiasaannya sampai dalam 2–5 hari bekerja untuk Semenanjung, lebih sedikit untuk Sabah & Sarawak.',
  },
  {
    q: 'Boleh ke rawatan jarak jauh ni berkesan?',
    a: "Ya — ruqyah syar'iyyah tidak terhad oleh jarak. Bacaan Al-Quran dan doa perawat tetap sampai kepada pesakit walaupun berjauhan. Ramai pesakit kami yang berada di luar negara turut merasai kesan rawatan.",
  },
  {
    q: 'Ada unsur syirik atau khurafat?',
    a: "Tiada. Semua produk & rawatan berasaskan bacaan ayat Al-Quran dan doa yang ma'thur — 100% ruqyah syar'iyyah. Produk hanyalah wasilah (perantara); kesembuhan datang daripada Allah SWT.",
  },
  {
    q: 'Bagaimana cara nak mula?',
    a: 'Pilih produk atau servis di atas, klik butang tempah dan isi borang — pilih COD atau FPX. Kalau masih ragu, tekan butang WhatsApp untuk bertanya terus kepada perawat kami.',
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
          { label: 'Produk', id: 'produk' },
          { label: 'Rawatan', id: 'servis-kami' },
          { label: 'Testimoni', id: 'testimoni' },
          { label: 'FAQ', id: 'faq' },
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
            Produk &amp; Rawatan Ruqyah Syar&apos;iyyah
          </span>
        </div>

        {/* H1 */}
        <h1 style={{
          fontSize: 'clamp(1.8rem, 5vw, 3rem)',
          fontWeight: 900, color: '#FEF3C7',
          margin: '0 0 1rem 0',
          letterSpacing: '-0.03em', lineHeight: 1.15,
        }}>
          Ikhtiar Gangguan Jin, Sihir & Saka{' '}
          <span style={{ color: '#FDE047' }}>Terus Dari Rumah</span>
        </h1>

        {/* Sub */}
        <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', color: '#A7F3D0', lineHeight: 1.7, maxWidth: '580px', margin: '0 auto 2.5rem auto' }}>
          Produk ruqyah untuk amalan harian di rumah — sabun mandian, garam masakan &amp; minyak kasturi — serta rawatan jarak jauh &amp; pengisian item bersama perawat kami.
        </p>

        {/* 3 service pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.65rem', marginBottom: '2.5rem' }}>
          {[
            { label: '🧼 Sabun Garam', id: 'product-sabun', color: '#10B981' },
            { label: '🧂 Garam Pengasihan', id: 'product-garam', color: '#F59E0B' },
            { label: '🌿 Kasturi Kijang', id: 'product-kasturi', color: '#A78BFA' },
            { label: '🏥 Rawatan RM50', id: 'service-rawatan', color: '#10B981' },
            { label: "💎 Pengisian RM90", id: 'service-pengisian', color: '#D97706' },
          ].map(pill => (
            <button
              key={pill.id}
              onClick={() => scrollTo(pill.id)}
              style={{
                padding: '0.5rem 0.95rem', borderRadius: '50px',
                fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
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
            onClick={() => scrollTo('produk')}
            style={{
              padding: '0.9rem 2rem', borderRadius: '50px',
              fontSize: '1rem', fontWeight: 800, cursor: 'pointer',
              background: 'linear-gradient(180deg, #FDE047 0%, #EAB308 100%)',
              border: '2px solid #FEF08A', color: '#042E23',
              boxShadow: '0 8px 25px rgba(234,179,8,0.35)', fontFamily: ff,
            }}
          >
            🛒 Lihat Produk ↓
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

function ProductsSection() {
  return (
    <section id="produk" style={{ background: '#031E17', padding: '4rem 1.5rem', fontFamily: ff }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ display: 'inline-block', background: 'rgba(253,224,71,0.1)', border: '1px solid rgba(253,224,71,0.4)', color: '#FDE047', padding: '0.4rem 1.1rem', borderRadius: '50px', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            🛒 Produk Ruqyah E-Syifa&apos;
          </span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 900, color: '#FEF3C7', margin: '0.4rem 0 0.6rem', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
            Amalan Ruqyah Harian — Terus Ke Pintu Rumah
          </h2>
          <p style={{ fontSize: '1rem', color: '#A7F3D0', lineHeight: 1.65, maxWidth: '580px', margin: '0 auto' }}>
            Setiap produk diisi dengan bacaan ayat ruqyah syar&apos;iyyah oleh perawat kami. Bayar masa terima (COD) atau FPX.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {PRODUCTS.map(p => (
            <div key={p.id} id={`product-${p.id}`} style={{
              background: 'linear-gradient(135deg, #042E23 0%, #031E17 100%)',
              border: `2px solid ${p.color}66`, borderRadius: '20px', overflow: 'hidden',
              boxShadow: `0 20px 50px rgba(0,0,0,0.4), 0 0 40px ${p.color}14`,
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Gambar */}
              <a href={p.url} style={{ position: 'relative', display: 'block', aspectRatio: '4 / 3', background: `radial-gradient(circle at 50% 40%, ${p.color}33, #021812 75%)` }}>
                {p.image
                  ? <Image src={p.image} alt={p.name} fill sizes="(max-width: 700px) 100vw, 360px" style={{ objectFit: 'contain' }} />
                  : <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5.5rem' }}>{p.emoji}</span>}
                <span style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', background: p.color, color: '#042E23', fontSize: '0.66rem', fontWeight: 900, letterSpacing: '0.08em', padding: '0.3rem 0.65rem', borderRadius: '999px' }}>
                  {p.badge}
                </span>
              </a>

              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '1.12rem', fontWeight: 900, color: '#FEF3C7', marginBottom: '0.2rem' }}>{p.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6EE7B7' }}>{p.sub}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.85rem', fontWeight: 900, color: p.color, lineHeight: 1 }}>{p.price}</span>
                  <span style={{ fontSize: '0.78rem', color: '#A7F3D0' }}>{p.priceSub}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {p.bullets.map((b, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                      <span style={{ color: p.color, fontWeight: 900, fontSize: '0.85rem', flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: '0.85rem', color: '#D1FAE5', lineHeight: 1.45 }}>{b}</span>
                    </div>
                  ))}
                </div>
                <a href={p.url} style={{
                  marginTop: 'auto', display: 'block', textAlign: 'center', padding: '0.9rem', borderRadius: '50px',
                  fontSize: '0.9rem', fontWeight: 800, color: '#042E23', background: p.color, textDecoration: 'none',
                  boxShadow: `0 6px 20px ${p.color}44`,
                }}>
                  {p.cta} →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductTestimonialSection() {
  return (
    <section style={{ background: '#F8FAFC', padding: '3.5rem 1.25rem 1rem', fontFamily: ff }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Testimoni Pengguna Produk
        </span>
        <h2 style={{ fontSize: 'clamp(1.4rem, 3.2vw, 2rem)', fontWeight: 800, color: '#0F172A', margin: '0.5rem 0 2rem', letterSpacing: '-0.02em' }}>
          Apa Kata Mereka Yang Dah Amalkan
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem', textAlign: 'left' }}>
          {PRODUCT_TESTIMONIALS.map(t => (
            <div key={t.name} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 6px 20px rgba(15,23,42,0.05)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#047857', background: '#ECFDF5', padding: '0.2rem 0.55rem', borderRadius: '999px' }}>{t.product}</span>
                <span style={{ color: '#F59E0B', fontSize: '0.75rem' }}>★★★★★</span>
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>{t.tag}</div>
              <p style={{ margin: 0, fontSize: '0.86rem', color: '#334155', lineHeight: 1.6, fontStyle: 'italic', flex: 1 }}>&ldquo;{t.quote}&rdquo;</p>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>— {t.name}, {t.place}</div>
            </div>
          ))}
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
            ✨ Rawatan &amp; Pengisian
          </span>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 900, color: '#FEF3C7', margin: '0.4rem 0 0.6rem', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
            Perlukan Bantuan Perawat? Sembuh & Terlindung
          </h2>
          <p style={{ fontSize: '1rem', color: '#A7F3D0', lineHeight: 1.65, maxWidth: '560px', margin: '0 auto' }}>
            Untuk kes yang lebih berat atau berulang — rawatan jarak jauh terus bersama perawat, atau pengisian ayat ruqyah ke dalam item peribadi anda.
          </p>
        </div>

        {/* Kad servis */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', maxWidth: '820px', margin: '0 auto' }}>
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
    <section id="faq" style={{ background: '#031E17', padding: '4rem 1.5rem', fontFamily: ff }}>
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
              { label: 'Sabun Garam Himalaya', url: '/sabun-garam-1' },
              { label: 'Garam Pengasihan', url: '/garam-pengasihan' },
              { label: 'Minyak Kasturi Kijang', url: '/kasturi-kijang' },
              { label: "Pengisian E-Syifa' (RM90)", url: '/pengisian-esyifa' },
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
      <ProductsSection />
      <ServicesSection waLink={waLink} firePixel={firePixel} />
      <TrustSection />
      <div id="testimoni">
        <ProductTestimonialSection />
        <FspTestimonialSection />
      </div>
      <FAQSection />
      <Footer waLink={waLink} firePixel={firePixel} />
    </main>
  );
}

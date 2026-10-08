'use client';

import { useEffect, useState } from 'react';
import { RH_MAX_SLOTS } from '@/lib/ruqyah-harian';

// SP Ruqyah Harian E-Syifa — seksyen kandungan (Framework FSP 10%, angle A2: helah jin semasa rawatan)

const ff = 'var(--font-inter), -apple-system, sans-serif';
const C = { green: '#047857', greenSoft: '#ECFDF5', border: '#A7F3D0', ink: '#0F172A', body: '#334155', muted: '#64748B', gold: '#D97706' };

const scrollToForm = e => {
  e?.preventDefault();
  document.getElementById('borang')?.scrollIntoView({ behavior: 'smooth' });
};

function Chip({ children, dark }) {
  return (
    <span style={{
      display: 'inline-block', background: dark ? 'rgba(253,224,71,0.12)' : '#FFFFFF', border: `1px solid ${dark ? 'rgba(253,224,71,0.45)' : C.border}`,
      color: dark ? '#FDE047' : C.green, padding: '0.35rem 1rem', borderRadius: '9999px', fontSize: '0.74rem',
      fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.9rem',
    }}>{children}</span>
  );
}

function H2({ children, dark }) {
  return (
    <h2 style={{ fontSize: 'clamp(1.5rem, 3.4vw, 2.15rem)', fontWeight: 900, color: dark ? '#FEF3C7' : C.ink, margin: '0.2rem 0 0.75rem', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
      {children}
    </h2>
  );
}

function Section({ children, bg = '#FFFFFF', max = '920px', center = true, id, pad = '4.25rem 1.25rem' }) {
  return (
    <section id={id} style={{ background: bg, padding: pad, fontFamily: ff, borderBottom: '1px solid #E2E8F0' }}>
      <div style={{ maxWidth: max, margin: '0 auto', textAlign: center ? 'center' : 'left' }}>{children}</div>
    </section>
  );
}

// ─── Kaunter slot (kongsi satu fetch) ─────────────────────────────────────────
let slotsPromise;
export function useRhSlots() {
  const [slots, setSlots] = useState(null);
  useEffect(() => {
    slotsPromise ??= fetch('/api/public/ruqyah-harian/slots').then(r => r.json()).catch(() => null);
    let alive = true;
    slotsPromise.then(s => { if (alive) setSlots(s); });
    return () => { alive = false; };
  }, []);
  return slots;   // { max, used, remaining } | null
}

// Meter/baki hanya dipapar bila slot dah diisi ≥20% — sebelum itu cukup teks "terhad 100 sebulan"
const METER_FROM = 0.2;
const showCount = s => s && s.remaining !== null && s.remaining !== undefined && ((s.used || 0) / (s.max || RH_MAX_SLOTS) >= METER_FROM || s.remaining <= 0);

export function SlotMeter({ dark }) {
  const s = useRhSlots();
  if (!s) return null;
  if (!showCount(s)) {
    return (
      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: dark ? '#FDE047' : '#B45309' }}>
        ⏳ Terhad {RH_MAX_SLOTS} pesakit baru sebulan — untuk menjaga kualiti bacaan
      </div>
    );
  }
  const pct = Math.min(100, Math.round(((s.used || 0) / (s.max || RH_MAX_SLOTS)) * 100));
  const full = s.remaining <= 0;
  return (
    <div style={{ maxWidth: '420px', margin: '0 auto', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: dark ? '#FEF3C7' : C.ink, marginBottom: '0.35rem' }}>
        <span>{full ? '⛔ Slot bulan ini penuh' : `🔥 Baki slot bulan ini: ${s.remaining} / ${s.max}`}</span>
        <span style={{ color: dark ? '#FCA5A5' : '#DC2626' }}>{pct}% diisi</span>
      </div>
      <div style={{ height: '8px', borderRadius: '999px', background: dark ? 'rgba(255,255,255,0.12)' : '#E2E8F0', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #F59E0B, #DC2626)' }} />
      </div>
    </div>
  );
}

// #1 ─ Announcement bar
export function AnnouncementBar() {
  const s = useRhSlots();
  return (
    <div style={{ background: '#042E23', color: '#FEF3C7', textAlign: 'center', padding: '0.6rem 1rem', fontFamily: ff, fontSize: '0.82rem', fontWeight: 700 }}>
      🌙 Dibacakan 2x sehari · Tak perlu keluar rumah · Perawat hanya terima {RH_MAX_SLOTS} pesakit baru sebulan
      {showCount(s) && <span style={{ color: '#FDE047' }}> · Baki {s.remaining} slot</span>}
    </div>
  );
}

// #2 ─ Hero
export function Hero() {
  return (
    <section style={{ background: 'linear-gradient(180deg, #ECFDF5 0%, #F0FDF4 45%, #FFFFFF 100%)', padding: '4rem 1.25rem 3.5rem', fontFamily: ff, textAlign: 'center', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(1.85rem, 4.5vw, 2.9rem)', fontWeight: 900, color: C.ink, lineHeight: 1.25, letterSpacing: '-0.025em', marginBottom: '1.2rem' }}>
          Masa berubat nampak dah pulih…{' '}
          <span style={{ color: C.green }}>tapi kenapa malam tu ia datang balik?</span>
        </h1>
        <h4 style={{ fontSize: 'clamp(1.05rem, 2.2vw, 1.22rem)', fontWeight: 600, color: '#1E293B', lineHeight: 1.65, maxWidth: '720px', margin: '0 auto 1.75rem' }}>
          Kini perawat E-Syifa bacakan ruqyah terus ke atas diri anda <strong style={{ color: C.green }}>setiap pagi &amp; malam</strong> — supaya gangguan tiada peluang menyorok dan kembali. 👇🏻
        </h4>

        <div style={{ margin: '0 auto 1.6rem', maxWidth: '560px', borderRadius: '20px', padding: '1.6rem 1.25rem', background: 'linear-gradient(135deg, #042E23, #065F46)', color: '#FEF3C7', boxShadow: '0 18px 45px rgba(4,46,35,0.25)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', color: '#FDE047', marginBottom: '0.6rem' }}>RUQYAH HARIAN E-SYIFA&apos;</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.1rem' }}>
            {[['🌅', 'Bacaan pagi'], ['🌙', 'Bacaan malam'], ['📅', 'Setiap hari']].map(([i, t]) => (
              <div key={t} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.9rem' }}>{i}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{t}</div>
              </div>
            ))}
          </div>
          <SlotMeter dark />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.88rem', color: C.muted }}>
          <span style={{ color: '#F59E0B' }}>★★★★★</span> Lebih 500 pesakit E-Syifa telah berikhtiar bersama kami
        </div>
        <a href="#borang" onClick={scrollToForm} style={{ display: 'inline-block', padding: '1.05rem 2.4rem', borderRadius: '50px', background: 'linear-gradient(180deg, #10B981, #047857)', color: '#FFFFFF', fontWeight: 900, fontSize: '1.05rem', textDecoration: 'none', boxShadow: '0 10px 28px rgba(4,120,87,0.35)' }}>
          👉🏻 PILIH PAKEJ SEKARANG
        </a>
      </div>
    </section>
  );
}

// #3 / #12 ─ Testimoni Sebenar Ruqyah Harian E-Syifa
const TESTIMONIALS_PART1 = [
  {
    name: 'Tuan Fauzi',
    location: 'Kuantan, Pahang',
    time: 'Semalam, 9:42 PM',
    tag: '⚡ Serangan Harian Dinetralkan',
    headline: 'Bisa sihir terus terbakar sebelum sempat masuk',
    text: 'Perniagaan saya disabotaj dengan sihir berulang. Dulu tiap kali balik dari jumpa perawat, elok sehari dua lepas tu sakit mencucuk datang balik sebab tukang sihir hembus mantera hari-hari. Sejak saya langgan servis pengisian harian ni, ustaz bacakan dan pasakkan ruqyah terus ke diri saya 2 kali setiap hari (pagi & malam). Rasa macam ada perisai tebal menyelubungi tubuh 24 jam. Hembusan sihir langsung tak tembus lagi. Kedai kembali meriah dan badan saya cergas setiap hari.',
  },
  {
    name: 'Puan Syuhada',
    location: 'Shah Alam, Selangor',
    time: 'Kelmarin, 10:15 PM',
    tag: '💚 Rohani Kuat & Jiwa Tenang',
    headline: 'Jiwa yang rapuh kini bertenaga semula',
    text: 'Kesan gangguan jin sebelum ni buatkan rohani saya lemah sangat. Cepat panik, anxiety tak tentu pasal, dan solat selalu rasa melayang was-was. Lepas seminggu ustaz buat pengisian ruqyah harian 2x sehari terus ke dalam batin saya, perubahan paling ketara adalah hati saya jadi luar biasa tenang. Fikiran tak lagi serabut, dada lapang dan rasa takut sendirian tu hilang terus. Macam ada kekuatan spiritual baru yang menyokong diri saya dari dalam.',
  },
  {
    name: 'Encik Hafizuddin',
    location: 'Wangsa Maju, KL',
    time: '3 hari lepas, 8:20 AM',
    tag: '🌙 Tidur Lena Tanpa Tindih',
    headline: 'Rutin tidur saya akhirnya pulih 100%',
    text: 'Dulu saya fobia nak tidur malam sebab hampir setiap hari kena tindih jam 3 pagi dan mimpi jatuh tempat tinggi. Bila subs servis ni, ustaz buat bacaan sesi pagi untuk bekalan tenaga harian saya, dan sesi petang/malam untuk pembersihan sebelum tidur. Masya-Allah, malam pertama bacaan kedua dibuat, saya tidur nyenyak sampai Subuh tanpa ada kelibat mengacau. Siang pula badan rasa bertenaga, tak lesu atau mengantuk macam dulu lagi.',
  },
  {
    name: 'Puan Hasnah',
    location: 'Ipoh, Perak',
    time: 'Ahad lepas, 6:05 PM',
    tag: '🔥 Saka 10 Tahun Menyerah',
    headline: 'Jin degil 10 tahun akhirnya musnah',
    text: 'Saka keturunan dalam badan saya ni licik. Kalau jumpa ustaz sebulan sekali, masa rawatan dia lari sekejap, lepas tu balik menyeksa saya semula. Tapi bila ustaz buat pengisian ruqyah pemusnah jin 2 kali sehari secara berterusan sepanjang bulan, jin tu langsung tak ada ruang nak bernafas. Hari ke-5 langganan, badan saya menggigil dan muntah lendir kuning pekat. Lepas tu rasa bisa di tengkuk yang bersarang 10 tahun hilang terus. Konsistensi harian ni memang penamat jin degil!',
  },
  {
    name: 'Dr. Ariff',
    location: 'Cyberjaya, Selangor',
    time: 'Isnin lepas, 11:30 PM',
    tag: '🛡️ Backup Rohani Orang Sibuk',
    headline: 'Ibarat ada perawat peribadi doakan kita setiap hari',
    text: 'Kerja saya di hospital sangat padat, balik rumah dah letih tak larat nak buat amalan benteng yang panjang-panjang. Tapi saya tahu badan saya ada gangguan sihir yang perlukan rawatan berterusan. Bila tahu ada servis langganan ruqyah jarak jauh 2x sehari ni, saya terus daftar. Rasa bersyukur sangat sebab walaupun saya sibuk, kebajikan rohani dan benteng diri saya tetap ada perawat berpengalaman yang tolong jagakan dan pasakkan setiap hari.',
  },
];

const TESTIMONIALS_PART2 = [
  {
    name: 'Puan Mariam',
    location: 'Ayer Keroh, Melaka',
    time: '2 hari lepas, 4:18 PM',
    tag: '💰 60x Rawatan Sebulan',
    headline: '60 kali rawatan sebulan, sangat berbaloi',
    text: 'Kalau ikutkan dulu, sekali pergi pusat rawatan habis RM150 upah, belum campur minyak dan penat beratur. Sebulan pergi 3-4 kali dah beratus ringgit melayang tapi sakit berulang lagi. Servis bayaran bulanan ni sangat berbaloi — bayar satu yuran bulanan yang mampu milik, ustaz bacakan ruqyah 2 kali sehari (sebulan 60 kali bacaan pengisian terus ke badan!). Tak perlu keluar rumah langsung tapi perlindungan dapat setiap hari.',
  },
  {
    name: 'Puan Zaleha',
    location: 'Seremban, N. Sembilan',
    time: 'Khamis lepas, 9:55 PM',
    tag: '🕊️ Sihir Pemisah Dinetralkan',
    headline: 'Rumahtangga kembali sejuk dan damai',
    text: 'Rumahtangga kami diuji sihir pemisah. Suami jadi pantang nampak muka saya, terus nak menengking tanpa sebab. Saya langgankan servis ni atas nama kami berdua. Alhamdulillah, setiap kali ada gelombang sihir cuba nak panaskan hati suami, bacaan ruqyah harian ustaz bertindak mencairkan sihir tu serta-merta. Sekarang suami dah tak baran, boleh berborak mesra macam mula kahwin dulu. Betul-betul perisai penyelamat rumahtangga.',
  },
  {
    name: 'Encik Kamaruzzaman',
    location: 'Sungai Petani, Kedah',
    time: 'Selasa lepas, 7:12 PM',
    tag: '✨ Detox Bisa & Santau Angin',
    headline: 'Bisa santau angin makin surut',
    text: 'Saya ada masalah bisa urat dan angin santau yang buat kaki tangan rasa kebas dan mencucuk tiap petang. Bila mula langganan ni, minggu pertama saya kerap sendawa kuat dan buang angin setiap kali selepas waktu bacaan ustaz dibuat. Masuk minggu kedua, rasa menyucuk di tapak kaki dah 90% hilang. Bangun pagi badan rasa ringan, tak ada lagi rasa berat macam memikul beban. Proses pembersihan harian ni betul-betul berkesan.',
  },
  {
    name: 'Cikgu Nabilah',
    location: 'Bandar Seri Begawan, Brunei',
    time: 'Jumaat lepas, 8:40 PM',
    tag: '🌏 Jarak Jauh Tanpa Sempadan',
    headline: 'Jarak beribu batu bukan halangan',
    text: 'Di tempat saya susah nak cari perawat ruqyah syar\'iyyah yang serasi. Bila tahu ESyifaa sediakan khidmat ruqyah harian jarak jauh, saya terus langgan. Subhanallah, walaupun jarak jauh, doa dan bacaan ayat suci Al-Quran tak ada sempadan. Setiap kali waktu perawat wiridkan, saya dapat rasa meremang dan haba sejuk keluar dari tengkuk saya. Gangguan mimpi makhluk hitam dah berhenti sepenuhnya sejak bulan lepas.',
  },
  {
    name: 'Puan Noraini',
    location: 'Klang, Selangor',
    time: 'Semalam, 11:05 AM',
    tag: '🔒 Langganan Masuk Bulan Ke-3',
    headline: 'Pelaburan terbaik untuk kesihatan rohani & jasmani',
    text: 'Saya bandingkan hidup saya sebelum langgan dengan sekarang. Dulu hidup murung, asyik sakit-sakit badan, perniagaan sempit, emosi tak menentu sebab gangguan tak putus-putus. Tapi sekarang bila diri diisi ruqyah 2x sehari secara konsisten, hidup saya rasa dilindungi sepenuhnya. Rezeki makin lapang, badan sihat dan keluarga bahagia. Saya memang takkan lepaskan servis langganan ni selagi mampu, ibarat bayar takaful tapi ini takaful rohani 24 jam.',
  },
];

function WaBubble({ t }) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', textAlign: 'left' }}>
      <div style={{ background: '#F0FDF4', borderBottom: '1px solid #E2E8F0', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#FFFFFF' }}>
            {t.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: C.ink }}>{t.name}</div>
            <div style={{ fontSize: '0.7rem', color: C.muted }}>📍 {t.location}</div>
          </div>
        </div>
        <div style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>{t.time}</div>
      </div>
      <div style={{ padding: '1.1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '0.9rem 1rem', borderLeft: '3px solid #10B981', marginBottom: '0.85rem' }}>
          {t.headline && (
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#042E23', marginBottom: '0.35rem' }}>
              &ldquo;{t.headline}&rdquo;
            </div>
          )}
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155', lineHeight: 1.65 }}>
            {t.text}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ background: C.greenSoft, border: `1px solid ${C.border}`, color: C.green, fontSize: '0.73rem', fontWeight: 700, padding: '0.25rem 0.7rem', borderRadius: '9999px' }}>
            {t.tag}
          </span>
          <span style={{ fontSize: '0.72rem', color: '#D97706', fontWeight: 700 }}>
            ⭐⭐⭐⭐⭐
          </span>
        </div>
      </div>
    </div>
  );
}

export function Testimonials({ part = 1 }) {
  const items = part === 1 ? TESTIMONIALS_PART1 : TESTIMONIALS_PART2;
  return (
    <Section bg="#F8FAF9" max="960px">
      <Chip>💬 Bukti Pengalaman Pesakit (Gelombang {part})</Chip>
      <H2>{part === 1 ? 'Kisah Mereka Yang Dibacakan Ruqyah Setiap Hari' : 'Betul Ke Dibaca Dari Jauh Setiap Hari Berkesan?'}</H2>
      <p style={{ fontSize: '0.95rem', color: C.muted, lineHeight: 1.65, maxWidth: '560px', margin: '0 auto 2.5rem' }}>
        {part === 1 ? 'Mesej WhatsApp terus daripada pesakit Ruqyah Harian — ikhtiar berterusan, dengan izin Allah.' : 'Jom baca apa kata mereka yang dah melanggan Ruqyah Harian E-Syifa 👇'}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {items.map(t => <WaBubble key={t.name} t={t} />)}
      </div>
    </Section>
  );
}

// #4 ─ Problems
const PROBLEMS = [
  ['😮‍💨', 'Masa dirawat meracau & muntah — esoknya rasa sama semula'],
  ['🌑', 'Bila sorang-sorang waktu malam, rasa diperhati & ditindih'],
  ['😵', 'Mimpi ngeri berulang, bangun penat walaupun tidur lama'],
  ['🔥', 'Emosi tiba-tiba panas, benci pada pasangan atau keluarga'],
  ['🚗', 'Dah tak larat ulang-alik jumpa perawat setiap kali datang balik'],
  ['📿', 'Nak amal sendiri, tapi tak konsisten & tak tahu nak baca apa'],
];
export function Problems() {
  return (
    <Section>
      <H2>Dah berubat, tapi gangguan datang balik lagi dan lagi…</H2>
      <p style={{ fontSize: '1.02rem', color: C.body, lineHeight: 1.7, maxWidth: '700px', margin: '0 auto 2rem' }}>
        Lepas dirawat badan rasa ringan. Seminggu dua, semuanya kembali — tidur terganggu, rasa berat di bahu, rumah terasa panas. Duit habis, penat ulang-alik, tapi tak pernah betul-betul selesai.
      </p>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: C.ink, margin: '0 0 1.25rem' }}>Anda ada masalah ni? 👇🏻</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.85rem', textAlign: 'left' }}>
        {PROBLEMS.map(([i, t]) => (
          <div key={t} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '1rem', borderRadius: '14px', background: '#FEF2F2', border: '1px solid #FECACA' }}>
            <span style={{ fontSize: '1.4rem' }}>{i}</span>
            <span style={{ fontSize: '0.92rem', color: '#7F1D1D', fontWeight: 600, lineHeight: 1.5 }}>{t}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

// #5 ─ Fears (angle A2)
export function Fears() {
  return (
    <Section bg="#0B1410" max="780px">
      <Chip dark>⚠️ Sila beri perhatian</Chip>
      <H2 dark>Helah ni yang buat gangguan bertahun tak selesai</H2>
      <div style={{ textAlign: 'left', color: '#D1FAE5', fontSize: '1rem', lineHeight: 1.8, display: 'grid', gap: '1rem' }}>
        <p style={{ margin: 0 }}>Jin yang dihantar <strong style={{ color: '#FDE047' }}>tak bodoh</strong>. Masa anda dirawat, ia boleh keluar sekejap — anda meracau, muntah, kemudian boleh mengucap bila disuruh. Semua orang sangka dah pulih.</p>
        <p style={{ margin: 0 }}>Tapi bila rawatan berhenti dan anda bersendirian, <strong style={{ color: '#FCA5A5' }}>ia masuk semula</strong> — selagi tukang sihir tak berhenti menghantar.</p>
        <p style={{ margin: 0 }}>Kalau dibiarkan, ia makin selesa: tidur makin terganggu, rumahtangga makin retak, ibadah makin berat. Rawatan sebulan sekali tak mampu kejar serangan yang datang <strong style={{ color: '#FDE047' }}>setiap hari</strong>.</p>
      </div>
    </Section>
  );
}

// #6 ─ Authority
export function Authority() {
  return (
    <Section bg="#F8FAF9" max="820px">
      <Chip>📖 Panduan Al-Quran &amp; Sunnah</Chip>
      <H2>Ruqyah Yang Istiqamah — Bukan Sekali-Sekala</H2>
      <div style={{ display: 'grid', gap: '1rem', textAlign: 'left' }}>
        <blockquote style={{ margin: 0, padding: '1.25rem 1.4rem', background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: '14px' }}>
          <p style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', color: C.ink, fontStyle: 'italic', lineHeight: 1.7 }}>
            &ldquo;Dan Kami turunkan daripada Al-Quran sesuatu yang menjadi penawar dan rahmat bagi orang-orang yang beriman.&rdquo;
          </p>
          <span style={{ fontSize: '0.82rem', color: C.green, fontWeight: 700 }}>— Surah Al-Isra&apos;, ayat 82</span>
        </blockquote>
        <p style={{ margin: 0, fontSize: '0.98rem', color: C.body, lineHeight: 1.75 }}>
          Ruqyah syar&apos;iyyah ialah bacaan ayat Al-Quran dan doa — tidak terhad oleh jarak. Yang membezakan hasilnya ialah <strong>keistiqamahan</strong>: gangguan yang datang setiap hari perlu dilawan dengan bacaan yang berterusan setiap hari, dengan izin Allah.
        </p>
      </div>
    </Section>
  );
}

// #7 + #8 ─ Solution & manfaat
const BENEFITS = [
  'Dibacakan 2x sehari — tiada hari terlepas sepanjang langganan',
  'Jin tiada ruang menyorok di antara sesi rawatan',
  'Ikhtiar patahkan sihir yang dihantar berulang kali',
  'Benteng diri diperbaharui setiap pagi & malam',
  'Bantu tidur lebih lena & kurangkan mimpi ngeri',
  'Kuatkan rohani — ibadah terasa lebih ringan',
  'Tak perlu keluar rumah, tak perlu pos barang — privasi terjaga',
  'Sesuai untuk yang tak larat amal sendiri, warga emas & kes berat',
];
export function Solution() {
  return (
    <Section>
      <Chip>✨ Penyelesaian</Chip>
      <H2>
        <span style={{ color: C.green }}>Ruqyah Harian E-Syifa</span> bantu halau gangguan jin, patahkan sihir &amp; kuatkan benteng diri — dibaca untuk anda setiap hari
      </H2>
      <p style={{ fontSize: '1.02rem', color: C.body, lineHeight: 1.7, maxWidth: '700px', margin: '0 auto 2.25rem' }}>
        Perawat bacakan 4 lapisan ruqyah jarak jauh atas nama anda <strong>2 kali sehari</strong>. Anda tak perlu buat apa-apa — teruskan hidup harian, bacaan berjalan untuk anda.
      </p>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: C.ink, margin: '0 0 1.1rem' }}>8 manfaat Ruqyah Harian E-Syifa</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem', textAlign: 'left' }}>
        {BENEFITS.map((b, i) => (
          <div key={b} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.95rem 1rem', borderRadius: '12px', background: C.greenSoft, border: `1px solid ${C.border}` }}>
            <span style={{ flexShrink: 0, width: '26px', height: '26px', borderRadius: '50%', background: C.green, color: '#FFFFFF', fontSize: '0.78rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
            <span style={{ fontSize: '0.92rem', color: C.ink, fontWeight: 600, lineHeight: 1.5 }}>{b}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

// #9 ─ Fungsi elemen: 4 lapisan + sekali vs harian
const LAYERS = [
  ['🔥', 'Ayat pembakar jin', 'Hancurkan sarang jin, jin degil & saka yang menumpang'],
  ['✂️', 'Ayat pembatal sihir', 'Putuskan ikatan sihir, buhul ghaib, santau & sihir pemisah'],
  ['🛡️', 'Ayat benteng daripada sihir dan gangguan jin', 'Dinding pertahanan supaya sihir baru & jin luar tak masuk semula'],
  ['💚', "Ayat-ayat syifa', untuk bantu pemulihan diri", 'Pulihkan tubuh, buang lesu & stabilkan emosi'],
];
export function Elements() {
  const row = (label, a, b, hl) => (
    <tr>
      <td style={{ padding: '0.75rem', fontWeight: 700, color: C.ink, borderTop: '1px solid #E2E8F0', textAlign: 'left' }}>{label}</td>
      <td style={{ padding: '0.75rem', color: '#991B1B', borderTop: '1px solid #E2E8F0' }}>{a}</td>
      <td style={{ padding: '0.75rem', color: C.green, fontWeight: hl ? 800 : 600, borderTop: '1px solid #E2E8F0', background: '#F0FDF4' }}>{b}</td>
    </tr>
  );
  return (
    <Section bg="#F8FAF9">
      <Chip>⚗️ Apa Yang Dibacakan</Chip>
      <H2>4 Lapisan Ruqyah — Dibaca Pagi &amp; Malam</H2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.9rem', margin: '1.5rem 0 2.5rem' }}>
        {LAYERS.map(([i, t, d], n) => (
          <div key={t} style={{ background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: '16px', padding: '1.25rem 1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: C.muted }}>LAPISAN 0{n + 1}</div>
            <div style={{ fontSize: '2rem', margin: '0.35rem 0' }}>{i}</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: C.ink, marginBottom: '0.35rem' }}>{t}</div>
            <div style={{ fontSize: '0.83rem', color: C.muted, lineHeight: 1.5 }}>{d}</div>
          </div>
        ))}
      </div>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: C.ink, margin: '0 0 1rem' }}>Rawatan sekali-sekala vs Ruqyah Harian</h3>
      <div style={{ overflowX: 'auto', borderRadius: '14px', border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', minWidth: '480px' }}>
          <thead>
            <tr style={{ background: '#F1F5F9' }}>
              <th style={{ padding: '0.75rem' }} />
              <th style={{ padding: '0.75rem', color: '#991B1B' }}>Rawatan sekali-sekala</th>
              <th style={{ padding: '0.75rem', color: C.green, background: '#DCFCE7' }}>Ruqyah Harian E-Syifa&apos;</th>
            </tr>
          </thead>
          <tbody>
            {row('Kekerapan bacaan', 'Sebulan / 2–3 bulan sekali', '2x sehari, setiap hari', true)}
            {row('Bacaan sebulan', '1 kali', '±60 kali', true)}
            {row('Bila gangguan menyorok', 'Ia kembali bila sesi tamat', 'Dibaca lagi petang & esok paginya')}
            {row('Perlu keluar rumah', 'Ya', 'Tidak')}
            {row('Pesakit perlu amal sendiri', 'Ya, kalau mahu kesan berterusan', 'Tidak wajib')}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

// #10 ─ Goals
const GOALS = [
  'Tidur lena tanpa ditindih & mimpi ngeri',
  'Badan ringan, ibadah lebih khusyuk',
  'Emosi stabil, rumahtangga kembali tenang',
  'Tak lagi bergantung pada jadual perawat',
  'Gangguan berkurangan hari demi hari, dengan izin Allah',
];
export function Goals() {
  return (
    <Section max="760px">
      <Chip>🎯 Apa Yang Kami Doakan Untuk Anda</Chip>
      <H2>Bayangkan hidup anda bila gangguan tak lagi kembali</H2>
      <div style={{ display: 'grid', gap: '0.7rem', textAlign: 'left', marginTop: '1.25rem' }}>
        {GOALS.map(g => (
          <div key={g} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.95rem 1.1rem', borderRadius: '12px', background: '#F0FDF4', border: `1px solid ${C.border}`, fontWeight: 700, color: C.ink }}>
            <span style={{ fontSize: '1.15rem' }}>✅</span>{g}
          </div>
        ))}
      </div>
    </Section>
  );
}

// #11 ─ Cara guna (cara menerima bacaan)
const STEPS = [
  ['📝', 'Daftar & bayar', 'Pilih pakej di bawah dan bayar melalui FPX. Perawat akan hubungi anda di WhatsApp.'],
  ['📸', 'Hantar nama penuh & gambar diri', 'Untuk bacaan dibuat atas nama anda. Anda juga dimasukkan ke channel WhatsApp pesakit Ruqyah Harian untuk makluman.'],
  ['🤲', 'Teruskan hidup harian', 'Bacaan berjalan 2x sehari. Jika mahu, duduk tenang, baca Al-Fatihah & niatkan menerima bacaan ruqyah — rasai sendiri tindak balas badan.'],
];
export function HowItWorks() {
  return (
    <Section bg="#F8FAF9">
      <Chip>📸 Cara Ia Berfungsi</Chip>
      <H2>Cara mula dibacakan Ruqyah Harian E-Syifa</H2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '1.5rem', textAlign: 'left' }}>
        {STEPS.map(([i, t, d], n) => (
          <div key={t} style={{ background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: '16px', padding: '1.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
              <span style={{ width: '30px', height: '30px', borderRadius: '50%', background: C.green, color: '#FFFFFF', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{n + 1}</span>
              <span style={{ fontSize: '1.5rem' }}>{i}</span>
            </div>
            <div style={{ fontWeight: 800, color: C.ink, marginBottom: '0.35rem' }}>{t}</div>
            <div style={{ fontSize: '0.88rem', color: C.body, lineHeight: 1.6 }}>{d}</div>
          </div>
        ))}
      </div>
      <p style={{ marginTop: '1.25rem', fontSize: '0.85rem', color: C.muted }}>
        Jika ada gangguan, badan mungkin bertindak balas — sendawa, loya, rasa panas atau sejuk. Itu tanda gangguan sedang ditolak keluar, dengan izin Allah.
      </p>
    </Section>
  );
}

// #14 ─ Jaminan
export function Guarantee() {
  return (
    <Section max="760px">
      <div style={{ border: '2px solid #FDE68A', background: '#FFFBEB', borderRadius: '20px', padding: '2rem 1.5rem' }}>
        <div style={{ fontSize: '2.5rem' }}>🛡️</div>
        <H2>Jaminan 30 Hari Wang Dikembalikan</H2>
        <p style={{ margin: 0, fontSize: '0.98rem', color: C.body, lineHeight: 1.75 }}>
          Jika tiada sebarang perubahan positif dalam masa 30 hari selepas bacaan bermula, kami pulangkan semula 100% bayaran anda. Kami yakin kerana telah membantu ramai pesakit yang mengalami masalah sama seperti anda — namun kesembuhan tetap milik Allah, kami hanya berikhtiar.
        </p>
      </div>
    </Section>
  );
}

// #17 ─ FAQ
const FAQS = [
  ['Macam mana ruqyah boleh dibaca dari jauh?', 'Ruqyah syar\'iyyah ialah bacaan ayat Al-Quran dan doa — tidak terhad oleh jarak. Kalau masih ragu, cuba dahulu air tawar jarak jauh secara percuma (butang di bawah).'],
  ['Saya perlu buat apa setiap hari?', 'Tiada amalan wajib. Bacaan dibuat oleh perawat 2 kali sehari atas nama anda. Jika mahu, anda boleh duduk tenang, baca Al-Fatihah dan niatkan untuk menerima bacaan.'],
  ['Apa beza dengan Pengisian Item E-Syifa?', 'Pengisian Item: ayat ruqyah diisi ke dalam barang peribadi dan anda amalkan sendiri. Ruqyah Harian: perawat yang bacakan terus ke atas diri anda setiap hari — sesuai untuk yang tak larat atau tak konsisten mengamal sendiri.'],
  ['Maklumat apa yang perlu saya beri?', 'Nama penuh dan gambar diri. Perawat akan minta melalui WhatsApp selepas bayaran berjaya.'],
  ['Kenapa ada had 100 pesakit sebulan?', 'Setiap nama dibacakan 2 kali sehari dengan penuh perhatian. Untuk menjaga kualiti bacaan, perawat hanya menerima 100 pendaftaran baru setiap bulan.'],
  ['Ini tangkal atau ada unsur syirik?', 'Tidak. 100% ruqyah syar\'iyyah — bacaan Al-Quran, doa & zikir. Tiada rajah, wafak, khodam atau jin dampingan. Kesembuhan hanya daripada Allah.'],
  ['Ada jaminan? Bagaimana selepas tempoh tamat?', 'Ada — jaminan 30 hari wang dikembalikan. Tiada potongan automatik; kami akan ingatkan di WhatsApp sebelum tempoh langganan tamat, dan anda boleh pilih untuk sambung.'],
];
export function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <Section bg="#F8FAF9" max="780px">
      <Chip>❓ Soalan Lazim</Chip>
      <H2>Ada pertanyaan?</H2>
      <div style={{ display: 'grid', gap: '0.6rem', textAlign: 'left', marginTop: '1.25rem' }}>
        {FAQS.map(([q, a], i) => (
          <div key={q} style={{ background: '#FFFFFF', border: `1px solid ${open === i ? C.border : '#E2E8F0'}`, borderRadius: '12px', overflow: 'hidden' }}>
            <button onClick={() => setOpen(open === i ? null : i)} style={{ width: '100%', padding: '1rem 1.2rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', gap: '0.75rem', textAlign: 'left', fontFamily: ff, fontSize: '0.95rem', fontWeight: 700, color: C.ink }}>
              {q}<span style={{ color: C.green, transform: open === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
            </button>
            {open === i && <div style={{ padding: '0 1.2rem 1.1rem', fontSize: '0.9rem', color: C.body, lineHeight: 1.7 }}>{a}</div>}
          </div>
        ))}
      </div>
    </Section>
  );
}

// Penutup
export function Closing() {
  return (
    <Section bg="linear-gradient(180deg, #042E23, #021812)" max="760px">
      <H2 dark>Jangan biar ia datang balik lagi.</H2>
      <p style={{ color: '#A7F3D0', fontSize: '1.02rem', lineHeight: 1.7, margin: '0 0 1.75rem' }}>
        Mula dibacakan ruqyah setiap pagi &amp; malam — hari ini. Slot terhad {RH_MAX_SLOTS} pesakit baru sebulan.
      </p>
      <div style={{ marginBottom: '1.5rem' }}><SlotMeter dark /></div>
      <a href="#borang" onClick={scrollToForm} style={{ display: 'inline-block', padding: '1.05rem 2.4rem', borderRadius: '50px', background: 'linear-gradient(180deg, #FDE047, #EAB308)', color: '#042E23', fontWeight: 900, textDecoration: 'none' }}>
        👉🏻 DAFTAR RUQYAH HARIAN
      </a>
    </Section>
  );
}

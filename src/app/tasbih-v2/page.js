'use client';

import { useState } from 'react';
import { trackWaClick, HQ_WHATSAPP } from '@/components/salespage/useSalesContact';

// ─── WhatsApp Button ─────────────────────────────────────────────────────────
// No. WhatsApp HQ
const WA_NUMBER   = HQ_WHATSAPP;
const WA_MESSAGE  = encodeURIComponent("Assalamualaikum, saya berminat untuk mendapatkan Tasbih E-Syifa'. Boleh saya tahu maklumat lanjut?");
const WA_LINK     = WA_NUMBER ? `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}` : '#order';

function WAButton({ label = "👉 Saya Mahu Tasbih E-Syifa'", size = 'large', id = 'cta-wa' }) {
  const isLarge = size === 'large';
  return (
    <a
      id={id}
      href={WA_LINK}
      target={WA_NUMBER ? '_blank' : '_self'}
      rel="noopener noreferrer"
      onClick={() => {
        try { window.fbq('track', 'InitiateCheckout'); } catch (_) {}
        if (WA_NUMBER) trackWaClick({ product: "Tasbih E-Syifa'" });   // Lead + rekod klik
      }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.55rem',
        padding: isLarge ? '1.15rem 2.4rem' : '0.85rem 1.8rem',
        fontSize: isLarge ? '1.1rem' : '0.95rem',
        fontWeight: 800, color: '#042E23',
        background: 'linear-gradient(180deg, #FDE047 0%, #EAB308 100%)',
        borderRadius: '50px', textDecoration: 'none',
        boxShadow: '0 10px 25px rgba(234,179,8,0.45)',
        border: '2px solid #FEF08A', letterSpacing: '-0.01em',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 30px rgba(234,179,8,0.55)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(234,179,8,0.45)'; }}
    >
      {label}
    </a>
  );
}

// ─── Shared Styles ────────────────────────────────────────────────────────────
const S = {
  dark:    { background: '#042E23', color: '#FFFFFF', padding: '4rem 1rem', fontFamily: 'var(--font-inter), -apple-system, sans-serif' },
  darker:  { background: '#031E17', color: '#FFFFFF', padding: '4rem 1rem', fontFamily: 'var(--font-inter), -apple-system, sans-serif' },
  mid:     { background: '#0B382D', color: '#FFFFFF', padding: '4rem 1rem', fontFamily: 'var(--font-inter), -apple-system, sans-serif' },
  light:   { background: '#FFFFFF', color: '#0F172A', padding: '4rem 1rem', fontFamily: 'var(--font-inter), -apple-system, sans-serif' },
  wrap:    { maxWidth: '920px', margin: '0 auto' },
  badge: (color = '#FDE047') => ({
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    background: `rgba(253,224,71,0.12)`, border: `1px solid ${color}`,
    padding: '0.4rem 1.1rem', borderRadius: '50px', marginBottom: '1.25rem',
    fontSize: '0.78rem', fontWeight: 800, color, letterSpacing: '0.08em', textTransform: 'uppercase',
  }),
  h2gold: { fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 800, color: '#FDE047', marginTop: '0.4rem', marginBottom: '0.75rem', letterSpacing: '-0.02em', lineHeight: 1.25 },
  h2dark: { fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 800, color: '#042E23', marginTop: '0.4rem', marginBottom: '0.75rem', letterSpacing: '-0.02em', lineHeight: 1.25 },
  sub: (col = '#D1FAE5') => ({ fontSize: '1rem', color: col, lineHeight: 1.65, maxWidth: '720px', margin: '0 auto 2.5rem auto' }),
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const PROBLEMS = [
  { icon: '🔄', title: 'Jin Keluar Masa Rawatan... Tapi Datang Balik', desc: 'Perawat bantu buang jin semasa sesi. Tapi apabila balik rumah, sihir dihantar semula. Jin datang lagi. Kitaran ini tidak pernah selesai tanpa perlindungan berterusan.' },
  { icon: '📬', title: 'Sihir Dihantar Berkali-Kali', desc: 'Ada pihak yang sengaja menghantar sihir berulang kali. Setiap kali rawatan selesai, serangan baru datang. Satu sesi rawatan tidak pernah cukup untuk kes sebegini.' },
  { icon: '💸', title: 'Kos & Tenaga Terkuras — Ulang Alik Tak Habis', desc: 'Setiap kali serangan baru, kena pergi semula berjumpa perawat. Kos tambang, kos rawatan, masa terbuang — dan masalah tetap berulang tanpa penghujung.' },
  { icon: '💧', title: 'Air Penawar Habis, Perlindungan Terputus', desc: 'Air yang dibacakan berkesan, tapi ia habis. Bila habis, tiada perlindungan. Terpaksa tunggu dapatkan bekalan baru — sementara itu anda terdedah kepada serangan.' },
  { icon: '🌙', title: 'Diserang Waktu Malam — Tiada Apa Nak Buat', desc: 'Serangan datang tengah malam. Perawat tidak boleh dihubungi waktu itu. Tiada air penawar. Tiada perlindungan. Anda terpaksa tahan seorang diri hingga pagi.' },
  { icon: '😰', title: 'Kes Berat Perlukan Rawatan Berterusan', desc: 'Kes sihir berat atau saka lama tidak boleh selesai dengan satu atau dua sesi rawatan. Ia memerlukan rawatan yang konsisten, berterusan — sesuatu yang mahal jika bergantung pada perawat.' },
];

const FEARS = [
  { icon: '📉', title: 'Gangguan Makin Parah Bila Dibiarkan', desc: 'Setiap hari tanpa rawatan, gangguan mengakar lebih dalam. Apa yang boleh diselesaikan awal, menjadi semakin sukar apabila ditangguh.' },
  { icon: '🔗', title: 'Sihir Penghalang Rezeki Terus Mengikat', desc: 'Selagi sihir tidak dinyahkan sepenuhnya, pintu rezeki kekal terkunci. Perniagaan terus sunyi. Peluang datang tapi hilang begitu sahaja.' },
  { icon: '👨‍👩‍👧', title: 'Keluarga & Anak-Anak Turut Terdedah', desc: 'Gangguan di dalam rumah boleh merebak kepada ahli keluarga lain — terutama anak-anak yang lebih sensitif dan mudah terdedah kepada gangguan ghaib.' },
  { icon: '🧠', title: 'Mental & Emosi Terhakis Perlahan-Lahan', desc: 'Serangan berulang tanpa perlindungan menyebabkan tekanan, anxiety, dan kemurungan. Lama-kelamaan, kekuatan diri semakin lemah dan tidak terasa.' },
  { icon: '💔', title: 'Rumahtangga Retak Kerana Campur Tangan Sihir', desc: 'Sihir pemisah yang tidak dirawat boleh membuatkan pasangan berubah hati secara perlahan. Perbalahan tanpa sebab. Perasaan dingin. Rumah tangga perlahan-lahan hancur.' },
  { icon: '💰', title: 'Kos Rawatan Berulang Terus Membebankan', desc: 'Tanpa cara rawatan sendiri, anda terpaksa terus bergantung pada perawat luar. Kos bertimbun. Jika ada perlindungan sendiri, semua ini boleh dielakkan.' },
];

const BENEFITS = [
  { icon: '♾️', title: 'Rawatan Tanpa Had — Seumur Hidup', desc: 'Tidak ada had bilangan rawatan. Guna setiap hari, setiap minggu — tasbih tidak pernah habis atau perlu diisi semula.' },
  { icon: '⚡', title: 'Bertindak Balas Bila-Bila Masa Diserang', desc: 'Diserang malam-malam? Tidak perlu tunggu appointment. Tidak perlu tunggu perawat. Guna tasbih terus ketika itu juga.' },
  { icon: '🏠', title: 'Rawat Di Rumah Sendiri — Tiada Perlu Keluar', desc: 'Dalam keselesaan rumah anda sendiri. Tiada perlu keluar, tiada perlu buat appointment, tiada perlu tunggu giliran.' },
  { icon: '💧', title: 'Buat Air Penawar Sendiri Bila Perlu', desc: 'Guna tasbih untuk buat air penawar sendiri — tidak perlu bergantung pada orang lain untuk dapatkan air berisian.' },
  { icon: '🚿', title: 'Buat Air Mandian Ruqyah Sendiri', desc: 'Boleh digunakan untuk buat air mandian — membersihkan badan dan melindungi diri dari gangguan luar.' },
  { icon: '🛡️', title: 'Perlindungan 24 Jam Setiap Hari', desc: 'Ibarat ada perawat private di rumah. Perlindungan berterusan tanpa henti — siang atau malam.' },
  { icon: '👨‍👩‍👧', title: 'Boleh Bantu Seluruh Keluarga', desc: 'Satu tasbih boleh membantu semua ahli keluarga — isteri, suami, anak-anak. Jimat kos berbanding rawatan berasingan.' },
  { icon: '💰', title: 'Jimat Kos Jangka Panjang', desc: 'Bayar sekali sahaja, guna seumur hidup. Bandingkan dengan kos berulang kali ke perawat — penjimatan yang luar biasa.' },
  { icon: '📖', title: '100% Ruqyah Syar\'iyyah', desc: 'Diisi oleh perawat ESyifa\' dengan bacaan Al-Quran dan doa berlandaskan syarak semata-mata. Tiada unsur syirik.' },
  { icon: '🌿', title: 'Cara Guna Mudah & Ringkas', desc: 'Cukup berniat, berdoa kepada Allah dan yakin. Panduan lengkap diberikan selepas pembelian.' },
];

const TASBIH_ELEMENTS = [
  { icon: '📖', name: 'Ayat-Ayat Ruqyah Al-Quran', desc: 'Kalam Allah yang menjadi penawar kepada segala penyakit hati dan jasad. Bacaan ayat-ayat tertentu yang khusus untuk menghapuskan sihir, mengusir jin dan memecahkan ikatan.' },
  { icon: '🤲', name: 'Asmaul Husna Allah SWT', desc: 'Nama-nama Allah Yang Maha Agung diisikan sebagai kuasa perlindungan dan penyembuhan. Setiap nama membawa keistimewaan dan kekuatan yang berbeza dari sisi Allah.' },
  { icon: '📿', name: 'Doa-Doa Sunnah Nabi ﷺ', desc: 'Doa-doa yang bersumber dari Sunnah Nabi Muhammad ﷺ — sahih, bersih dari sebarang syirik atau bid\'ah. Hanya amalan yang diiktiraf dan dipraktikkan oleh ulama.' },
  { icon: '🔒', name: 'Pasak & Niat Khusus', desc: 'Setiap tasbih dipasakkan dengan niat dan bacaan khusus oleh perawat ESyifa\'. Proses ini mengambil masa lama dan dilakukan dengan penuh teliti — inilah sebab stok adalah terhad.' },
];

const GOALS = [
  { icon: '⚡', title: 'Boleh Rawat Diri Sendiri Bila Diserang — Tanpa Tunggu', desc: 'Sebaik sahaja berasa diserang atau tidak selesa, anda boleh terus bertindak. Tidak perlu hubungi perawat, tidak perlu tunggu appointment.' },
  { icon: '🌙', title: 'Perlindungan 24/7 — Malam Pun Selamat', desc: 'Serangan paling kerap berlaku waktu malam. Dengan Tasbih E-Syifa\' di tangan, anda bersedia setiap masa — siang atau malam.' },
  { icon: '💰', title: 'Jimat Kos — Tidak Perlu Ulang Alik Ke Perawat', desc: 'Kos perjalanan, kos rawatan, masa terbuang — semua ini berkurangan drastik apabila anda mampu rawat sendiri di rumah.' },
  { icon: '💧', title: 'Buat Air Penawar Sendiri Bila Perlu', desc: 'Tidak perlu bergantung pada orang lain untuk dapatkan air berisian. Buat sendiri, bila-bila masa, menggunakan tasbih anda.' },
  { icon: '🏡', title: 'Rasa Lebih Tenang & Selamat Di Rumah', desc: 'Mengetahui anda ada perlindungan yang sentiasa bersama memberikan ketenangan jiwa. Rumah terasa lebih selamat dan terlindung.' },
];

const KEGUNAAN = [
  { no: '01', icon: '🌿', title: 'Rawatan Kendiri Terus', desc: 'Genggam dan gunakan terus apabila rasa diserang, badan tidak selesa, atau merasai ada gangguan. Boleh rawat diri sendiri 24/7 tanpa perlu bergantung kepada sesiapa.' },
  { no: '02', icon: '💧', title: 'Buat Air Penawar Sendiri', desc: 'Gunakan tasbih untuk mengisi bacaan ruqyah ke dalam air — hasilkan sendiri air penawar untuk diminum, membersihkan sihir dan membuang jin dari dalam badan.' },
  { no: '03', icon: '🚿', title: 'Air Mandian Ruqyah', desc: 'Isi bacaan ruqyah ke dalam air mandian — membersihkan badan dan rohani dari gangguan luar, sihir yang menempel pada badan, dan pengaruh jin dari persekitaran.' },
  { no: '04', icon: '🛡️', title: 'Pagar & Lindungi Rumah', desc: 'Gunakan tasbih untuk mengisi bacaan ruqyah ke dalam garam atau air — sebar di sekeliling rumah untuk mewujudkan "pagar" spiritual yang melindungi ahli keluarga.' },
];

const UNTUK_SIAPA = [
  'Dah berubat banyak kali tapi gangguan masih berulang',
  'Kes sihir atau santau yang dihantar berkali-kali oleh musuh',
  'Mahu rawat sendiri tanpa perlu bergantung pada perawat',
  'Mahu jimat kos — tidak mahu ulang alik ke perawat setiap kali diserang',
  'Diserang malam-malam & perlu bertindak segera tanpa tunggu',
  'Ada ahli keluarga lain yang memerlukan perlindungan juga',
  'Kes berat yang memerlukan rawatan berterusan jangka panjang',
  'Mahu mempunyai "perawat private" di dalam rumah sendiri',
];

const FAQS = [
  { q: 'Adakah tasbih ini menggantikan rawatan dengan perawat?', a: 'Tasbih E-Syifa\' adalah pelengkap dan perlindungan berterusan — bukan pengganti rawatan profesional. Ia memberikan anda keupayaan untuk meneruskan rawatan sendiri di antara sesi, atau untuk kes yang memerlukan perlindungan berterusan setiap hari.' },
  { q: 'Apakah bacaan yang diisikan ke dalam tasbih?', a: 'Tasbih diisi dengan bacaan ayat-ayat ruqyah syar\'iyyah daripada Al-Quran, Asmaul Husna, dan doa-doa yang sabit daripada Sunnah. Semua bacaan berlandaskan syarak — tiada unsur syirik, bid\'ah atau kaedah lagha.' },
  { q: 'Berapa lama masa untuk siapkan satu tasbih?', a: 'Setiap tasbih mengambil masa yang lama untuk diisikan kerana proses bacaan ruqyah yang teliti, menyeluruh dan penuh konsentrasi. Inilah sebabnya stok kami adalah terhad pada setiap masa.' },
  { q: 'Macam mana nak guna tasbih ni sebenarnya?', a: 'Cara guna adalah mudah — cukup berniat, berdoa kepada Allah dan yakin dengan izin-Nya. Panduan lengkap cara penggunaan untuk semua 4 kegunaan (rawatan kendiri, air penawar, air mandian, pagar rumah) akan diberikan bersama penghantaran.' },
  { q: 'Adakah sesuai untuk kanak-kanak?', a: 'Ya, boleh digunakan untuk membantu kanak-kanak — terutama yang mengalami gangguan tidur, kerap menangis tanpa sebab, demam misteri, atau menunjukkan simptom gangguan ghaib.' },
  { q: 'Adakah perlu "isi semula" bacaan tasbih dari masa ke masa?', a: 'Tidak perlu. Bacaan yang dipasakkan dalam tasbih adalah kekal selagi tasbih dijaga dengan baik. Berbeza dengan air penawar yang habis, tasbih ini boleh digunakan berulang kali tanpa had masa.' },
  { q: 'Bagaimana cara penghantaran?', a: 'Kami menghantar ke seluruh Malaysia melalui pos berdaftar. Maklumat tracking akan dikongsi selepas penghantaran dilakukan. Sila hubungi kami melalui WhatsApp untuk proses pembelian.' },
  { q: 'Boleh tak tasbih ni bantu kes sihir yang dihantar berulang kali?', a: 'Ya — inilah sebenarnya kekuatan utama Tasbih E-Syifa\'. Untuk kes sihir yang dihantar berkali-kali, anda tidak perlu ulang alik ke perawat setiap kali diserang. Guna tasbih terus apabila berasa diserang — rawat sendiri, tanpa tunggu.' },
];

// ─── FAQ Accordion Component ──────────────────────────────────────────────────
function FAQAccordion() {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {FAQS.map((f, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div key={idx} style={{ background: '#042E23', border: isOpen ? '2px solid #FDE047' : '1px solid rgba(253,224,71,0.2)', borderRadius: '12px', overflow: 'hidden', transition: 'all 0.15s ease' }}>
            <button
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              style={{ width: '100%', padding: '1.1rem 1.25rem', background: 'transparent', border: 'none', textAlign: 'left', fontWeight: 800, fontSize: '0.95rem', color: isOpen ? '#FDE047' : '#FEF3C7', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}
            >
              <span>{f.q}</span>
              <span style={{ fontSize: '1.3rem', color: '#FDE047', fontWeight: 800, flexShrink: 0 }}>{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
              <div style={{ padding: '0 1.25rem 1.1rem 1.25rem', fontSize: '0.875rem', color: '#D1FAE5', lineHeight: 1.65, borderTop: '1px solid rgba(253,224,71,0.15)', fontWeight: 500 }}>
                {f.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function TasbihV2Page() {
  return (
    <main style={{ background: '#042E23', minHeight: '100vh' }}>

      {/* ═══════════════════════════════════════════════════════
          SECTION #1 — HERO BANNER
      ═══════════════════════════════════════════════════════ */}
      <section style={{ ...S.dark, padding: '4rem 1rem 3.5rem', textAlign: 'center' }}>
        <div style={S.wrap}>
          <div style={S.badge()}>🌿 ESyifa' · Tasbih Ruqyah Syar'iyyah Pengisian</div>

          <h1 style={{ fontSize: 'clamp(1.8rem, 4.5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.2, color: '#FDE047', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
            Dah Berulang Kali Dirawat Tapi{' '}
            <span style={{ color: '#F87171' }}>Gangguan Masih Datang Balik?</span>{' '}
            <span style={{ color: '#4ADE80' }}>Ini Sebabnya...</span>
          </h1>

          <p style={{ fontSize: '1.1rem', color: '#FFFFFF', lineHeight: 1.75, maxWidth: '760px', margin: '0 auto 1.25rem auto' }}>
            Perawat boleh buang jin — tapi bila balik rumah, jin datang balik. Sihir berat dihantar berkali-kali.
            Satu rawatan <strong style={{ color: '#FDE047' }}>tidak pernah cukup</strong> untuk kes serius.
          </p>

          <p style={{ fontSize: '1.05rem', color: '#4ADE80', fontWeight: 700, lineHeight: 1.7, maxWidth: '700px', margin: '0 auto 1.5rem auto' }}>
            Penyelesaian: <strong style={{ color: '#FDE047' }}>Tasbih E-Syifa'</strong> — diisi bacaan ayat-ayat ruqyah syar'iyyah.
            Ibarat ada perawat private di rumah. Rawat sendiri, tanpa had, seumur hidup.
          </p>

          {/* Urgency badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.15)', border: '1px solid #EF4444', padding: '0.45rem 1.1rem', borderRadius: '50px', marginBottom: '2.5rem', fontSize: '0.82rem', fontWeight: 700, color: '#FCA5A5' }}>
            ⚠️ STOK TERHAD — Setiap tasbih mengambil masa lama untuk diisikan
          </div>

          {/* Tasbih visual */}
          <div style={{ width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #1A5C42, #042E23)', border: '4px solid #FDE047', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem auto', boxShadow: '0 0 60px rgba(74,222,128,0.25), 0 20px 40px rgba(0,0,0,0.4)' }}>
            <span style={{ fontSize: '3.5rem', marginBottom: '0.25rem' }}>📿</span>
            <span style={{ fontSize: '0.7rem', color: '#FDE047', fontWeight: 800, letterSpacing: '0.06em', textAlign: 'center', lineHeight: 1.3 }}>TASBIH<br />E-SYIFA'</span>
          </div>

          <WAButton id="cta-hero" />
          <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#6EE7B7', opacity: 0.85 }}>
            Stok terhad · Setiap tasbih diisi secara manual
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION #2 — TESTIMONI PART 1
      ═══════════════════════════════════════════════════════ */}
      <section style={{ ...S.light }}>
        <div style={{ ...S.wrap, textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em' }}>TESTIMONI (BAHAGIAN 1)</span>
          <h2 style={S.h2dark}>Apa Kata Mereka Yang Dah Ada Tasbih E-Syifa'?</h2>
          <p style={{ ...S.sub('#4B5563'), textAlign: 'center' }}>
            Mereka yang dah guna — biar mereka sendiri yang bercerita.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', alignItems: 'start', marginBottom: '2rem' }}>
            {[
              '/images/testimonials/testimoni_1.jpg',
              '/images/testimonials/testimoni_2.jpg',
              '/images/testimonials/testimoni_3.jpg',
            ].map((src, i) => (
              <div key={i} style={{ borderRadius: '14px', overflow: 'hidden', border: '2px solid #059669', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
                <img src={src} alt={`Testimoni Tasbih E-Syifa' ${i + 1}`} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            {[{ num: '500+', label: 'Pesakit Dibantu' }, { num: 'RM250', label: 'Bayar Sekali Sahaja' }, { num: '100%', label: 'Ruqyah Syar\'iyyah' }].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 900, color: '#047857' }}>{s.num}</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION #3 — PROBLEMS
      ═══════════════════════════════════════════════════════ */}
      <section style={{ ...S.mid, textAlign: 'center' }}>
        <div style={S.wrap}>
          <div style={S.badge('#FDE047')}>⚠️ Kenali Masalah Anda</div>
          <h2 style={S.h2gold}>Kenapa Rawatan Luar Sahaja Tidak Cukup Untuk Kes Berat & Berulang?</h2>
          <p style={S.sub()}>
            Ramai pesakit rasa lega selepas rawatan — tapi gangguan datang balik. Ini bukan salah perawat.
            Ini realiti kes sihir & gangguan berat yang memerlukan <strong style={{ color: '#FDE047' }}>perlindungan berterusan.</strong>
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', textAlign: 'left' }}>
            {PROBLEMS.map((p, i) => (
              <div key={i} style={{ background: '#064E3B', border: '1px solid rgba(253,224,71,0.2)', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 8px 20px rgba(0,0,0,0.25)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{p.icon}</div>
                <div style={{ fontWeight: 800, color: '#FDE047', marginBottom: '0.5rem', fontSize: '0.95rem', lineHeight: 1.3 }}>{p.title}</div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#D1FAE5', lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION #4 — FEARS
      ═══════════════════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(180deg, #0B382D 0%, #1A0A0A 100%)', color: '#FFFFFF', padding: '4rem 1rem', fontFamily: 'var(--font-inter), -apple-system, sans-serif' }}>
        <div style={{ ...S.wrap, textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.12em' }}>⚠️ AMARAN PENTING</span>
          <h2 style={{ ...S.h2gold, color: '#FEF3C7', marginTop: '0.4rem' }}>
            Jika Gangguan Berulang Ini Tidak Diselesaikan Segera...
          </h2>
          <p style={{ ...S.sub('#FCA5A5') }}>
            Ramai yang buat-buat tak kisah. Tapi pengalaman pesakit kami menunjukkan —{' '}
            <strong style={{ color: '#FDE047' }}>semakin lama dibiarkan, semakin teruk akibatnya.</strong>
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.2rem', textAlign: 'left', marginBottom: '2rem' }}>
            {FEARS.map((f, i) => (
              <div key={i} style={{ background: 'rgba(248,113,113,0.07)', border: '1.5px solid rgba(248,113,113,0.25)', borderRadius: '14px', padding: '1.4rem 1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.6rem', lineHeight: 1, flexShrink: 0, background: 'rgba(248,113,113,0.12)', borderRadius: '10px', padding: '0.35rem', display: 'inline-flex' }}>{f.icon}</span>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#FCA5A5', lineHeight: 1.35 }}>{f.title}</h3>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#FEF3C7', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(253,224,71,0.07)', border: '1px solid rgba(253,224,71,0.35)', borderLeft: '4px solid #FDE047', borderRadius: '12px', padding: '1.4rem 1.6rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', textAlign: 'left' }}>
            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>📿</span>
            <div>
              <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.95rem', color: '#FEF3C7', fontWeight: 800 }}>Penyelesaian: Perlindungan Yang Sentiasa Bersama</p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#A7F3D0', lineHeight: 1.75 }}>
                Dengan Tasbih E-Syifa', anda tidak perlu bergantung pada perawat untuk setiap serangan.
                Rawat sendiri, bila-bila masa, di mana sahaja — tanpa had.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION #5 — AUTHORITY / DALIL
      ═══════════════════════════════════════════════════════ */}
      <section style={{ ...S.dark, textAlign: 'center' }}>
        <div style={S.wrap}>
          <div style={S.badge()}>📖 DALIL & ASAS</div>
          <h2 style={S.h2gold}>Bacaan Pada Barang — Amalan Yang Disokong Al-Quran & Sunnah</h2>
          <p style={S.sub()}>
            Konsep "pengisian" atau membaca pada sesuatu objek untuk dijadikan penawar
            adalah amalan yang diiktiraf dalam tradisi Islam. Qias kepada bacaan pada air, minyak
            dan kain yang disebutkan dalam kitab-kitab ulama silam.
          </p>

          {/* Dalil cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {[
              { arabic: 'وَنُنَزِّلُ مِنَ ٱلْقُرْءَانِ مَا هُوَ شِفَآءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ', terjemah: '"Dan Kami turunkan dari Al-Quran sesuatu yang menjadi penawar dan rahmat bagi orang-orang yang beriman."', sumber: 'Surah Al-Isra\' (17:82)' },
              { arabic: 'وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ', terjemah: '"Dan apabila aku sakit, Dialah (Allah) yang menyembuhkanku."', sumber: 'Surah Ash-Shu\'ara (26:80)' },
            ].map((d, i) => (
              <div key={i} style={{ background: 'rgba(253,224,71,0.06)', border: '1.5px solid rgba(253,224,71,0.3)', borderRadius: '16px', padding: '1.75rem 1.5rem', textAlign: 'right' }}>
                <div style={{ fontSize: '1.1rem', fontFamily: 'serif', color: '#FDE047', lineHeight: 2.2, marginBottom: '1rem', direction: 'rtl' }}>{d.arabic}</div>
                <div style={{ borderTop: '1px solid rgba(253,224,71,0.2)', paddingTop: '1rem', textAlign: 'left' }}>
                  <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.875rem', color: '#FEF3C7', lineHeight: 1.7, fontStyle: 'italic' }}>{d.terjemah}</p>
                  <span style={{ fontSize: '0.75rem', color: '#6EE7B7', fontWeight: 700 }}>{d.sumber}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Hadith */}
          <div style={{ background: 'rgba(74,222,128,0.07)', border: '1.5px solid rgba(74,222,128,0.28)', borderRadius: '14px', padding: '1.5rem 1.8rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📖</span>
            <p style={{ margin: '0.6rem 0 0.4rem 0', fontSize: '1rem', color: '#FEF3C7', fontStyle: 'italic', lineHeight: 1.75 }}>
              "Gunakanlah ruqyah (bacaan doa perlindungan) selama ia tidak mengandungi syirik."
            </p>
            <span style={{ fontSize: '0.8rem', color: '#6EE7B7', fontWeight: 700 }}>Hadith Riwayat Muslim</span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(253,224,71,0.2)', borderRadius: '14px', padding: '1.4rem 1.6rem', textAlign: 'left', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>💡</span>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#D1FAE5', lineHeight: 1.7 }}>
              <strong style={{ color: '#FDE047' }}>Konsep Tasbih E-Syifa'</strong> adalah qias kepada amalan membaca bacaan ruqyah pada air penawar.
              Bezanya — air habis, tasbih <em>tidak pernah habis</em>. Bacaan yang dipasakkan kekal selagi tasbih dijaga dengan baik.
              Ini menjadikan ia perlindungan yang lebih tahan lama dan berterusan.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION #6 — SOLUTION: PERKENALKAN TASBIH E-SYIFA'
      ═══════════════════════════════════════════════════════ */}
      <section style={{ ...S.light }}>
        <div style={{ ...S.wrap, textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.12em' }}>PENYELESAIAN</span>
          <h2 style={S.h2dark}>Tasbih E-Syifa' — Perawat Private Anda Yang Sentiasa Bersama</h2>
          <p style={{ ...S.sub('#4B5563') }}>
            Satu pelaburan. Rawatan tanpa had. Boleh guna seumur hidup. Tidak perlu tunggu appointment.
            Tidak perlu ulang alik. Tidak perlu bergantung pada orang lain — <strong style={{ color: '#047857' }}>setiap kali diserang, rawat terus.</strong>
          </p>

          {/* Brand badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'linear-gradient(135deg, #042E23 0%, #065F46 100%)', border: '2px solid #FDE047', borderRadius: '16px', padding: '1rem 2rem', marginBottom: '3rem', boxShadow: '0 8px 24px rgba(4,46,35,0.2)' }}>
            <span style={{ fontSize: '2rem' }}>📿</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#FDE047' }}>Tasbih E-Syifa'</div>
              <div style={{ fontSize: '0.78rem', color: '#A7F3D0', fontWeight: 600 }}>Ruqyah Syar'iyyah · Pengisian Penuh · ESyifa'</div>
            </div>
          </div>

          {/* 10 Benefits */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em' }}>10 KELEBIHAN UTAMA</span>
            <h3 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.8rem)', fontWeight: 800, color: '#042E23', marginTop: '0.4rem', marginBottom: '0.5rem' }}>
              Kenapa Tasbih E-Syifa' Berbeza Dari Yang Lain?
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', textAlign: 'left', marginBottom: '2.5rem' }}>
            {BENEFITS.map((b, i) => (
              <div key={i} style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', padding: '1.2rem', display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.5rem', flexShrink: 0, background: '#ECFDF5', borderRadius: '10px', padding: '0.35rem', display: 'inline-flex', lineHeight: 1 }}>{b.icon}</span>
                <div>
                  <p style={{ margin: '0 0 0.2rem 0', fontWeight: 800, fontSize: '0.88rem', color: '#042E23' }}>{b.title}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#4B5563', lineHeight: 1.55 }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <WAButton id="cta-solution" label="📿 Saya Mahu Tasbih E-Syifa'" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION #7 — APA YANG DIISI DALAM TASBIH
      ═══════════════════════════════════════════════════════ */}
      <section style={{ ...S.mid }}>
        <div style={{ ...S.wrap, textAlign: 'center' }}>
          <div style={S.badge()}>📿 ISI KANDUNGAN</div>
          <h2 style={S.h2gold}>Apa Yang Diisi & Dipasakkan Dalam Tasbih E-Syifa'?</h2>
          <p style={S.sub()}>
            4 elemen utama yang diisikan oleh perawat ESyifa' — semua bersumber dari Al-Quran dan Sunnah Nabi ﷺ.
            Tiada unsur syirik, bid'ah atau amalan yang bertentangan dengan syarak.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.1rem', textAlign: 'left' }}>
            {TASBIH_ELEMENTS.map((el, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(253,224,71,0.25)', borderRadius: '14px', padding: '1.5rem 1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.75rem', lineHeight: 1, flexShrink: 0, background: 'rgba(253,224,71,0.1)', borderRadius: '10px', padding: '0.4rem', display: 'inline-flex' }}>{el.icon}</span>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#FDE047', lineHeight: 1.35 }}>{el.name}</h3>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#D1FAE5', lineHeight: 1.65 }}>{el.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION #8 — GOALS
      ═══════════════════════════════════════════════════════ */}
      <section style={{ ...S.dark }}>
        <div style={{ ...S.wrap, textAlign: 'center' }}>
          <div style={S.badge()}>🎯 PERUBAHAN YANG ANDA AKAN RASA</div>
          <h2 style={S.h2gold}>5 Perubahan Yang Anda Akan Alami Bila Ada Tasbih E-Syifa'</h2>
          <p style={S.sub()}>Bukan janji kosong — ini berdasarkan pengalaman pelanggan yang dah ada Tasbih E-Syifa'.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            {GOALS.map((g, i) => (
              <div key={i} style={{ background: '#FFFFFF', border: '2px solid #FDE047', borderRadius: '12px', padding: '1.2rem 1.4rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>{g.icon}</div>
                <div>
                  <p style={{ margin: '0 0 0.25rem 0', fontWeight: 800, fontSize: '1rem', color: '#042E23' }}>{g.title}</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#374151', lineHeight: 1.6 }}>{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION #9 — CARA GUNA
      ═══════════════════════════════════════════════════════ */}
      <section style={{ ...S.darker }}>
        <div style={{ ...S.wrap, textAlign: 'center' }}>
          <div style={S.badge()}>📿 CARA GUNA</div>
          <h2 style={S.h2gold}>4 Cara Guna Tasbih E-Syifa' Yang Perlu Anda Tahu</h2>
          <p style={S.sub()}>
            Cara penggunaan yang mudah — cukup berniat, berdoa kepada Allah & yakin dengan izin-Nya.
            <br /><strong style={{ color: '#FDE047' }}>Panduan lengkap diberikan selepas pembelian.</strong>
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', textAlign: 'left' }}>
            {KEGUNAAN.map((k, i) => (
              <div key={i} style={{ background: '#042E23', border: '2px solid rgba(74,222,128,0.3)', borderRadius: '16px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '2.5rem', fontWeight: 900, color: 'rgba(74,222,128,0.08)', lineHeight: 1, fontFamily: 'monospace' }}>{k.no}</div>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{k.icon}</div>
                <div style={{ fontWeight: 800, color: '#4ADE80', marginBottom: '0.5rem', fontSize: '0.95rem' }}>{k.title}</div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#D1FAE5', lineHeight: 1.65 }}>{k.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2.5rem', background: 'rgba(253,224,71,0.07)', border: '1px solid rgba(253,224,71,0.3)', borderLeft: '4px solid #FDE047', borderRadius: '12px', padding: '1.25rem 1.5rem', textAlign: 'left', display: 'flex', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>💡</span>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#FEF3C7', lineHeight: 1.75 }}>
              <strong style={{ color: '#FDE047' }}>Paling Penting:</strong> Tasbih E-Syifa' bukan ubat biasa. Ia adalah wasilah — perantara ikhtiar antara anda dan Allah SWT.
              Keyakinan, niat yang betul, dan doa adalah kunci utama. Kemudian Allah yang menentukan kesembuhan.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CTA + PRICING (Pertama — selepas explain product)
      ═══════════════════════════════════════════════════════ */}
      <section id="order" style={{ ...S.dark, textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div style={S.badge()}>🛒 DAPATKAN SEKARANG</div>
          <h2 style={S.h2gold}>Dapatkan Tasbih E-Syifa' Anda</h2>

          {/* Urgency */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', padding: '0.5rem 1.25rem', borderRadius: '50px', marginBottom: '2rem', fontSize: '0.85rem', fontWeight: 700, color: '#FCA5A5' }}>
            🔴 STOK TERHAD — Setiap tasbih mengambil masa lama untuk diisikan
          </div>

          <div style={{ background: 'linear-gradient(135deg, #064E3B 0%, #042E23 100%)', border: '3px solid #FDE047', borderRadius: '24px', padding: '2.5rem 2rem', boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📿</div>
            <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#FFFFFF', marginBottom: '0.25rem' }}>Tasbih E-Syifa'</div>
            <div style={{ fontSize: '0.82rem', color: '#6EE7B7', marginBottom: '1.5rem' }}>Diisi bacaan ruqyah syar'iyyah · Pos seluruh Malaysia</div>

            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: '#D1FAE5' }}>Harga: </span>
              <span style={{ fontSize: '2.8rem', fontWeight: 900, color: '#FDE047' }}>RM250</span>
              <div style={{ fontSize: '0.8rem', color: '#A7F3D0', marginTop: '0.25rem' }}>Bayar sekali — guna seumur hidup</div>
            </div>

            {['Rawatan tanpa had — tidak pernah habis', 'Boleh buat air penawar & air mandian sendiri', 'Boleh pagar & lindungi rumah', 'Panduan lengkap cara guna disertakan', 'Pos berdaftar seluruh Malaysia', 'Bacaan ruqyah syar\'iyyah berlandaskan Al-Quran'].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.6rem', fontSize: '0.875rem', color: '#D1FAE5', textAlign: 'left' }}>
                <span style={{ color: '#4ADE80', flexShrink: 0 }}>✔</span> {f}
              </div>
            ))}

            <div style={{ marginTop: '1.75rem' }}>
              <WAButton id="cta-pricing-1" label="📿 Order Via WhatsApp" />
            </div>
            <p style={{ margin: '1rem 0 0', fontSize: '0.78rem', color: '#6EE7B7', opacity: 0.8 }}>
              Hubungi kami melalui WhatsApp untuk proses pembelian
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION #10 — TESTIMONI PART 2
      ═══════════════════════════════════════════════════════ */}
      <section style={{ ...S.mid, textAlign: 'center' }}>
        <div style={S.wrap}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FDE047', textTransform: 'uppercase', letterSpacing: '0.1em' }}>TESTIMONI (BAHAGIAN 2)</span>
          <h2 style={S.h2gold}>Lebih Ramai Yang Telah Merasai Manfaatnya</h2>
          <p style={S.sub()}>Alhamdulillah — semakin ramai yang mengambil langkah pertama dan merasai perbezaannya.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
            {['/images/testimonials/testimoni_part2_1.jpg', '/images/testimonials/testimoni_part2_2.jpg', '/images/testimonials/testimoni_part2_3.jpg'].map((src, i) => (
              <div key={i} style={{ borderRadius: '16px', overflow: 'hidden', border: '2px solid #FDE047', boxShadow: '0 8px 25px rgba(0,0,0,0.3)', background: '#042E23' }}>
                <img src={src} alt={`Testimoni Tasbih E-Syifa' ${i + 4}`} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            ))}
          </div>

          <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#A7F3D0', fontStyle: 'italic', lineHeight: 1.7 }}>
            Semua testimoni di atas adalah daripada pelanggan sebenar Tasbih E-Syifa'. Alhamdulillah — semoga Allah terus permudahkan urusan mereka.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION #11 — COMPARISON TABLE (3 Kolum — Mobile Friendly)
      ═══════════════════════════════════════════════════════ */}
      <section style={{ ...S.darker, textAlign: 'center' }}>
        <div style={S.wrap}>
          <div style={S.badge()}>💡 PERBANDINGAN</div>
          <h2 style={S.h2gold}>Tasbih E-Syifa' vs Air Penawar vs Rawatan Luar Biasa</h2>
          <p style={S.sub()}>
            Tiga pilihan — tapi hanya satu yang memberikan perlindungan <strong style={{ color: '#FDE047' }}>berterusan tanpa had</strong> untuk kes berulang & berat.
          </p>

          {/* Mobile-first stacked comparison */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Row header labels for mobile */}
            {[
              { label: 'Boleh digunakan berulang kali', air: false, luar: false, tasbih: true },
              { label: 'Tidak pernah habis / tamat', air: false, luar: false, tasbih: true },
              { label: 'Rawat sendiri tanpa perawat', air: false, luar: false, tasbih: true },
              { label: 'Boleh guna waktu malam / segera', air: '⚠️', luar: false, tasbih: true },
              { label: 'Buat air penawar sendiri', air: false, luar: false, tasbih: true },
              { label: 'Buat air mandian sendiri', air: false, luar: false, tasbih: true },
              { label: 'Pagar & lindungi rumah', air: false, luar: false, tasbih: true },
              { label: 'Sesuai untuk kes berulang berat', air: false, luar: '⚠️', tasbih: true },
              { label: 'Kos jangka panjang rendah', air: '⚠️', luar: false, tasbih: true },
              { label: '100% Ruqyah Syar\'iyyah', air: true, luar: true, tasbih: true },
            ].map((row, i) => (
              <div key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)', borderRadius: '10px', overflow: 'hidden' }}>

                {/* Feature label */}
                <div style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', fontWeight: 700, color: '#FEF3C7', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'left' }}>
                  {row.label}
                </div>

                {/* 3 Columns */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                  {[
                    { key: 'air', label: '💧 Air Penawar', val: row.air, color: '#FCA5A5' },
                    { key: 'luar', label: '🏥 Rawatan Luar', val: row.luar, color: '#FCD34D' },
                    { key: 'tasbih', label: '📿 Tasbih E-Syifa\'', val: row.tasbih, color: '#4ADE80', highlight: true },
                  ].map((col, j) => (
                    <div key={j} style={{ padding: '0.6rem 0.5rem', textAlign: 'center', background: col.highlight ? 'rgba(74,222,128,0.07)' : 'transparent', borderLeft: j > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                      <div style={{ fontSize: '0.65rem', color: col.color, fontWeight: 700, marginBottom: '0.3rem', letterSpacing: '0.03em' }}>{col.label}</div>
                      <div style={{ fontSize: '1.2rem' }}>
                        {col.val === true ? '✅' : col.val === false ? '❌' : col.val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Winner declaration */}
          <div style={{ marginTop: '2rem', background: 'rgba(74,222,128,0.1)', border: '2px solid #4ADE80', borderRadius: '16px', padding: '1.5rem 2rem', display: 'inline-block', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📿</div>
            <div style={{ fontWeight: 800, color: '#4ADE80', fontSize: '1rem', marginBottom: '0.25rem' }}>Pemenang Jelas: Tasbih E-Syifa'</div>
            <div style={{ fontSize: '0.83rem', color: '#D1FAE5', lineHeight: 1.6 }}>
              Satu-satunya pilihan yang memberikan perlindungan berterusan,<br />boleh digunakan sendiri, dan tidak pernah habis.
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION #12 — JAMINAN
      ═══════════════════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(180deg, #042E23 0%, #021812 100%)', color: '#FFFFFF', padding: '4rem 1rem', fontFamily: 'var(--font-inter), -apple-system, sans-serif', textAlign: 'center' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FDE047', textTransform: 'uppercase', letterSpacing: '0.12em' }}>JAMINAN KAMI</span>
          <h2 style={S.h2gold}>Jaminan Kualiti Bacaan Ruqyah Syar'iyyah</h2>
          <p style={S.sub()}>
            Setiap Tasbih E-Syifa' diisi dengan penuh amanah dan tanggungjawab. Kami tidak menjual sekadar objek — kami menjual ikhtiar dan doa.
          </p>

          <div style={{ background: 'linear-gradient(135deg, #1E3A2F 0%, #14532D 100%)', border: '2px solid #22C55E', borderRadius: '20px', padding: '2.5rem 2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', lineHeight: 1 }}>🛡️</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', marginBottom: '1.5rem' }}>
              {[
                { icon: '✅', title: 'Bacaan 100% Ruqyah Syar\'iyyah', desc: 'Setiap tasbih diisi dengan bacaan Al-Quran dan doa-doa sahih. Tiada unsur syirik, lagha atau bid\'ah.' },
                { icon: '✅', title: 'Diisi Dengan Penuh Teliti', desc: 'Setiap tasbih mengambil masa yang lama untuk diisi — kerana proses ini tidak boleh dipantas-pantaskan.' },
                { icon: '✅', title: 'Panduan Lengkap Disertakan', desc: 'Anda akan menerima panduan cara penggunaan yang jelas dan mudah difahami bersama penghantaran.' },
                { icon: '✅', title: 'Dihantar Dalam Keadaan Sempurna', desc: 'Setiap tasbih dikemas dengan rapi sebelum dihantar untuk memastikan ia sampai dalam keadaan terbaik.' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.1rem', flexShrink: 0, color: '#4ADE80' }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, color: '#FDE047', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.82rem', color: '#D1FAE5', lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION #13 — CTA + PAKEJ (Kedua)
      ═══════════════════════════════════════════════════════ */}
      <section style={{ ...S.dark, textAlign: 'center' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FDE047', textTransform: 'uppercase', letterSpacing: '0.1em' }}>JANGAN TUNGGU LAGI</span>
          <h2 style={{ ...S.h2gold, fontSize: 'clamp(1.6rem, 3.8vw, 2.4rem)' }}>
            Hentikan Kitaran Diserang Berulang — Ambil Kawalan Hari Ini
          </h2>
          <p style={S.sub()}>
            Setiap hari tanpa perlindungan adalah peluang untuk gangguan mengakar lebih dalam.
            Tasbih E-Syifa' hadir untuk mereka yang mahu <strong style={{ color: '#FDE047' }}>bangkit — tanpa menunggu, tanpa bergantung.</strong>
          </p>

          {/* Package tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
            {['Kes Sihir Berulang', 'Gangguan Jin', 'Santau', 'Saka', 'Penyakit Misteri', 'Perlindungan 24/7', 'Rawatan Kendiri'].map((item, i) => (
              <span key={i} style={{ background: 'rgba(253,224,71,0.12)', border: '1px solid rgba(253,224,71,0.35)', color: '#FEF3C7', fontSize: '0.78rem', fontWeight: 600, padding: '0.25rem 0.75rem', borderRadius: '999px' }}>{item}</span>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
            <WAButton id="cta-closing-1" label="📿 Saya Mahu Tasbih E-Syifa' — RM250" />
            <span style={{ fontSize: '0.78rem', color: '#6EE7B7', fontStyle: 'italic' }}>Stok terhad · Pos seluruh Malaysia · Panduan disertakan</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION #14 — UNTUK SIAPA
      ═══════════════════════════════════════════════════════ */}
      <section style={{ ...S.mid }}>
        <div style={{ ...S.wrap, textAlign: 'center' }}>
          <div style={S.badge()}>👤 UNTUK SIAPA</div>
          <h2 style={S.h2gold}>Tasbih E-Syifa' Sesuai Untuk Anda Jika...</h2>
          <p style={S.sub()}>Tandakan yang mana berkaitan dengan anda.</p>

          <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'left' }}>
            {UNTUK_SIAPA.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', padding: '0.9rem 0', borderBottom: i < UNTUK_SIAPA.length - 1 ? '1px solid rgba(74,222,128,0.12)' : 'none' }}>
                <span style={{ color: '#4ADE80', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0, marginTop: '0.05rem' }}>✔</span>
                <span style={{ fontSize: '0.97rem', color: '#D1FAE5', lineHeight: 1.55 }}>{s}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2.5rem' }}>
            <WAButton id="cta-untuk-siapa" label="📿 Ya, Saya Perlukan Ini" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION #15 — FAQ
      ═══════════════════════════════════════════════════════ */}
      <section style={{ ...S.light }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em' }}>SOALAN LAZIM</span>
            <h2 style={S.h2dark}>Soalan Yang Sering Ditanya Tentang Tasbih E-Syifa'</h2>
            <p style={{ fontSize: '0.95rem', color: '#4B5563', lineHeight: 1.6 }}>Semua jawapan ada di sini.</p>
          </div>
          <FAQAccordion />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CLOSING
      ═══════════════════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(180deg, #031E17 0%, #042E23 100%)', padding: '5rem 1rem', textAlign: 'center', fontFamily: 'var(--font-inter), -apple-system, sans-serif' }}>
        <div style={S.wrap}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📿</div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.3rem)', fontWeight: 900, color: '#FDE047', marginBottom: '1rem', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
            Hentikan Kitaran Diserang Berulang.{' '}
            <span style={{ color: '#4ADE80' }}>Mulakan Rawatan Kendiri Hari Ini.</span>
          </h2>
          <p style={{ fontSize: '1rem', color: '#D1FAE5', marginBottom: '2.5rem', lineHeight: 1.65, maxWidth: '620px', margin: '0 auto 2.5rem auto' }}>
            Tasbih E-Syifa' hadir untuk mereka yang mahu bangkit — tanpa menunggu, tanpa bergantung, tanpa had.
            Stok terhad. Jangan tangguh lagi.
          </p>
          <WAButton id="cta-final" label="📿 Saya Mahu Tasbih E-Syifa' — RM250" />
          <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#6EE7B7', opacity: 0.8 }}>
            Hubungi kami melalui WhatsApp untuk proses pembelian & pertanyaan
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#021812', color: '#FFFFFF', padding: '2rem 1rem', textAlign: 'center', fontSize: '0.82rem', borderTop: '1px solid rgba(254,243,199,0.1)' }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 0.5rem', fontWeight: 800, fontSize: '1rem', color: '#FEF3C7' }}>ESyifa' · Tasbih Ruqyah Syar'iyyah</p>
          <p style={{ margin: 0, opacity: 0.7, fontSize: '0.78rem', color: '#D1D5DB' }}>
            © {new Date().getFullYear()} ESyifa'. Hak cipta terpelihara. Rawatan berasaskan bacaan Al-Quran dan doa berlandaskan syarak.
          </p>
        </div>
      </footer>

    </main>
  );
}

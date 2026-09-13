'use client';

const TESTIMONIALS = [
  {
    name: 'Hana S.',
    location: 'Kuala Lumpur',
    time: 'Semalam',
    tag: '👻 Gangguan Berulang → Boleh Rawat Sendiri',
    text: '"Salam ustaz nak bg feedback psl tasbih yg ustaz tlg buat pengisian aritu. Sebelum ni sy mmg penat sgt, asal balik berubat kat luar je rasa lega sekejap tapi bila smpai rumah gangguan tu masuk balik. Lepas ada tasbih ni dan sy amalkan ikut cara ustaz ajar bila rasa seram sejuk, masyaAllah terus rasa lapang bdan! Gangguan x berani dekat langsung skrg. Puas hati sgt dpt ikhtiar sndiri kat umah 👍"',
  },
  {
    name: 'Amirul F.',
    location: 'Shah Alam',
    time: '2 hari lepas',
    tag: '🤲 Saka Keturunan → Bahu Ringan',
    text: '"Assalam ustaz.. Cincin perak yg ustaz buat pengisian ruqyah tu dah selamat sampai seminggu sy amalkan. Masa memula sy pegang dan baca doa ikut panduan ustaz, terus tekak loya pastu sendawa berulang2 kali keluar angin bisa saka tu! Sekarang bahu sy yg tegang berat bertahun tu dah ringan giler ustaz. Xde dah rasa beban dukung batu kat tengkuk. TQ byk2 ustaz 🤲"',
  },
  {
    name: 'Aisyah K.',
    location: 'Melaka',
    time: '3 hari lepas',
    tag: '🌙 Kena Tindih Jam 3 Pagi → Selesai < 5 Minit',
    text: '"Ustaz syukur sgt ada item pengisian ni.. Malam td kul 3.30 pagi tibe2 dada rse kena hempap tindih macam dlu. Kalau dlu mampus nk tggu pagi baru cari ustaz. Ni sy terus capai minyak wangi ruqyah tu n sapu ikut cara ustaz ajar, x smpai 5 minit terus lapang dada n dpt tido lena smpai subuh! Mmg btol kata ustaz, x payah susah2 tggu perawat lg bila ada alat ikhtiar sndiri kat tgn 🙏"',
  },
  {
    name: 'Rozita M.',
    location: 'Johor Bahru',
    time: '4 hari lepas',
    tag: '✂️ Sihir Hantaran → Terbatal Serta-Merta',
    text: '"Salam ustaz.. Bomoh yg dengki ngan kluarga sy tu mmg x penah puas hati asyik hantar sihir jer. Tapi alhamdulillah sejak buat pengisian gelang n tasbih ni, bila rasa pening mencucuk je sy terus amalkan panduan syifa tu. Terasa sihir hantaran tu terbatal serta merta. Duit pon jimat x payah melayang ratus2 lg gi berubat luar tiap2 bulan 😊"',
  },
  {
    name: 'Noriza H.',
    location: 'Selangor',
    time: '5 hari lepas',
    tag: '❤️ Rumahtangga Panas → Kembali Harmoni',
    text: '"Ustaz nak share berita gembira.. Dulu saya ngan suami asal pandang muka je nak bertekak, rumah rse berasap panas mcm kena sihir pemisah. Lepas buat pengisian minyak wangi & amalkan sembur kat bilik n diri ikut cara ustaz ajar, alhamdulillah suasana rumah bertukar sejuk giler. Suami pun dah x baran, balik keja senyum mesra je layan sy. Rasa mcm baru kawin balik ustaz 😭❤️"',
  },
  {
    name: 'Ummi R.',
    location: 'Ipoh, Perak',
    time: '6 hari lepas',
    tag: '👧 Anak Histeria → Tidur Lena',
    text: '"Assalam ustaz, nk bgtau psl anak sy kat asrama yg selalu kena histeria n meracau mlm tu. Sy buatkan pengisian rantai/minyak wangi utk dia. Sy ajar dia cara amalkan bila rasa gelisah mcm ustaz ajar sy. Alhamdulillah dah masuk 2 mggu dia ckp dah x nampak kelibat menakutkan n tido nyenyak sgt kat dorm. Sy kat rumah pon dah x risau dah syukur ya Allah 🤲"',
  },
  {
    name: 'Kamariah Z.',
    location: 'Kedah',
    time: '1 minggu lepas',
    tag: '🧠 Bisikan Halus → Fikiran Lapang',
    text: '"Salam ustaz tq sgt2 tlg buat pengisian tasbih sy tu. Dulu kepala sy bising sgt ngan bisikan2 suruh takut n was2 smbahyang smpai rasa nk gila. Sejak sy pegang tasbih ni n amalkan zikir ruqyah ikut bimbingan ustaz, bisikan tu terus senyap serap tak berani kaco dah. Fikiran rse tenang giler skrg lapang xde serabut dah ustaz! 😊"',
  },
  {
    name: 'Rizal A.',
    location: 'Pulau Pinang',
    time: '1 minggu lepas',
    tag: '🏪 Kedai Tersekat → Pelanggan Masuk Balik',
    text: '"Ustaz btol la berkesan! Barang kedai yg sy minta ustaz buat pengisian aritu sy dah letak kat kaunter & amalkan pagar kedai ikut nota ustaz. Sebelum ni pelanggan lalu depan kedai buat donno je ckp kedai tutup. Hari ke-3 lepas amalkan, pelanggan beratur masuk balik mcm dlu! Suasana kedai pon rasa sejuk lapang x rse suram lg. Tq ustaz bantu selesaikan masalah rezeki sy ni 🤲"',
  },
  {
    name: 'Salmah N.',
    location: 'Pahang',
    time: '2 minggu lepas',
    tag: '💰 Berhenti Bakar Duit Berubat Luar',
    text: '"Assalam ustaz ikhlas ckp mmg jimat byk. Sblom ni entah bpe ribu habis melayang asyik bayar yuran rawatan luar asal gangguan datang balik. Skrg bila ada item pengisian ni, rse berbaloi sgt skali bayar je sy dah ada alat ikhtiar sndiri kat rumah. Bila anak demam pelik ke bdan sy sengal ke, terus guna item ni rawat sndiri smpai sembuh 👍"',
  },
  {
    name: 'Fadilah T.',
    location: 'Terengganu',
    time: '2 minggu lepas',
    tag: '🔄 Pelarasan Mingguan → Kekuatan Sentiasa Fresh',
    text: '"Ustaz, sy perasan setiap kali lepas ustaz buat pelarasan mingguan tu, barang ni rasa makin bertenaga bila sy pegang masa amalkan zikir. Rse berangin sejuk meremang kat tangan. Bagus sgt ada sistem pelarasan automatik ni, x risau kekuatan bacaan luput. Moga ustaz dimurahkan rezeki selalu tlg pesakit2 mcm kitorang ni 🙏"',
  },
];

const ff = 'var(--font-inter), -apple-system, sans-serif';

function WaBubble({ t }) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '16px',
      overflow: 'hidden',
      fontFamily: ff,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
    }}>
      {/* Header bar */}
      <div style={{
        background: '#F0FDF4',
        borderBottom: '1px solid #E2E8F0',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF', flexShrink: 0,
          }}>
            {t.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>{t.name}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748B' }}>📍 {t.location}</div>
          </div>
        </div>
        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{t.time}</div>
      </div>

      {/* Message bubble */}
      <div style={{ padding: '1.1rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{
          background: '#F8FAFC',
          borderRadius: '12px',
          padding: '0.9rem 1rem',
          borderLeft: '3px solid #10B981',
          marginBottom: '0.85rem',
        }}>
          <p style={{
            margin: 0,
            fontSize: '0.87rem',
            color: '#334155',
            lineHeight: 1.65,
            fontStyle: 'italic',
          }}>
            {t.text}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>{t.time}</span>
            <span style={{ fontSize: '0.7rem', color: '#10B981' }}>✓✓</span>
          </div>
        </div>

        <div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            background: '#ECFDF5', border: '1px solid #A7F3D0',
            color: '#047857', fontSize: '0.73rem', fontWeight: 700,
            padding: '0.25rem 0.7rem', borderRadius: '9999px',
          }}>
            {t.tag}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PengisianTestimonialSection() {
  return (
    <section style={{
      background: '#F8FAF9',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <span style={{
            display: 'inline-block',
            background: '#FFFFFF', border: '1px solid #A7F3D0',
            color: '#047857', padding: '0.35rem 1rem',
            borderRadius: '9999px', fontSize: '0.75rem',
            fontWeight: 700, letterSpacing: '0.04em',
            textTransform: 'uppercase', marginBottom: '0.85rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}>
            💬 Maklum Balas Pelanggan
          </span>
          <h2 style={{
            fontSize: 'clamp(1.45rem, 3.2vw, 2rem)',
            fontWeight: 800, color: '#0F172A',
            margin: '0.3rem 0 0.5rem', letterSpacing: '-0.02em',
          }}>
            Apa Kata Mereka Yang Sudah Cuba
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#64748B', lineHeight: 1.65, maxWidth: '520px', margin: '0 auto' }}>
            Mesej WhatsApp terus daripada pelanggan — ikhtiar mandiri dari rumah dengan item pengisian ruqyah, dengan izin Allah.
          </p>
        </div>

        {/* Testimonial grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '1.1rem',
        }}>
          {TESTIMONIALS.map((t, i) => <WaBubble key={i} t={t} />)}
        </div>

      </div>
    </section>
  );
}

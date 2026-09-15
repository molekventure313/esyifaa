'use client';

const TESTIMONIALS_PART2 = [
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

const ff = "var(--font-inter), -apple-system, sans-serif";

function WaBubble({ t }) {
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #E2E8F0",
      borderRadius: "16px",
      overflow: "hidden",
      fontFamily: ff,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
    }}>
      <div style={{
        background: "#F0FDF4",
        borderBottom: "1px solid #E2E8F0",
        padding: "0.75rem 1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: "linear-gradient(135deg, #10B981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.82rem", fontWeight: 700, color: "#FFFFFF", flexShrink: 0,
          }}>
            {t.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#0F172A", lineHeight: 1.2 }}>{t.name}</div>
            <div style={{ fontSize: "0.7rem", color: "#64748B" }}>📍 {t.location}</div>
          </div>
        </div>
        <div style={{ fontSize: "0.7rem", color: "#64748B" }}>{t.time}</div>
      </div>
      <div style={{ padding: "1.1rem", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{
          background: "#F8FAFC", borderRadius: "12px", padding: "0.9rem 1rem",
          borderLeft: "3px solid #10B981", marginBottom: "0.85rem",
        }}>
          <p style={{ margin: 0, fontSize: "0.87rem", color: "#334155", lineHeight: 1.65, fontStyle: "italic" }}>
            {t.text}
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "0.25rem", marginTop: "0.5rem" }}>
            <span style={{ fontSize: "0.65rem", color: "#94A3B8" }}>{t.time}</span>
            <span style={{ fontSize: "0.7rem", color: "#10B981" }}>✓✓</span>
          </div>
        </div>
        <div>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "0.3rem",
            background: "#ECFDF5", border: "1px solid #A7F3D0",
            color: "#047857", fontSize: "0.73rem", fontWeight: 700,
            padding: "0.25rem 0.7rem", borderRadius: "9999px",
          }}>
            {t.tag}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PengisianTestimonialPart2Section() {
  return (
    <section style={{
      background: "#F0FDF4",
      padding: "4.5rem 1.25rem",
      fontFamily: ff,
      borderBottom: "1px solid #D1FAE5",
    }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2.75rem" }}>
          <span style={{
            display: "inline-block",
            background: "#FFFFFF", border: "1px solid #A7F3D0",
            color: "#047857", padding: "0.35rem 1rem",
            borderRadius: "9999px", fontSize: "0.75rem",
            fontWeight: 700, letterSpacing: "0.04em",
            textTransform: "uppercase", marginBottom: "0.85rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          }}>
            💬 Lebih Maklum Balas
          </span>
          <h2 style={{
            fontSize: "clamp(1.45rem, 3.2vw, 2rem)",
            fontWeight: 800, color: "#0F172A",
            margin: "0.3rem 0 0.5rem", letterSpacing: "-0.02em",
          }}>
            Mereka Sudah Ikhtiar — Hasilnya Nyata
          </h2>
          <p style={{ fontSize: "0.95rem", color: "#64748B", lineHeight: 1.65, maxWidth: "520px", margin: "0 auto" }}>
            Lebih ramai lagi yang sudah merasai manfaat item pengisian ruqyah, dengan izin Allah.
          </p>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
          gap: "1.1rem",
        }}>
          {TESTIMONIALS_PART2.map((t, i) => <WaBubble key={i} t={t} />)}
        </div>
      </div>
    </section>
  );
}

'use client';

const TESTIMONIALS_2 = [
  {
    name: 'Fatimah S.',
    location: 'Kelantan',
    time: '6 hari lepas',
    tag: '🩺 Penyakit Misteri → Pulih',
    tagColor: '#10B981',
    text: '"Assalam ustaz, nk bgtau sakit perut mencucuk sy yg doktor kata normal tu dah makin kurang n ansur pulih lpas mandi sabun syifa ni. Dulu menderita gak tido malam mencucuk2. Skrg dah rse selesa n tenang sangat"',
  },
  {
    name: 'Rosnah I.',
    location: 'Pahang',
    time: '1 minggu lepas',
    tag: '👂 Bisikan Halus → Senyap',
    tagColor: '#8B5CF6',
    text: '"Salam ustaz syukur sgt2 bisikan2 pelik kat telinga sy yg slalu suh takut n marah2 tu dah senyap terus lpas amalkan sabun syifa ni. Fikiran rse tenang giler tak celaru cam dlu. Terima kasih ustaz moga dimurahkan rezeki!"',
  },
  {
    name: 'Noraini B.',
    location: 'Melaka',
    time: '1 minggu lepas',
    tag: '😤 Cepat Marah → Sabar & Tenang',
    tagColor: '#F59E0B',
    text: '"Salam ustaz nak luahkan sikit.. Sy pelik sgt lpas mandi sabun syifa ni. Dulu sy mmg cepat emosi n garang sgt ngan anak2, pantang silap sikit terus nak terjerit marah. Skrg ni macam sabar lain macam ustaz, sy sendiri xpercaya. Xdela garang cam dlu lg, rasa aura n emosi makin tenang. Anak2 pon ckp mama dah x marah2 lagi hpy jer dorg 😊"',
  },
  {
    name: 'Haslinda Z.',
    location: 'Terengganu',
    time: '2 minggu lepas',
    tag: '🌺 Period Tak Teratur → Lancar',
    tagColor: '#EC4899',
    text: '"Assalam ustaz nak bgtau berita gembira.. Dulu period sy mmg kucar kacir x teratur n selalu sakit senggugut mencucuk kat ari2 n rahim. Lepas mandi sabun syifa ni n buang angin bisa, period sy bulan ni terus lancar n ok sangat! Mmg btol la ustaz ckp sblom ni senggugut n period kucar kacir tu sbb ada gangguan jin kat rahim. Alhamdulillah ikhtiar ni berkesan 🤲"',
  },
  {
    name: 'Rohana M.',
    location: 'Sabah',
    time: '2 minggu lepas',
    tag: '👁️ Nampak Makhluk → Berhenti',
    tagColor: '#EF4444',
    text: '"Ustaz syukur sgt2 nak bgtau.. Sebelum ni sy slalu sgt nampak kelibat2 hitam n muka makhluk menakutkan kat sudut rumah n tgh malam. Takut sgt rse nak meroyan. Lepas amalkan mandi sabun syifa ni n bilas kat kepala n bdan, terus dah x nampak langsung makhluk2 menakutkan tu! Rumah n mata sy rse lapang n tenang sgt2 skrg TQ ustaz 🙏"',
  },
];

const ff = 'var(--font-inter), -apple-system, sans-serif';

function WaBubble({ t }) {
  return (
    <div style={{
      background: '#031E17',
      border: '1px solid rgba(74,222,128,0.15)',
      borderRadius: '16px',
      overflow: 'hidden',
      fontFamily: ff,
    }}>
      {/* WA header */}
      <div style={{
        background: '#042E23',
        borderBottom: '1px solid rgba(74,222,128,0.12)',
        padding: '0.7rem 1rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #065F46, #10B981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: 900, color: '#FEF3C7', flexShrink: 0,
          }}>
            {t.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FEF3C7', lineHeight: 1.2 }}>{t.name}</div>
            <div style={{ fontSize: '0.68rem', color: '#6EE7B7' }}>📍 {t.location}</div>
          </div>
        </div>
        <div style={{ fontSize: '0.7rem', color: '#6EE7B7', flexShrink: 0 }}>{t.time}</div>
      </div>

      {/* Message bubble */}
      <div style={{ padding: '1rem' }}>
        <div style={{
          background: '#0A3D29',
          borderRadius: '4px 14px 14px 14px',
          padding: '0.9rem 1rem',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#25D366', borderRadius: '3px 0 0 3px' }} />
          <p style={{
            margin: 0, fontSize: '0.87rem', color: '#D1FAE5',
            lineHeight: 1.65, fontStyle: 'italic', paddingLeft: '0.5rem',
          }}>
            {t.text}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.65rem', color: '#6EE7B7', opacity: 0.7 }}>{t.time}</span>
            <span style={{ fontSize: '0.7rem', color: '#4ADE80' }}>✓✓</span>
          </div>
        </div>
        <div style={{ marginTop: '0.6rem' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            background: `${t.tagColor}18`, border: `1px solid ${t.tagColor}44`,
            color: t.tagColor, fontSize: '0.72rem', fontWeight: 800,
            padding: '0.25rem 0.7rem', borderRadius: '50px',
          }}>
            {t.tag}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SabunTestimonialPart2Section() {
  return (
    <section style={{ background: '#031E17', padding: '4rem 1rem', fontFamily: ff }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{
            display: 'inline-block', background: 'rgba(37,211,102,0.1)',
            border: '1px solid rgba(37,211,102,0.35)', color: '#25D366',
            padding: '0.4rem 1.1rem', borderRadius: '50px',
            fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            💬 Lebih Maklum Balas
          </span>
          <h2 style={{
            fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', fontWeight: 900,
            color: '#FEF3C7', margin: '0.4rem 0 0.5rem', letterSpacing: '-0.02em',
          }}>
            Mereka Dah Cuba, In Shaa Allah Anda Seterusnya
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {TESTIMONIALS_2.map((t, i) => <WaBubble key={i} t={t} />)}
        </div>

        {/* Social proof bar */}
        <div style={{
          marginTop: '2.5rem', padding: '1.25rem 1.5rem',
          background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.2)',
          borderRadius: '14px', textAlign: 'center',
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#FEF3C7', lineHeight: 1.7 }}>
            ✅ <strong style={{ color: '#25D366' }}>Semua testimoni di atas</strong> adalah mesej whatsapp sebenar dari pelanggan ESyifaa —
            tidak diedit, tidak direka. Nama & lokasi dipapar dengan izin pelanggan.
          </p>
        </div>

      </div>
    </section>
  );
}

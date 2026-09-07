'use client';

const TESTIMONIALS_2 = [
  {
    name: 'Fatimah S.',
    location: 'Kelantan',
    time: '6 hari lepas',
    tag: '🩺 Penyakit Misteri → Pulih',
    text: '"Assalam ustaz, nk bgtau sakit perut mencucuk sy yg doktor kata normal tu dah makin kurang n ansur pulih lpas mandi sabun syifa ni. Dulu menderita gak tido malam mencucuk2. Skrg dah rse selesa n tenang sangat"',
  },
  {
    name: 'Rosnah I.',
    location: 'Pahang',
    time: '1 minggu lepas',
    tag: '👂 Bisikan Halus → Senyap',
    text: '"Salam ustaz syukur sgt2 bisikan2 pelik kat telinga sy yg slalu suh takut n marah2 tu dah senyap terus lpas amalkan sabun syifa ni. Fikiran rse tenang giler tak celaru cam dlu. Terima kasih ustaz moga dimurahkan rezeki!"',
  },
  {
    name: 'Noraini B.',
    location: 'Melaka',
    time: '1 minggu lepas',
    tag: '😤 Cepat Marah → Sabar & Tenang',
    text: '"Salam ustaz nak luahkan sikit.. Sy pelik sgt lpas mandi sabun syifa ni. Dulu sy mmg cepat emosi n garang sgt ngan anak2, pantang silap sikit terus nak terjerit marah. Skrg ni macam sabar lain macam ustaz, sy sendiri xpercaya. Xdela garang cam dlu lg, rasa aura n emosi makin tenang. Anak2 pon ckp mama dah x marah2 lagi hpy jer dorg 😊"',
  },
  {
    name: 'Haslinda Z.',
    location: 'Terengganu',
    time: '2 minggu lepas',
    tag: '🌺 Senggugut & Bisa Rahim → Lancar',
    text: '"Assalam ustaz nak bgtau berita gembira.. Dulu period sy mmg kucar kacir x teratur n selalu sakit senggugut mencucuk kat ari2 n rahim. Lepas mandi sabun syifa ni n buang angin bisa, period sy bulan ni terus lancar n ok sangat! Mmg btol la ustaz ckp sblom ni senggugut n period kucar kacir tu sbb ada gangguan jin kat rahim. Alhamdulillah ikhtiar ni berkesan 🤲"',
  },
  {
    name: 'Rohana M.',
    location: 'Sabah',
    time: '2 minggu lepas',
    tag: '👁️ Nampak Makhluk → Berhenti',
    text: '"Ustaz syukur sgt2 nak bgtau.. Sebelum ni sy slalu sgt nampak kelibat2 hitam n muka makhluk menakutkan kat sudut rumah n tgh malam. Takut sgt rse nak meroyan. Lepas amalkan mandi sabun syifa ni n bilas kat kepala n bdan, terus dah x nampak langsung makhluk2 menakutkan tu! Rumah n mata sy rse lapang n tenang sgt2 skrg TQ ustaz 🙏"',
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
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
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
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#FFFFFF',
            flexShrink: 0,
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
            fontSize: '0.88rem',
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
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#047857',
            fontSize: '0.73rem',
            fontWeight: 700,
            padding: '0.25rem 0.7rem',
            borderRadius: '9999px',
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
    <section style={{
      background: '#F8FAF9',
      padding: '4.5rem 1.25rem',
      fontFamily: ff,
      borderBottom: '1px solid #E2E8F0',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{
            display: 'inline-block',
            background: '#FFFFFF',
            border: '1px solid #A7F3D0',
            color: '#047857',
            padding: '0.35rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '0.85rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}>
            💬 Lebih Maklum Balas
          </span>
          <h2 style={{
            fontSize: 'clamp(1.45rem, 3.2vw, 2rem)',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0.3rem 0 0.5rem',
            letterSpacing: '-0.02em',
          }}>
            Mereka Dah Ikhtiar, In Shaa Allah Anda Seterusnya
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '1.1rem',
        }}>
          {TESTIMONIALS_2.map((t, i) => <WaBubble key={i} t={t} />)}
        </div>

        {/* Social proof bar */}
        <div style={{
          marginTop: '2.5rem',
          padding: '1.25rem 1.5rem',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '14px',
          textAlign: 'center',
          maxWidth: '740px',
          margin: '2.5rem auto 0 auto',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        }}>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.65 }}>
            ✅ <strong style={{ color: '#0F172A' }}>Semua perkongsian di atas</strong> adalah mesej whatsapp sebenar daripada pelanggan kami.
            Nama dan lokasi dipapar secara ringkas demi menghormati privasi pelanggan.
          </p>
        </div>

      </div>
    </section>
  );
}

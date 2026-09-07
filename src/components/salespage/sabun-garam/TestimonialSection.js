'use client';

const TESTIMONIALS = [
  {
    name: 'Aishah M.',
    location: 'Kuala Lumpur',
    time: 'Semalam',
    tag: '😴 Susah Tidur → Tido Nyenyak',
    text: '"Salam ustaz, nak bgtau sabun syifa aritu mmg berkesan👍 Sy dah leh tido nyenyak skrg. Dulu kul 3 pagi masih terkebil2 dada gelisah takleh tido. Lepas mandi sabun ni malam terus tido lena smpai subuh alhamdulillah"',
  },
  {
    name: 'Siti R.',
    location: 'Pulau Pinang',
    time: '2 hari lepas',
    tag: '🌿 Gatal & Ruam → Hilang',
    text: '"Ustaz tq sgt2 sabun syifa aritu😊 Ruam merah ngan gatal2 kat bdan sy dah hilang terus. Dulu asal masuk maghrib je merenyam gatal2 badan tak tahan. Ni dah 4 hari mandi sabun ni terus kering gatal pun takde dah syukur"',
  },
  {
    name: 'Umi K.',
    location: 'Johor Bahru',
    time: '3 hari lepas',
    tag: '👶 Anak Meracau → Tenang',
    text: '"Salam ustaz ikhlas nak bg feedback. Anak sy umur 2 thn slalu meracau tgh mlm n bile nk mandikan kat bilik air slalu melalak takut. Lepas gune sabun syifa ni terus x menangis langsung mase mandi, mlm pon tido tenang x meracau lg syukur sgt 🤲"',
  },
  {
    name: 'Rahman A.',
    location: 'Selangor',
    time: '4 hari lepas',
    tag: '💪 Lenguh Urat → Lega',
    text: '"Ustaz btol la sabun ni, bahu sy yg lenguh tegang bertahun tu terus lega lepas mandi tadi. Lenguh urat kat blakang bdan rse cam keluar angin. Rasa ringan giler bdan skrg TQ ustaz 🙏"',
  },
  {
    name: 'Zaiton H.',
    location: 'Kedah',
    time: '5 hari lepas',
    tag: '💨 Gangguan Keluar Dari Badan',
    text: '"Ustaz mase mandi sabun tadi sy terus sendawa tak henti2 ngan loya nak muntah tekak. Kuat betul angin keluar dari bdan. Lepas dah siap mandi terus rse dada lapang sgt2. Mmg sah ade gangguan terikat kat bdan sblom ni"',
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

export default function SabunTestimonialSection() {
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
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}>
            💬 Maklum Balas Pelanggan
          </span>
          <h2 style={{
            fontSize: 'clamp(1.45rem, 3.2vw, 2rem)',
            fontWeight: 800,
            color: '#0F172A',
            margin: '0.3rem 0 0.5rem',
            letterSpacing: '-0.02em',
          }}>
            Apa Kata Pelanggan Kami
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#64748B', lineHeight: 1.65, maxWidth: '480px', margin: '0 auto' }}>
            Mesej whatsapp terus daripada pelanggan — ikhtiar rawatan sebenar dengan izin Allah.
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

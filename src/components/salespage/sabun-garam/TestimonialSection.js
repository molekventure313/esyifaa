'use client';

const TESTIMONIALS = [
  {
    name: 'Aishah M.',
    location: 'Kuala Lumpur',
    time: 'Semalam',
    tag: '😴 Susah Tidur → Tido Nyenyak',
    tagColor: '#3B82F6',
    text: '"Salam ustaz, nak bgtau sabun syifa aritu mmg berkesan👍 Sy dah leh tido nyenyak skrg. Dulu kul 3 pagi masih terkebil2 dada gelisah takleh tido. Lepas mandi sabun ni malam terus tido lena smpai subuh alhamdulillah"',
  },
  {
    name: 'Siti R.',
    location: 'Pulau Pinang',
    time: '2 hari lepas',
    tag: '🌿 Gatal & Ruam → Hilang',
    tagColor: '#10B981',
    text: '"Ustaz tq sgt2 sabun syifa aritu😊 Ruam merah ngan gatal2 kat bdan sy dah hilang terus. Dulu asal masuk maghrib je merenyam gatal2 badan tak tahan. Ni dah 4 hari mandi sabun ni terus kering gatal pun takde dah syukur"',
  },
  {
    name: 'Umi K.',
    location: 'Johor Bahru',
    time: '3 hari lepas',
    tag: '👶 Anak Meracau → Tenang',
    tagColor: '#8B5CF6',
    text: '"Salam ustaz ikhlas nak bg feedback. Anak sy umur 2 thn slalu meracau tgh mlm n bile nk mandikan kat bilik air slalu melalak takut. Lepas gune sabun syifa ni terus x menangis langsung mase mandi, mlm pon tido tenang x meracau lg syukur sgt 🤲"',
  },
  {
    name: 'Rahman A.',
    location: 'Selangor',
    time: '4 hari lepas',
    tag: '💪 Lenguh Urat → Lega',
    tagColor: '#F59E0B',
    text: '"Ustaz btol la sabun ni, bahu sy yg lenguh tegang bertahun tu terus lega lepas mandi tadi. Lenguh urat kat blakang bdan rse cam keluar angin. Rasa ringan giler bdan skrg TQ ustaz 🙏"',
  },
  {
    name: 'Zaiton H.',
    location: 'Kedah',
    time: '5 hari lepas',
    tag: '💨 Gangguan Keluar Dari Badan',
    tagColor: '#EF4444',
    text: '"Ustaz mase mandi sabun tadi sy terus sendawa tak henti2 ngan loya nak muntah tekak. Kuat betul angin keluar dari bdan. Lepas dah siap mandi terus rse dada lapang sgt2. Mmg sah ade gangguan terikat kat bdan sblom ni"',
  },
];

const ff = 'var(--font-inter), -apple-system, sans-serif';

function WaBubble({ t, i }) {
  return (
    <div style={{
      background: '#031E17',
      border: '1px solid rgba(74,222,128,0.15)',
      borderRadius: '16px',
      overflow: 'hidden',
      fontFamily: ff,
    }}>
      {/* WA header bar */}
      <div style={{
        background: '#042E23',
        borderBottom: '1px solid rgba(74,222,128,0.12)',
        padding: '0.7rem 1rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* Avatar placeholder */}
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: `linear-gradient(135deg, #065F46, #10B981)`,
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
          {/* Green left border like WA quoted message */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#25D366', borderRadius: '3px 0 0 3px' }} />
          <p style={{
            margin: 0, fontSize: '0.87rem', color: '#D1FAE5',
            lineHeight: 1.65, fontStyle: 'italic',
            paddingLeft: '0.5rem',
          }}>
            {t.text}
          </p>

          {/* Timestamp + read receipt */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.65rem', color: '#6EE7B7', opacity: 0.7 }}>{t.time}</span>
            <span style={{ fontSize: '0.7rem', color: '#4ADE80' }}>✓✓</span>
          </div>
        </div>

        {/* Tag */}
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

export default function SabunTestimonialSection() {
  return (
    <section style={{ background: '#042E23', padding: '4rem 1rem', fontFamily: ff }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{
            display: 'inline-block', background: 'rgba(37,211,102,0.1)',
            border: '1px solid rgba(37,211,102,0.35)', color: '#25D366',
            padding: '0.4rem 1.1rem', borderRadius: '50px',
            fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '1rem',
          }}>
            💬 Maklum Balas Pelanggan
          </span>
          <h2 style={{
            fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', fontWeight: 900,
            color: '#FEF3C7', margin: '0.4rem 0 0.5rem', letterSpacing: '-0.02em',
          }}>
            Apa Kata Pelanggan Kami
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#A7F3D0', lineHeight: 1.65, maxWidth: '480px', margin: '0 auto' }}>
            Mesej whatsapp terus dari pelanggan — rawatan sebenar, kesan sebenar, in shaa Allah.
          </p>
        </div>

        {/* Testimonial grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {TESTIMONIALS.map((t, i) => <WaBubble key={i} t={t} i={i} />)}
        </div>

      </div>
    </section>
  );
}

'use client';

import MarketerPixelProvider from '@/components/salespage/MarketerPixelProvider';
import WhatsAppOrderSection from '@/components/salespage/WhatsAppOrderSection';
import AirTawarTrialSection from '@/components/salespage/pengisian/AirTawarTrialSection';
import { HQ_WHATSAPP_RUQYAH_HARIAN } from '@/components/salespage/useSalesContact';
import RuqyahHarianCheckout from '@/components/salespage/ruqyah-harian/CheckoutForm';
import {
  AnnouncementBar, Testimonials, Authority, Elements, HowItWorks, Guarantee, FAQ, Closing, SlotMeter,
  Section, H2, Chip, C, ff, scrollToForm, BENEFITS, TESTIMONIALS_PART1, TESTIMONIALS_PART2,
} from '@/components/salespage/ruqyah-harian/Sections';
import { ANGLES } from '@/components/salespage/ruqyah-harian/angles';
import { RH_PACKAGES } from '@/lib/ruqyah-harian';

// SP Ruqyah Harian — 5 angle "gangguan berulang" (/ruqyah-harian-1 … -5).
// Hero, masalah, fears, insight, solution, goals & susunan testimoni ikut angle; selebihnya dikongsi dengan /ruqyah-harian.

const COLORS = { y: '#FDE047', r: '#FCA5A5', g: C.green };
// "teks <y>kuning</y> <r>merah</r> <g>hijau</g>" → JSX
function rich(str) {
  return str.split(/(<[yrg]>.*?<\/[yrg]>)/g).map((part, i) => {
    const m = part.match(/^<([yrg])>(.*)<\/\1>$/);
    return m ? <strong key={i} style={{ color: COLORS[m[1]] }}>{m[2]}</strong> : part;
  });
}

const ALL_TESTI = [...TESTIMONIALS_PART1, ...TESTIMONIALS_PART2];
const pick = names => names.map(n => ALL_TESTI.find(t => t.name === n)).filter(Boolean);

// #2 ─ Hero
function Hero({ hero }) {
  return (
    <section style={{ background: 'linear-gradient(180deg, #ECFDF5 0%, #F0FDF4 45%, #FFFFFF 100%)', padding: '4rem 1.25rem 3.5rem', fontFamily: ff, textAlign: 'center', borderBottom: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4.4vw, 2.8rem)', fontWeight: 900, color: C.ink, lineHeight: 1.25, letterSpacing: '-0.025em', marginBottom: '1.2rem' }}>
          {hero.pre}{' '}<span style={{ color: C.green }}>{hero.green}</span>
        </h1>
        <h4 style={{ fontSize: 'clamp(1.05rem, 2.2vw, 1.22rem)', fontWeight: 600, color: '#1E293B', lineHeight: 1.65, maxWidth: '720px', margin: '0 auto 1.75rem' }}>
          {hero.sub}
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.88rem', color: C.muted, flexWrap: 'wrap' }}>
          <span style={{ color: '#F59E0B' }}>★★★★★</span> Lebih 500 pesakit E-Syifa telah berikhtiar bersama kami
        </div>
        <a href="#borang" onClick={scrollToForm} style={{ display: 'inline-block', padding: '1.05rem 2.4rem', borderRadius: '50px', background: 'linear-gradient(180deg, #10B981, #047857)', color: '#FFFFFF', fontWeight: 900, fontSize: '1.05rem', textDecoration: 'none', boxShadow: '0 10px 28px rgba(4,120,87,0.35)' }}>
          👉🏻 PILIH PAKEJ SEKARANG
        </a>
      </div>
    </section>
  );
}

// #4 ─ Problems
function Problems({ p }) {
  return (
    <Section>
      <H2>{p.title}</H2>
      <p style={{ fontSize: '1.02rem', color: C.body, lineHeight: 1.7, maxWidth: '700px', margin: '0 auto 2rem' }}>{p.story}</p>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: C.ink, margin: '0 0 1.25rem' }}>Anda ada masalah ni? 👇🏻</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.85rem', textAlign: 'left' }}>
        {p.items.map(([i, t]) => (
          <div key={t} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '1rem', borderRadius: '14px', background: '#FEF2F2', border: '1px solid #FECACA' }}>
            <span style={{ fontSize: '1.4rem' }}>{i}</span>
            <span style={{ fontSize: '0.92rem', color: '#7F1D1D', fontWeight: 600, lineHeight: 1.5 }}>{t}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

// #5 ─ Fears
function Fears({ f }) {
  return (
    <Section bg="#0B1410" max="780px">
      <Chip dark>⚠️ Sila beri perhatian</Chip>
      <H2 dark>{f.title}</H2>
      <div style={{ textAlign: 'left', color: '#D1FAE5', fontSize: '1rem', lineHeight: 1.8, display: 'grid', gap: '1rem' }}>
        {f.paras.map(([t]) => <p key={t} style={{ margin: 0 }}>{rich(t)}</p>)}
      </div>
    </Section>
  );
}

// Insight khusus angle (selepas Fears, sebelum Authority)
const noteStyle = { marginTop: '1rem', fontSize: '0.84rem', color: C.muted, lineHeight: 1.6 };
const th = { padding: '0.6rem 0.5rem', textAlign: 'left' };
const td = { padding: '0.6rem 0.5rem', borderTop: '1px solid #E2E8F0', textAlign: 'left', verticalAlign: 'top' };

function InsightCompare({ x }) {
  return (
    <>
      <div style={{ overflowX: 'auto', borderRadius: '14px', border: '1px solid #E2E8F0', background: '#FFFFFF', marginTop: '1.25rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(0.8rem, 2.8vw, 0.9rem)' }}>
          <thead><tr style={{ background: '#F1F5F9' }}><th style={th}>{x.cols[0]}</th><th style={{ ...th, color: '#991B1B' }}>{x.cols[1]}</th></tr></thead>
          <tbody>{x.rows.map(([a, b]) => <tr key={a}><td style={{ ...td, fontWeight: 700, color: C.ink }}>{a}</td><td style={{ ...td, color: '#7F1D1D' }}>{b}</td></tr>)}</tbody>
        </table>
      </div>
      <p style={noteStyle}>{x.note}</p>
    </>
  );
}

function InsightChecklist({ x }) {
  return (
    <>
      <p style={{ fontSize: '1rem', color: C.body, lineHeight: 1.7, maxWidth: '680px', margin: '0 auto 1.25rem' }}>{x.intro}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.7rem', textAlign: 'left' }}>
        {x.items.map(t => (
          <div key={t} style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start', padding: '0.9rem 1rem', borderRadius: '12px', background: '#FFFFFF', border: `1px solid ${C.border}`, fontWeight: 600, color: C.ink, fontSize: '0.92rem' }}>
            <span>☑️</span>{t}
          </div>
        ))}
      </div>
      <p style={noteStyle}>{x.note}</p>
    </>
  );
}

function InsightTimeline({ x }) {
  const cell = (on, n) => (
    <div key={n} title={`Hari ${n + 1}`} style={{ aspectRatio: '1', borderRadius: '4px', background: on ? '#10B981' : '#FCA5A5' }} />
  );
  const row = (label, fn, count) => (
    <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '0.9rem', color: C.ink, marginBottom: '0.45rem', gap: '0.5rem' }}>
        <span>{label}</span><span style={{ color: count > 1 ? C.green : '#991B1B' }}>{count} bacaan</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: '4px' }}>
        {Array.from({ length: 30 }, (_, n) => cell(fn(n), n))}
      </div>
    </div>
  );
  return (
    <div style={{ maxWidth: '620px', margin: '1.5rem auto 0' }}>
      {row(x.rowA, n => n === 0, 1)}
      {row(x.rowB, () => true, 60)}
      <p style={noteStyle}>{x.note}</p>
    </div>
  );
}

function InsightCost({ x }) {
  const rows = [
    ['Sesi rawatan bersemuka', 'RM100–RM300', '1 bacaan', 'RM100–RM300', false],
    ...RH_PACKAGES.slice().reverse().map(p => [`Ruqyah Harian — ${p.label}`, `RM${p.price}`, `±${p.readings} bacaan`, `±RM${(p.price / p.readings).toFixed(2)}`, true]),
  ];
  return (
    <>
      <div style={{ overflowX: 'auto', borderRadius: '14px', border: '1px solid #E2E8F0', background: '#FFFFFF', marginTop: '1.25rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(0.74rem, 2.6vw, 0.9rem)' }}>
          <thead><tr style={{ background: '#F1F5F9' }}><th style={th} /><th style={th}>Bayaran</th><th style={th}>Bacaan</th><th style={th}>Kos / bacaan</th></tr></thead>
          <tbody>
            {rows.map(([a, b, c, d, hl]) => (
              <tr key={a} style={{ background: hl ? '#F0FDF4' : '#FFFFFF' }}>
                <td style={{ ...td, fontWeight: 700, color: C.ink }}>{a}</td>
                <td style={td}>{b}</td>
                <td style={td}>{c}</td>
                <td style={{ ...td, fontWeight: 800, color: hl ? C.green : '#991B1B' }}>{d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.7rem', marginTop: '1.25rem' }}>
        {[['🚗', 'Tiada minyak & tol'], ['🏢', 'Tak perlu ambil cuti'], ['⏳', 'Tak perlu beratur'], ['🏠', 'Diterima dari rumah']].map(([i, t]) => (
          <div key={t} style={{ padding: '0.85rem', borderRadius: '12px', background: '#FFFFFF', border: `1px solid ${C.border}`, fontWeight: 700, fontSize: '0.88rem', color: C.ink }}>{i} {t}</div>
        ))}
      </div>
      <p style={noteStyle}>{x.note}</p>
    </>
  );
}

function InsightControl({ x }) {
  const box = (title, items, bad) => (
    <div style={{ background: bad ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${bad ? '#FECACA' : C.border}`, borderRadius: '16px', padding: '1.25rem', textAlign: 'left' }}>
      <div style={{ fontWeight: 800, color: bad ? '#991B1B' : C.green, marginBottom: '0.6rem' }}>{title}</div>
      {items.map(t => <div key={t} style={{ fontSize: '0.9rem', color: C.ink, padding: '0.3rem 0', fontWeight: 600 }}>{bad ? '✖️' : '✅'} {t}</div>)}
    </div>
  );
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
        {box('Di luar kawalan kita', x.cant, true)}
        {box('Dalam kawalan anda', x.can, false)}
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: C.ink, margin: '2rem 0 1rem' }}>Rawat diri setiap hari — 2 pilihan</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', textAlign: 'left' }}>
        {x.options.map(([i, t, d]) => (
          <div key={t} style={{ background: '#FFFFFF', border: `1px solid ${C.border}`, borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ fontSize: '1.6rem' }}>{i}</div>
            <div style={{ fontWeight: 800, color: C.ink, margin: '0.35rem 0' }}>{t}</div>
            <div style={{ fontSize: '0.88rem', color: C.body, lineHeight: 1.6 }}>{d}</div>
          </div>
        ))}
      </div>
    </>
  );
}

const INSIGHTS = { compare: InsightCompare, checklist: InsightChecklist, timeline: InsightTimeline, cost: InsightCost, control: InsightControl };
function Insight({ x }) {
  const Body = INSIGHTS[x.type];
  return (
    <Section bg="#F8FAF9" max="860px">
      <Chip>{x.chip}</Chip>
      <H2>{x.title}</H2>
      <Body x={x} />
    </Section>
  );
}

// #7 + #8 ─ Solution & manfaat
function Solution({ title }) {
  return (
    <Section>
      <Chip>✨ Penyelesaian</Chip>
      <H2>{rich(title.replace('Ruqyah Harian E-Syifa', '<g>Ruqyah Harian E-Syifa</g>'))}</H2>
      <p style={{ fontSize: '1.02rem', color: C.body, lineHeight: 1.7, maxWidth: '700px', margin: '0 auto 2.25rem' }}>
        Perawat bacakan 4 lapisan ruqyah jarak jauh atas nama anda <strong>2 kali sehari</strong>. Anda tak perlu buat apa-apa — teruskan hidup harian, bacaan berjalan untuk anda.
      </p>
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: C.ink, margin: '0 0 1.1rem' }}>{BENEFITS.length} manfaat Ruqyah Harian E-Syifa</h3>
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

// #10 ─ Goals
function Goals({ g }) {
  return (
    <Section max="760px">
      <Chip>🎯 Apa Yang Kami Doakan Untuk Anda</Chip>
      <H2>{g.title}</H2>
      <div style={{ display: 'grid', gap: '0.7rem', textAlign: 'left', marginTop: '1.25rem' }}>
        {g.items.map(t => (
          <div key={t} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.95rem 1.1rem', borderRadius: '12px', background: '#F0FDF4', border: `1px solid ${C.border}`, fontWeight: 700, color: C.ink }}>
            <span style={{ fontSize: '1.15rem' }}>✅</span>{t}
          </div>
        ))}
      </div>
    </Section>
  );
}

export default function RuqyahHarianAnglePage({ angle }) {
  const a = ANGLES[angle];
  const testi = pick(a.testi.order);
  return (
    <main style={{ minHeight: '100vh', background: '#FFFFFF', color: '#0F172A' }}>
      <MarketerPixelProvider />
      <AnnouncementBar />                                                   {/* #1 */}
      <Hero hero={a.hero} />                                                {/* #2 */}
      <Testimonials items={testi.slice(0, 5)} title={a.testi.title1} />     {/* #3 */}
      <Problems p={a.problems} />                                           {/* #4 */}
      <Fears f={a.fears} />                                                 {/* #5 */}
      <Insight x={a.insight} />                                             {/* #5b — khusus angle */}
      <Authority />                                                         {/* #6 */}
      <Solution title={a.solution} />                                       {/* #7 + #8 */}
      <Elements />                                                          {/* #9 */}
      <Goals g={a.goals} />                                                 {/* #10 */}
      <HowItWorks />                                                        {/* #11 */}
      <Testimonials part={2} items={testi.slice(5)} />                      {/* #12 */}
      <Guarantee />                                                         {/* #14 */}
      <RuqyahHarianCheckout source={a.source} title={rich(a.checkout)} />   {/* #13 + #15 */}
      <AirTawarTrialSection background="linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)" hqNumber={HQ_WHATSAPP_RUQYAH_HARIAN} />
      <WhatsAppOrderSection product="Ruqyah Harian E-Syifa" background="#F0FDF4" hqNumber={HQ_WHATSAPP_RUQYAH_HARIAN} />  {/* #16 */}
      <FAQ extra={a.faq} />                                                 {/* #17 */}
      <Closing title={a.closing} />
      <footer style={{ background: '#021812', color: '#94A3B8', padding: '2rem 1rem', textAlign: 'center', fontSize: '0.8rem', fontFamily: ff }}>
        © {new Date().getFullYear()} E-Syifa&apos; · Ruqyah Syar&apos;iyyah berasaskan Al-Quran &amp; Sunnah. Kesembuhan hanya daripada Allah SWT.
      </footer>
    </main>
  );
}

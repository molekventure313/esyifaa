'use client';

// Section ANGLE untuk SP yang dijana (Framework FSP 10%).
// Komponen sama untuk SP awam (/s/[slug]) & editor — prop `edit` (bukan null) = mod edit:
//   teks boleh diklik & ditaip terus, item senarai boleh tambah/buang, gambar boleh ditukar.

import { splitHighlight } from '@/lib/sp-generator/schema';

const ff = 'var(--font-inter), -apple-system, sans-serif';
const INK = '#0F172A', BODY = '#475569', MUTED = '#64748B', LINE = '#E2E8F0';

const scrollToForm = () => document.getElementById('borang')?.scrollIntoView({ behavior: 'smooth' });

// Teks — mod edit: contentEditable; awam: papar **sorotan** dalam warna aksen
function T({ as: Tag = 'span', value, path, edit, theme, style }) {
  if (edit) {
    return (
      <Tag
        key={value}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        onBlur={e => { const v = e.currentTarget.innerText.replace(/\n{3,}/g, '\n\n').trim(); if (v !== value) edit.set(path, v); }}
        style={{ color: 'inherit', ...style, whiteSpace: 'pre-line', outline: '1px dashed rgba(16,185,129,0.55)', outlineOffset: '3px', borderRadius: '4px', cursor: 'text', minWidth: '2rem' }}
      >{value}</Tag>
    );
  }
  if (!value) return null;
  return (
    <Tag style={{ color: 'inherit', ...style, whiteSpace: 'pre-line' }}>
      {splitHighlight(value).map((p, i) => p.hl ? <span key={i} style={{ color: theme.accent }}>{p.text}</span> : p.text)}
    </Tag>
  );
}

function RemoveBtn({ onClick }) {
  return (
    <button type="button" onClick={onClick} title="Buang"
      style={{ position: 'absolute', top: '-8px', right: '-8px', width: '22px', height: '22px', borderRadius: '50%', border: 'none', background: '#EF4444', color: '#fff', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer', lineHeight: 1, zIndex: 2 }}>✕</button>
  );
}

function AddBtn({ onClick, label = '＋ Tambah' }) {
  return (
    <button type="button" onClick={onClick}
      style={{ padding: '0.55rem 1rem', borderRadius: '10px', border: '1.5px dashed #10B981', background: 'rgba(16,185,129,0.06)', color: '#047857', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: ff }}>{label}</button>
  );
}

// Gambar — mod edit: butang tukar / buang
function Img({ src, path, edit, alt, style, maxWidth = '420px' }) {
  if (!src && !edit) return null;
  return (
    <div style={{ position: 'relative', maxWidth, width: '100%', margin: '1.75rem auto' }}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" style={{ width: '100%', display: 'block', borderRadius: '18px', boxShadow: '0 16px 40px rgba(0,0,0,0.12)', objectFit: 'cover', ...style }} />
      ) : (
        <button type="button" onClick={() => edit.pickImage(path)}
          style={{ width: '100%', aspectRatio: '4 / 3', borderRadius: '18px', border: '2px dashed #CBD5E1', background: '#F8FAFC', color: MUTED, fontWeight: 700, cursor: 'pointer', fontFamily: ff }}>
          📷 Tambah gambar
        </button>
      )}
      {edit && src && (
        <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
          <button type="button" onClick={() => edit.pickImage(path)} style={imgBtn('#0F172A')}>📷 Tukar</button>
          <button type="button" onClick={() => edit.set(path, null)} style={imgBtn('#EF4444')}>✕</button>
        </div>
      )}
    </div>
  );
}
const imgBtn = bg => ({ padding: '0.4rem 0.7rem', borderRadius: '8px', border: 'none', background: bg, color: '#fff', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', fontFamily: ff, opacity: 0.92 });

function Section({ bg = '#FFFFFF', children, narrow = false }) {
  return (
    <section style={{ background: bg, padding: '4rem 1.25rem', fontFamily: ff, borderBottom: `1px solid ${LINE}`, color: INK }}>
      <div style={{ maxWidth: narrow ? '760px' : '880px', margin: '0 auto' }}>{children}</div>
    </section>
  );
}

function CtaButton({ value, path, edit, theme, onClick = scrollToForm }) {
  const style = {
    display: 'inline-block', padding: '1.05rem 2.4rem', fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF',
    background: `linear-gradient(180deg, ${theme.accent} 0%, ${theme.accent}DD 100%)`, border: 'none', borderRadius: '9999px',
    cursor: 'pointer', boxShadow: `0 8px 25px ${theme.accent}44`, fontFamily: ff,
  };
  if (edit) return <T as="div" value={value} path={path} edit={edit} theme={theme} style={{ ...style, cursor: 'text' }} />;
  return <button type="button" onClick={onClick} style={style}>{value || '👉🏻 BELI SEKARANG'}</button>;
}

const h2 = { fontSize: 'clamp(1.5rem, 3.4vw, 2.2rem)', fontWeight: 800, lineHeight: 1.3, letterSpacing: '-0.02em', margin: '0 0 1rem', textAlign: 'center', color: INK };
const lead = { fontSize: '1.02rem', lineHeight: 1.75, color: BODY, textAlign: 'center', maxWidth: '680px', margin: '0 auto 2rem' };

// list helpers
const items = (d, k) => (Array.isArray(d?.[k]) ? d[k] : []);

// ─── #1 Announcement Bar ─────────────────────────────────────────────────────
export function GenAnnouncement({ data, edit, theme }) {
  if (!data?.text && !edit) return null;
  return (
    <div style={{ background: '#0F172A', color: '#FDE047', textAlign: 'center', padding: '0.65rem 1rem', fontFamily: ff, fontWeight: 800, fontSize: '0.88rem', letterSpacing: '0.02em' }}>
      <T value={data?.text} path="announcement.text" edit={edit} theme={theme} />
    </div>
  );
}

// ─── #2 Hero Banner ──────────────────────────────────────────────────────────
export function GenHero({ data, edit, theme, product }) {
  return (
    <section style={{ background: `linear-gradient(180deg, ${theme.accentSoft} 0%, #FFFFFF 100%)`, padding: '4rem 1.25rem 3.5rem', fontFamily: ff, textAlign: 'center', borderBottom: `1px solid ${LINE}`, color: INK }}>
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
        {(data?.badge || edit) && (
          <div style={{ display: 'inline-block', background: '#FFFFFF', border: `1px solid ${theme.accentBorder}`, padding: '0.4rem 1rem', borderRadius: '9999px', marginBottom: '1.5rem', fontSize: '0.76rem', fontWeight: 800, color: theme.accent, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            <T value={data?.badge} path="hero.badge" edit={edit} theme={theme} />
          </div>
        )}
        <T as="h1" value={data?.headline} path="hero.headline" edit={edit} theme={theme}
          style={{ fontSize: 'clamp(1.75rem, 4.2vw, 2.8rem)', fontWeight: 800, lineHeight: 1.28, letterSpacing: '-0.025em', margin: '0 0 1.15rem' }} />
        <T as="p" value={data?.sub} path="hero.sub" edit={edit} theme={theme}
          style={{ fontSize: '1.05rem', lineHeight: 1.75, color: BODY, maxWidth: '680px', margin: '0 auto' }} />
        <Img src={data?.image} path="hero.image" edit={edit} alt={product.label} />
        {!data?.image && !edit && <div style={{ height: '1.75rem' }} />}
        <CtaButton value={data?.cta} path="hero.cta" edit={edit} theme={theme} />
        <p style={{ margin: '0.85rem 0 0', fontSize: '0.84rem', color: MUTED }}>{product.priceLine}</p>
      </div>
    </section>
  );
}

// ─── #4 Problems ─────────────────────────────────────────────────────────────
export function GenProblems({ data, edit, theme }) {
  const list = items(data, 'items');
  return (
    <Section bg="#FFFFFF">
      <T as="h2" value={data?.title} path="problems.title" edit={edit} theme={theme} style={h2} />
      <T as="p" value={data?.story} path="problems.story" edit={edit} theme={theme} style={lead} />
      <T as="h3" value={data?.lead} path="problems.lead" edit={edit} theme={theme}
        style={{ fontSize: '1.25rem', fontWeight: 800, textAlign: 'center', margin: '0 0 1.5rem', color: INK }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
        {list.map((it, i) => (
          <div key={i} style={{ position: 'relative', display: 'flex', gap: '0.7rem', alignItems: 'flex-start', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '14px', padding: '1rem 1.1rem' }}>
            <span style={{ fontSize: '1.05rem', lineHeight: 1.5 }}>😣</span>
            <T value={it} path={`problems.items.${i}`} edit={edit} theme={theme} style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.55, color: '#7F1D1D', flex: 1 }} />
            {edit && <RemoveBtn onClick={() => edit.removeItem('problems.items', i)} />}
          </div>
        ))}
      </div>
      {edit && list.length < 8 && <div style={{ textAlign: 'center', marginTop: '1rem' }}><AddBtn onClick={() => edit.addItem('problems.items', '[Masalah baru]')} /></div>}
    </Section>
  );
}

// ─── #5 Fears ────────────────────────────────────────────────────────────────
export function GenFears({ data, edit, theme }) {
  const list = items(data, 'items');
  return (
    <Section bg="#FFFBEB" narrow>
      <div style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '0.5rem' }}>⚠️</div>
      <T as="h2" value={data?.title} path="fears.title" edit={edit} theme={theme} style={{ ...h2, color: '#92400E' }} />
      <T as="p" value={data?.desc} path="fears.desc" edit={edit} theme={theme} style={lead} />
      <div style={{ display: 'grid', gap: '0.85rem' }}>
        {list.map((it, i) => (
          <div key={i} style={{ position: 'relative', background: '#FFFFFF', border: '1px solid #FDE68A', borderLeft: '4px solid #F59E0B', borderRadius: '12px', padding: '1rem 1.15rem' }}>
            <T as="div" value={it?.title} path={`fears.items.${i}.title`} edit={edit} theme={theme} style={{ fontWeight: 800, fontSize: '1rem', color: INK, marginBottom: '0.3rem' }} />
            <T as="div" value={it?.text} path={`fears.items.${i}.text`} edit={edit} theme={theme} style={{ fontSize: '0.93rem', lineHeight: 1.65, color: BODY }} />
            {edit && <RemoveBtn onClick={() => edit.removeItem('fears.items', i)} />}
          </div>
        ))}
      </div>
      {edit && list.length < 5 && <div style={{ textAlign: 'center', marginTop: '1rem' }}><AddBtn onClick={() => edit.addItem('fears.items', { title: '[Akibat]', text: '[Terangkan]' })} /></div>}
    </Section>
  );
}

// ─── #7 Solution ─────────────────────────────────────────────────────────────
export function GenSolution({ data, edit, theme, product }) {
  const list = items(data, 'points');
  return (
    <Section bg={`linear-gradient(180deg, #FFFFFF 0%, ${theme.accentSoft} 100%)`}>
      <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
        <span style={{ display: 'inline-block', background: theme.accent, color: '#fff', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', padding: '0.35rem 0.9rem', borderRadius: '999px' }}>💡 PENYELESAIAN</span>
      </div>
      <T as="h2" value={data?.headline} path="solution.headline" edit={edit} theme={theme} style={h2} />
      <T as="p" value={data?.desc} path="solution.desc" edit={edit} theme={theme} style={{ ...lead, marginBottom: 0 }} />
      <Img src={data?.image} path="solution.image" edit={edit} alt={product.label} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
        {list.map((it, i) => (
          <div key={i} style={{ position: 'relative', display: 'flex', gap: '0.65rem', background: '#FFFFFF', border: `1px solid ${theme.accentBorder}`, borderRadius: '14px', padding: '1rem 1.1rem' }}>
            <span style={{ color: theme.accent, fontWeight: 900 }}>✓</span>
            <T value={it} path={`solution.points.${i}`} edit={edit} theme={theme} style={{ fontSize: '0.95rem', lineHeight: 1.55, color: INK, fontWeight: 600, flex: 1 }} />
            {edit && <RemoveBtn onClick={() => edit.removeItem('solution.points', i)} />}
          </div>
        ))}
      </div>
      {edit && list.length < 6 && <div style={{ textAlign: 'center', marginTop: '1rem' }}><AddBtn onClick={() => edit.addItem('solution.points', '[Sebab baru]')} /></div>}
    </Section>
  );
}

// ─── #8 Benefits ─────────────────────────────────────────────────────────────
export function GenBenefits({ data, edit, theme }) {
  const list = items(data, 'items');
  return (
    <Section bg="#FFFFFF">
      <T as="h2" value={data?.title} path="benefits.title" edit={edit} theme={theme} style={{ ...h2, marginBottom: '2rem' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
        {list.map((it, i) => (
          <div key={i} style={{ position: 'relative', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: theme.accentSoft, borderRadius: '14px', padding: '1rem 1.1rem' }}>
            <span style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', background: theme.accent, color: '#fff', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
            <T value={it} path={`benefits.items.${i}`} edit={edit} theme={theme} style={{ fontSize: '0.95rem', lineHeight: 1.6, color: INK, flex: 1 }} />
            {edit && <RemoveBtn onClick={() => edit.removeItem('benefits.items', i)} />}
          </div>
        ))}
      </div>
      {edit && list.length < 12 && <div style={{ textAlign: 'center', marginTop: '1rem' }}><AddBtn onClick={() => edit.addItem('benefits.items', '[Manfaat baru]')} /></div>}
    </Section>
  );
}

// ─── #10 Goals ───────────────────────────────────────────────────────────────
export function GenGoals({ data, edit, theme }) {
  const list = items(data, 'items');
  return (
    <Section bg={`linear-gradient(180deg, ${theme.accentSoft} 0%, #FFFFFF 100%)`} narrow>
      <T as="h2" value={data?.title} path="goals.title" edit={edit} theme={theme} style={{ ...h2, marginBottom: '1.75rem' }} />
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {list.map((it, i) => (
          <div key={i} style={{ position: 'relative', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: '#FFFFFF', border: `1px solid ${theme.accentBorder}`, borderRadius: '12px', padding: '0.95rem 1.1rem' }}>
            <span>✅</span>
            <T value={it} path={`goals.items.${i}`} edit={edit} theme={theme} style={{ fontSize: '0.98rem', lineHeight: 1.6, color: INK, fontWeight: 600, flex: 1 }} />
            {edit && <RemoveBtn onClick={() => edit.removeItem('goals.items', i)} />}
          </div>
        ))}
      </div>
      {edit && list.length < 6 && <div style={{ textAlign: 'center', marginTop: '1rem' }}><AddBtn onClick={() => edit.addItem('goals.items', '[Perubahan baru]')} /></div>}
    </Section>
  );
}

// ─── #15 CTA (atas borang tempahan) ──────────────────────────────────────────
export function GenCta({ data, edit, theme }) {
  return (
    <section style={{ background: theme.accent, color: '#FFFFFF', padding: '3rem 1.25rem', fontFamily: ff, textAlign: 'center' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <T as="h2" value={data?.headline} path="cta.headline" edit={edit} theme={{ ...theme, accent: '#FDE047' }}
          style={{ fontSize: 'clamp(1.45rem, 3.2vw, 2.05rem)', fontWeight: 800, lineHeight: 1.3, margin: '0 0 0.75rem' }} />
        <T as="p" value={data?.desc} path="cta.desc" edit={edit} theme={{ ...theme, accent: '#FDE047' }}
          style={{ fontSize: '1rem', lineHeight: 1.7, margin: 0, opacity: 0.95 }} />
        <div style={{ fontSize: '1.6rem', marginTop: '0.75rem' }}>👇🏻</div>
      </div>
    </section>
  );
}

// ─── Penutup ─────────────────────────────────────────────────────────────────
export function GenClosing({ data, edit, theme }) {
  return (
    <section style={{ background: 'linear-gradient(180deg, #0F172A 0%, #020617 100%)', color: '#F8FAFC', padding: '4rem 1.25rem', fontFamily: ff, textAlign: 'center' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <T as="h2" value={data?.headline} path="closing.headline" edit={edit} theme={{ ...theme, accent: '#6EE7B7' }}
          style={{ fontSize: 'clamp(1.45rem, 3.2vw, 2.1rem)', fontWeight: 800, lineHeight: 1.3, margin: '0 0 1rem' }} />
        <T as="p" value={data?.text} path="closing.text" edit={edit} theme={{ ...theme, accent: '#6EE7B7' }}
          style={{ fontSize: '1.02rem', lineHeight: 1.8, color: '#CBD5E1', margin: '0 0 2rem' }} />
        <CtaButton value={data?.cta} path="closing.cta" edit={edit} theme={theme} />
      </div>
    </section>
  );
}

export const ANGLE_COMPONENTS = {
  announcement: GenAnnouncement,
  hero: GenHero,
  problems: GenProblems,
  fears: GenFears,
  solution: GenSolution,
  benefits: GenBenefits,
  goals: GenGoals,
  cta: GenCta,
  closing: GenClosing,
};

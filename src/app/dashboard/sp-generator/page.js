'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SP_PRODUCTS, SP_PRODUCT_KEYS } from '@/lib/sp-generator/products';
import { HOOK_TYPES, TONES, slugify, SLUG_RE } from '@/lib/sp-generator/schema';

// SP Generator — marketer bina SP sendiri ikut angle iklan (Framework FSP 10%).
// Testimoni, harga, borang & fakta produk diambil terus dari SP HQ.

function useLightMode() {
  const [lm, setLm] = useState(false);
  useEffect(() => {
    const check = () => setLm(document.body.classList.contains('light-mode') || document.documentElement.getAttribute('data-theme') === 'light');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return lm;
}

const STATUS = {
  draft:       { label: '✏️ Draf',        color: '#F59E0B' },
  published:   { label: '● Live',         color: '#10B981' },
  unpublished: { label: '○ Dihentikan',   color: '#EF4444' },
};

const fmt = d => new Date(d).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' });

export default function SpGeneratorPage() {
  const lm = useLightMode();
  const router = useRouter();
  const C = {
    card: lm ? '#FFFFFF' : '#10131A', sub: lm ? '#F8FAFC' : '#090A0F',
    border: lm ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)',
    tp: lm ? '#0F172A' : '#F9FAFB', ts: lm ? '#475569' : '#9CA3AF', tm: lm ? '#64748B' : '#6B7280',
    input: lm ? '#FFFFFF' : '#0B0D13',
  };
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(null);

  const load = useCallback(async () => {
    try {
      const json = await (await fetch('/api/sp-generator')).json();
      if (!json.success) throw new Error(json.error);
      setData(json); setError('');
    } catch (e) { setError(e.message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const linkOf = slug => `${typeof window !== 'undefined' ? window.location.origin : ''}/s/${slug}`;
  const copy = slug => { navigator.clipboard?.writeText(linkOf(slug)); setCopied(slug); setTimeout(() => setCopied(null), 1800); };

  const remove = async sp => {
    if (!confirm(`Padam SP "${sp.title}"? Link /s/${sp.slug} akan terus tidak berfungsi.`)) return;
    const json = await (await fetch(`/api/sp-generator/${sp.id}`, { method: 'DELETE' })).json();
    if (!json.success) return alert(json.error);
    load();
  };

  const q = data?.quota;
  const inputStyle = { width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', fontSize: '0.88rem', fontFamily: ff, border: C.border, background: C.input, color: C.tp, boxSizing: 'border-box' };

  return (
    <div style={{ fontFamily: ff, color: C.tp, padding: '0.25rem 0' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderRadius: '10px', marginBottom: '1.25rem', background: C.card, border: C.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>✨ SP Generator</h1>
          <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: C.ts, maxWidth: '640px', lineHeight: 1.55 }}>
            Bina salespage sendiri ikut angle iklan anda — Framework FSP 10%. Testimoni, harga, pakej &amp; borang tempahan diambil terus dari SP HQ. Order, pixel &amp; WhatsApp automatik masuk ke akaun anda.
          </p>
        </div>
        {!creating && (
          <button onClick={() => setCreating(true)} style={{ padding: '0.65rem 1.1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem', fontFamily: ff, background: '#10B981', color: '#fff' }}>＋ Bina SP Baru</button>
        )}
      </div>

      {q && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1.25rem' }}>
          {!q.ai_enabled && <Pill color="#F59E0B" C={C}>⚠️ AI belum diaktifkan (ANTHROPIC_API_KEY) — boleh bina &amp; edit secara manual</Pill>}
          {q.ai_enabled && (q.unlimited
            ? <Pill color="#10B981" C={C}>✨ Kuota AI: tanpa had (super admin)</Pill>
            : <>
                <Pill color={q.full.used >= q.full.max ? '#EF4444' : '#10B981'} C={C}>✨ Jana penuh bulan ini: {q.full.used} / {q.full.max}</Pill>
                <Pill color={q.calls.used >= q.calls.max ? '#EF4444' : '#60A5FA'} C={C}>✍️ Panggilan AI: {q.calls.used} / {q.calls.max}</Pill>
              </>)}
        </div>
      )}

      {creating && <CreateForm C={C} ff={ff} inputStyle={inputStyle} quota={q} onCancel={() => setCreating(false)}
        onCreated={(id, ai) => router.push(`/dashboard/sp-generator/${id}${ai ? '?jana=1' : ''}`)} />}

      {error ? (
        <div style={{ padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: '0.85rem' }}>⚠️ {error}</div>
      ) : !data ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: C.tm }}>Memuatkan...</div>
      ) : !data.data.length ? (
        !creating && <div style={{ padding: '3rem 1rem', textAlign: 'center', color: C.tm, background: C.card, border: C.border, borderRadius: '10px' }}>Belum ada SP. Klik <strong>＋ Bina SP Baru</strong> untuk mula.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.85rem' }}>
          {data.data.map(sp => {
            const p = SP_PRODUCTS[sp.product_key];
            const st = STATUS[sp.status] || STATUS.draft;
            return (
              <div key={sp.id} style={{ background: C.card, border: C.border, borderRadius: '12px', padding: '1rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.98rem', lineHeight: 1.35 }}>{sp.title}</div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: st.color, whiteSpace: 'nowrap' }}>{st.label}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: C.ts }}>{p?.emoji} {p?.label || sp.product_key}</div>
                {sp.owner_name && !sp.mine && <div style={{ fontSize: '0.75rem', color: C.tm }}>👤 {sp.owner_name}</div>}
                <div style={{ fontSize: '0.76rem', color: C.tm, fontFamily: 'monospace', background: C.sub, padding: '0.4rem 0.55rem', borderRadius: '6px', wordBreak: 'break-all' }}>/s/{sp.slug}</div>
                <div style={{ fontSize: '0.72rem', color: C.tm }}>Dikemaskini {fmt(sp.updated_at)}{sp.published_at ? ` · Live sejak ${fmt(sp.published_at)}` : ''}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                  <Btn C={C} ff={ff} primary onClick={() => router.push(`/dashboard/sp-generator/${sp.id}`)}>✏️ Edit</Btn>
                  {sp.status === 'published' && <Btn C={C} ff={ff} onClick={() => copy(sp.slug)}>{copied === sp.slug ? '✓ Disalin' : '🔗 Salin link'}</Btn>}
                  {sp.status === 'published' && <Btn C={C} ff={ff} onClick={() => window.open(`/s/${sp.slug}`, '_blank')}>↗ Buka</Btn>}
                  <Btn C={C} ff={ff} danger onClick={() => remove(sp)}>🗑</Btn>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Pill({ color, children, C }) {
  return <span style={{ fontSize: '0.76rem', fontWeight: 700, color, background: C.card, border: `1px solid ${color}55`, padding: '0.35rem 0.75rem', borderRadius: '999px' }}>{children}</span>;
}

function Btn({ children, onClick, primary, danger, C, ff, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '0.42rem 0.75rem', borderRadius: '7px', fontSize: '0.78rem', fontWeight: 700, fontFamily: ff, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.55 : 1,
      border: primary ? 'none' : danger ? '1px solid rgba(239,68,68,0.35)' : C.border,
      background: primary ? '#10B981' : 'transparent', color: primary ? '#fff' : danger ? '#EF4444' : C.ts,
    }}>{children}</button>
  );
}

function CreateForm({ C, ff, inputStyle, quota, onCancel, onCreated }) {
  const [product, setProduct] = useState('sabun-garam');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [angle, setAngle] = useState({ audience: '', problem: '', hook: 'testimoni', tone: 'lembut', story: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const effSlug = slugTouched ? slug : slugify(title);
  const aiReady = quota?.ai_enabled && (quota.unlimited || quota.full.used < quota.full.max);
  const aiWhy = !quota?.ai_enabled ? 'AI belum diaktifkan' : (!aiReady ? 'Kuota jana penuh bulan ini dah habis' : '');

  const submit = async ai => {
    setErr('');
    if (!title.trim()) return setErr('Isi nama SP.');
    if (!SLUG_RE.test(effSlug)) return setErr('Link tidak sah — guna huruf kecil, nombor & sengkang (3-50 aksara).');
    if (ai && (!angle.audience.trim() || !angle.problem.trim())) return setErr('Untuk jana dengan AI, isi target audience & masalah utama.');
    setBusy(true);
    try {
      const json = await (await fetch('/api/sp-generator', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_key: product, title, slug: effSlug, angle }),
      })).json();
      if (!json.success) throw new Error(json.error);
      onCreated(json.id, ai);
    } catch (e) { setErr(e.message); setBusy(false); }
  };

  const label = t => <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: C.ts, margin: '0 0 0.35rem' }}>{t}</label>;
  const set = (k, v) => setAngle(a => ({ ...a, [k]: v }));

  return (
    <div style={{ background: C.card, border: C.border, borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
      <h2 style={{ margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: 800 }}>1. Pilih produk</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.6rem', marginBottom: '1.5rem' }}>
        {SP_PRODUCT_KEYS.map(k => {
          const p = SP_PRODUCTS[k]; const on = product === k;
          return (
            <button key={k} type="button" onClick={() => setProduct(k)} style={{
              textAlign: 'left', padding: '0.75rem 0.85rem', borderRadius: '10px', cursor: 'pointer', fontFamily: ff,
              border: on ? '2px solid #10B981' : C.border, background: on ? 'rgba(16,185,129,0.1)' : C.sub, color: C.tp,
            }}>
              <div style={{ fontSize: '1.2rem' }}>{p.emoji}</div>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', margin: '0.2rem 0' }}>{p.label}</div>
              <div style={{ fontSize: '0.7rem', color: C.tm, lineHeight: 1.4 }}>{p.priceLine}</div>
            </button>
          );
        })}
      </div>

      <h2 style={{ margin: '0 0 1rem', fontSize: '1.05rem', fontWeight: 800 }}>2. Angle iklan anda</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.9rem', marginBottom: '0.9rem' }}>
        <div>
          {label('Nama SP (untuk anda sahaja)')}
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="cth: Sabun — Anak Meracau Malam" style={inputStyle} maxLength={100} />
        </div>
        <div>
          {label('Link SP')}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.82rem', color: C.tm, whiteSpace: 'nowrap' }}>/s/</span>
            <input value={effSlug} onChange={e => { setSlugTouched(true); setSlug(slugify(e.target.value)); }} placeholder="sabun-anak-meracau" style={inputStyle} maxLength={50} />
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gap: '0.9rem' }}>
        <div>
          {label('Target audience *')}
          <input value={angle.audience} onChange={e => set('audience', e.target.value)} placeholder="cth: Ibu 30-50 tahun yang anak kecilnya kerap meracau & menangis waktu malam" style={inputStyle} maxLength={300} />
        </div>
        <div>
          {label('Masalah utama yang nak ditonjolkan *')}
          <textarea value={angle.problem} onChange={e => set('problem', e.target.value)} rows={3} placeholder="cth: Anak meracau tengah malam, menangis tunjuk sudut bilik, susah tidur — ibu letih & risau" style={{ ...inputStyle, resize: 'vertical' }} maxLength={600} />
        </div>
        <div>
          {label('Jenis hook')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {HOOK_TYPES.map(h => (
              <button key={h.key} type="button" title={h.hint} onClick={() => set('hook', h.key)} style={chip(angle.hook === h.key, C, ff)}>{h.label}</button>
            ))}
          </div>
          <div style={{ fontSize: '0.72rem', color: C.tm, marginTop: '0.35rem' }}>Formula: {HOOK_TYPES.find(h => h.key === angle.hook)?.hint}</div>
        </div>
        <div>
          {label('Nada')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {TONES.map(t => <button key={t.key} type="button" onClick={() => set('tone', t.key)} style={chip(angle.tone === t.key, C, ff)}>{t.label}</button>)}
          </div>
        </div>
        <div>
          {label('Cerita / maklumat tambahan (pilihan)')}
          <textarea value={angle.story} onChange={e => set('story', e.target.value)} rows={3} placeholder="cth: Ramai pelanggan saya mak-mak muda, iklan saya tunjuk video anak meracau. Nak tekankan mandian sebelum maghrib." style={{ ...inputStyle, resize: 'vertical' }} maxLength={1200} />
        </div>
      </div>

      {err && <div style={{ marginTop: '1rem', color: '#EF4444', fontSize: '0.83rem', fontWeight: 600 }}>⚠️ {err}</div>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '1.25rem', alignItems: 'center' }}>
        <button disabled={busy || !aiReady} onClick={() => submit(true)} title={aiWhy} style={{ padding: '0.7rem 1.2rem', borderRadius: '8px', border: 'none', cursor: busy || !aiReady ? 'not-allowed' : 'pointer', opacity: busy || !aiReady ? 0.55 : 1, fontWeight: 800, fontSize: '0.88rem', fontFamily: ff, background: 'linear-gradient(135deg, #10B981, #059669)', color: '#fff' }}>
          {busy ? 'Membina...' : '✨ Bina & Jana dengan AI'}
        </button>
        <button disabled={busy} onClick={() => submit(false)} style={{ padding: '0.7rem 1.1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', fontFamily: ff, border: C.border, background: 'transparent', color: C.ts }}>
          Bina manual (template FSP)
        </button>
        <button disabled={busy} onClick={onCancel} style={{ padding: '0.7rem 0.9rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', fontFamily: ff, border: 'none', background: 'transparent', color: C.tm }}>Batal</button>
        {aiWhy && <span style={{ fontSize: '0.75rem', color: '#F59E0B' }}>{aiWhy}</span>}
      </div>
    </div>
  );
}

const chip = (on, C, ff) => ({
  padding: '0.4rem 0.8rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: ff,
  border: on ? '1px solid #10B981' : C.border, background: on ? 'rgba(16,185,129,0.12)' : 'transparent', color: on ? '#10B981' : C.ts,
});

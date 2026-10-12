'use client';

import { useState, useEffect, useRef, useCallback, use, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SP_PRODUCTS, HQ_SLOT_KEYS } from '@/lib/sp-generator/products';
import { SLOTS, ANGLE_SECTIONS, ANGLE_KEYS, REQUIRED_SLOTS, HOOK_TYPES, TONES, slugify } from '@/lib/sp-generator/schema';
import { ANGLE_COMPONENTS } from '@/components/salespage/generated/AngleSections';

// Editor SP Generator — klik teks pada preview untuk edit, tukar gambar, tulis semula section dengan AI.
// Draf disimpan automatik; SP awam hanya berubah bila tekan Publish.

const ff = 'var(--font-inter), -apple-system, sans-serif';

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

// Mampatkan gambar (telefon 3–8MB → ~300KB) sebelum upload
async function compressImage(file, maxSide = 1600, quality = 0.82) {
  if (!/^image\/(jpeg|png|webp|heic|heif)/i.test(file.type) && !/\.(jpe?g|png|webp|heic)$/i.test(file.name)) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', quality));
    return blob ? new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : file;
  } catch (_) {
    return file;
  }
}

// set nilai pada path "a.b.0.c" (immutable)
function setIn(obj, path, value) {
  const [k, ...rest] = path.split('.');
  const key = /^\d+$/.test(k) ? Number(k) : k;
  const base = Array.isArray(obj) ? [...obj] : { ...(obj || {}) };
  base[key] = rest.length ? setIn(base[key], rest.join('.'), value) : value;
  return base;
}
const getIn = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[/^\d+$/.test(k) ? Number(k) : k]), obj);

const api = async (url, opts = {}) => {
  const res = await fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) } });
  const json = await res.json().catch(() => ({ success: false, error: `HTTP ${res.status}` }));
  if (!json.success) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
};

// Jalankan tugasan dengan had serentak
async function pool(items, limit, fn) {
  let i = 0;
  const run = async () => { while (i < items.length) { const it = items[i++]; await fn(it); } };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
}

const REWRITE_CHIPS = ['Lebih emosi & menyentuh hati', 'Lebih pendek & padat', 'Lebih mendesak', 'Lebih santai', 'Tukar ayat lain'];

export default function SpEditorPage({ params }) {
  const { id } = use(params);
  return <Suspense fallback={null}><SpEditor id={id} /></Suspense>;
}

function SpEditor({ id }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lm = useLightMode();
  const C = {
    card: lm ? '#FFFFFF' : '#10131A', sub: lm ? '#F8FAFC' : '#090A0F',
    border: lm ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)',
    tp: lm ? '#0F172A' : '#F9FAFB', ts: lm ? '#475569' : '#9CA3AF', tm: lm ? '#64748B' : '#6B7280',
    input: lm ? '#FFFFFF' : '#0B0D13',
  };

  const [sp, setSp] = useState(null);           // rekod dari server (terakhir disimpan)
  const [content, setContent] = useState(null); // draf semasa (diedit)
  const [angle, setAngle] = useState(null);
  const [quota, setQuota] = useState(null);
  const [error, setError] = useState('');
  const [saveState, setSaveState] = useState('saved');   // saved | dirty | saving | error
  const [busy, setBusy] = useState('');
  const [view, setView] = useState('mobile');
  const [gen, setGen] = useState(null);         // { brief: status, sections: {key: status} }
  const [rewriteOpen, setRewriteOpen] = useState(null);
  const [rewriteText, setRewriteText] = useState('');
  const [rewriting, setRewriting] = useState(null);
  const [showAngle, setShowAngle] = useState(false);
  const [picker, setPicker] = useState(null);   // path gambar yang sedang ditukar
  const [undo, setUndo] = useState([]);
  const autoGenDone = useRef(false);
  const contentRef = useRef(null);
  contentRef.current = content;

  // ── Muat SP ──
  const load = useCallback(async () => {
    try {
      const json = await api(`/api/sp-generator/${id}`);
      setSp(json.data); setContent(json.data.content); setAngle(json.data.angle || {}); setQuota(json.quota);
    } catch (e) { setError(e.message); }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const refreshQuota = async () => {
    try { const j = await api(`/api/sp-generator/${id}`); setQuota(j.quota); } catch (_) {}
  };

  // ── Simpan automatik (debounce) ──
  const saveTimer = useRef(null);
  const saveNow = useCallback(async () => {
    clearTimeout(saveTimer.current);
    const c = contentRef.current;
    if (!c) return;
    setSaveState('saving');
    try {
      const j = await api(`/api/sp-generator/${id}`, { method: 'PATCH', body: JSON.stringify({ content: c }) });
      setSp(j.data);
      setSaveState(s => (contentRef.current === c ? 'saved' : 'dirty'));
      return j.data;
    } catch (e) { setSaveState('error'); throw e; }
  }, [id]);

  const change = useCallback((updater, { snapshot = true } = {}) => {
    if (snapshot && contentRef.current) { const snap = contentRef.current; setUndo(u => [...u.slice(-29), snap]); }
    setContent(prev => (typeof updater === 'function' ? updater(prev) : updater));
    setSaveState('dirty');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { saveNow().catch(() => {}); }, 1200);
  }, [saveNow]);

  const doUndo = () => {
    if (!undo.length) return;
    const prev = undo[undo.length - 1];
    setUndo(u => u.slice(0, -1));
    change(prev, { snapshot: false });
  };

  // Amaran tutup tab sebelum simpan
  useEffect(() => {
    const h = e => { if (saveState === 'dirty' || saveState === 'saving') { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [saveState]);

  // ── Kawalan edit untuk section (dihantar ke AngleSections) ──
  const edit = {
    set: (path, value) => change(prev => setIn(prev, path, value)),
    addItem: (path, item) => change(prev => setIn(prev, path, [...(getIn(prev, path) || []), item])),
    removeItem: (path, i) => change(prev => setIn(prev, path, (getIn(prev, path) || []).filter((_, j) => j !== i))),
    pickImage: path => setPicker(path),
  };

  const toggleHidden = key => change(prev => {
    const h = new Set(prev.hidden || []);
    h.has(key) ? h.delete(key) : h.add(key);
    return { ...prev, hidden: [...h] };
  });

  // ── AI: jana penuh (brief → semua section selari) ──
  const generateAll = useCallback(async ({ confirmFirst = true } = {}) => {
    if (confirmFirst && !confirm('Jana semula SEMUA teks dengan AI? Teks semasa akan diganti (gambar kekal). Guna 1 kuota jana penuh.')) return;
    setError('');
    try {
      // simpan angle terkini dulu — AI baca angle dari server
      await api(`/api/sp-generator/${id}`, { method: 'PATCH', body: JSON.stringify({ angle }) });
      setGen({ brief: 'run', sections: Object.fromEntries(ANGLE_KEYS.map(k => [k, 'wait'])) });
      const b = await api(`/api/sp-generator/${id}/ai`, { method: 'POST', body: JSON.stringify({ step: 'brief' }) });
      const brief = b.data;
      change(prev => ({ ...prev, brief, meta: { title: brief.meta_title || prev.meta?.title || '', description: brief.meta_description || '' } }));
      setGen(g => ({ ...g, brief: 'done' }));

      await pool(ANGLE_KEYS, 3, async key => {
        setGen(g => ({ ...g, sections: { ...g.sections, [key]: 'run' } }));
        try {
          const r = await api(`/api/sp-generator/${id}/ai`, { method: 'POST', body: JSON.stringify({ step: 'section', section: key, brief }) });
          change(prev => ({ ...prev, [key]: { ...r.data, ...(ANGLE_SECTIONS[key].image ? { image: prev[key]?.image ?? null } : {}) } }), { snapshot: false });
          setGen(g => ({ ...g, sections: { ...g.sections, [key]: 'done' } }));
        } catch (e) {
          setGen(g => ({ ...g, sections: { ...g.sections, [key]: 'fail' }, err: e.message }));
        }
      });
      await saveNow().catch(() => {});
    } catch (e) {
      setError(e.message);
      setGen(g => (g ? { ...g, brief: g.brief === 'run' ? 'fail' : g.brief } : g));
    } finally {
      refreshQuota();
    }
  }, [id, angle, change, saveNow]);

  // Jana semula section yang gagal sahaja
  const retrySection = async key => {
    const brief = contentRef.current?.brief;
    if (!brief) return generateAll();
    setGen(g => ({ ...g, sections: { ...g.sections, [key]: 'run' } }));
    try {
      const r = await api(`/api/sp-generator/${id}/ai`, { method: 'POST', body: JSON.stringify({ step: 'section', section: key, brief }) });
      change(prev => ({ ...prev, [key]: { ...r.data, ...(ANGLE_SECTIONS[key].image ? { image: prev[key]?.image ?? null } : {}) } }));
      setGen(g => ({ ...g, sections: { ...g.sections, [key]: 'done' } }));
    } catch (e) {
      setGen(g => ({ ...g, sections: { ...g.sections, [key]: 'fail' }, err: e.message }));
    } finally { refreshQuota(); }
  };

  // Auto-jana sekali bila datang dari "Bina & Jana dengan AI"
  useEffect(() => {
    if (!sp || autoGenDone.current || searchParams.get('jana') !== '1') return;
    autoGenDone.current = true;
    router.replace(`/dashboard/sp-generator/${id}`);
    generateAll({ confirmFirst: false });
  }, [sp, searchParams, generateAll, router, id]);

  // ── AI: tulis semula satu section ──
  const rewrite = async (key, instruction) => {
    const brief = content?.brief;
    if (!brief) return alert('Jana dengan AI dahulu (butang ✨ Jana semula semua) sebelum guna tulis semula.');
    setRewriting(key); setError('');
    try {
      const r = await api(`/api/sp-generator/${id}/ai`, { method: 'POST', body: JSON.stringify({ step: 'rewrite', section: key, brief, current: content[key], instruction }) });
      change(prev => ({ ...prev, [key]: { ...r.data, ...(ANGLE_SECTIONS[key].image ? { image: prev[key]?.image ?? null } : {}) } }));
      setRewriteOpen(null); setRewriteText('');
    } catch (e) { setError(e.message); }
    finally { setRewriting(null); refreshQuota(); }
  };

  // ── Tajuk / link ──
  const saveMeta = async patch => {
    try {
      const j = await api(`/api/sp-generator/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
      setSp(j.data);
    } catch (e) { alert(e.message); load(); }
  };

  // ── Publish / hentikan / buang perubahan ──
  const action = async act => {
    if (act === 'revert' && !confirm('Buang semua perubahan draf & kembali ke versi yang sedang live?')) return;
    if (act === 'unpublish' && !confirm('Hentikan SP ini? Link akan tunjuk "tidak dijumpai" sehingga dipublish semula.')) return;
    setBusy(act);
    try {
      if (act === 'publish') await saveNow();
      const j = await api(`/api/sp-generator/${id}`, { method: 'POST', body: JSON.stringify({ action: act }) });
      setSp(j.data);
      if (act === 'revert') { setContent(j.data.content); setUndo([]); setSaveState('saved'); }
    } catch (e) { alert(e.message); }
    finally { setBusy(''); }
  };

  const preview = async () => {
    try { await saveNow(); } catch (_) {}
    window.open(`/s/${sp.slug}?preview=1`, '_blank');
  };

  if (error && !sp) return <div style={{ padding: '1rem', color: '#EF4444', fontFamily: ff }}>⚠️ {error}</div>;
  if (!sp || !content) return <div style={{ padding: '3rem', textAlign: 'center', color: C.tm, fontFamily: ff }}>Memuatkan editor...</div>;

  const product = SP_PRODUCTS[sp.product_key];
  const theme = { accent: product.accent, accentSoft: product.accentSoft, accentBorder: product.accentBorder };
  const hqKeys = new Set(HQ_SLOT_KEYS[sp.product_key] || []);
  const hidden = new Set(content.hidden || []);
  const live = sp.status === 'published';
  const changedSinceLive = live && JSON.stringify(sp.content) !== JSON.stringify(sp.published_content);
  const generating = gen && (gen.brief === 'run' || Object.values(gen.sections).some(s => s === 'run' || s === 'wait'));
  const aiOk = quota?.ai_enabled;

  const SAVE_LABEL = { saved: '✓ Draf disimpan', dirty: '● Belum disimpan', saving: 'Menyimpan...', error: '⚠️ Gagal simpan' };
  const inputStyle = { width: '100%', padding: '0.55rem 0.7rem', borderRadius: '8px', fontSize: '0.85rem', fontFamily: ff, border: C.border, background: C.input, color: C.tp, boxSizing: 'border-box' };
  const btn = (primary, color) => ({
    padding: '0.5rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, fontFamily: ff, cursor: 'pointer', whiteSpace: 'nowrap',
    border: primary ? 'none' : C.border, background: primary ? (color || '#10B981') : 'transparent', color: primary ? '#fff' : C.ts,
  });

  return (
    <div style={{ fontFamily: ff, color: C.tp }}>
      {/* ── Bar atas ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: C.card, border: C.border, borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0, flex: '1 1 280px' }}>
          <button onClick={() => router.push('/dashboard/sp-generator')} style={{ ...btn(false), padding: '0.45rem 0.6rem' }}>←</button>
          <div style={{ minWidth: 0, flex: 1 }}>
            <input defaultValue={sp.title} key={sp.title} onBlur={e => e.target.value.trim() !== sp.title && saveMeta({ title: e.target.value })}
              style={{ ...inputStyle, padding: '0.2rem 0.3rem', border: '1px solid transparent', background: 'transparent', fontWeight: 800, fontSize: '0.98rem' }} />
            <div style={{ fontSize: '0.72rem', color: C.tm, display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingLeft: '0.3rem' }}>
              <span>{product.emoji} {product.short}</span>
              <span style={{ fontWeight: 700, color: live ? '#10B981' : sp.status === 'unpublished' ? '#EF4444' : '#F59E0B' }}>
                {live ? (changedSinceLive ? '● Live · ada perubahan belum live' : '● Live') : sp.status === 'unpublished' ? '○ Dihentikan' : '✏️ Draf (belum live)'}
              </span>
              <span style={{ color: saveState === 'error' ? '#EF4444' : C.tm }}>{SAVE_LABEL[saveState]}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          <button onClick={doUndo} disabled={!undo.length} style={{ ...btn(false), opacity: undo.length ? 1 : 0.45 }} title="Undo">↶</button>
          <button onClick={preview} style={btn(false)}>👁 Preview penuh</button>
          {changedSinceLive && <button onClick={() => action('revert')} disabled={!!busy} style={btn(false)}>Buang perubahan</button>}
          {live && <button onClick={() => action('unpublish')} disabled={!!busy} style={{ ...btn(false), color: '#EF4444' }}>Hentikan</button>}
          <button onClick={() => action('publish')} disabled={!!busy || generating} style={{ ...btn(true), opacity: busy || generating ? 0.6 : 1 }}>
            {busy === 'publish' ? 'Publishing...' : live ? (changedSinceLive ? '🚀 Kemaskini Live' : '✓ Live') : '🚀 Publish'}
          </button>
        </div>
      </div>

      {error && <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: '0.83rem', marginBottom: '1rem' }}>⚠️ {error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1rem' }}>
        {/* ── Panel link + AI ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div style={{ background: C.card, border: C.border, borderRadius: '10px', padding: '1rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: C.ts, marginBottom: '0.5rem' }}>🔗 Link SP</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.82rem', color: C.tm }}>/s/</span>
              <input defaultValue={sp.slug} key={sp.slug} onBlur={e => { const s = slugify(e.target.value); if (s !== sp.slug) saveMeta({ slug: s }); }} style={inputStyle} />
            </div>
            {live && (
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                <button onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/s/${sp.slug}`)} style={btn(false)}>Salin link</button>
                <button onClick={() => window.open(`/s/${sp.slug}`, '_blank')} style={btn(false)}>↗ Buka SP live</button>
              </div>
            )}
            <p style={{ fontSize: '0.72rem', color: C.tm, margin: '0.6rem 0 0', lineHeight: 1.5 }}>
              Order, pixel &amp; no. WhatsApp automatik ikut akaun pemilik SP. Boleh tambah UTM pada link iklan seperti biasa.
            </p>
          </div>

          <div style={{ background: C.card, border: C.border, borderRadius: '10px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: C.ts }}>✨ AI · Angle</div>
              {quota && aiOk && <span style={{ fontSize: '0.7rem', color: C.tm }}>
                {quota.unlimited ? 'Kuota: tanpa had' : `Jana penuh ${quota.full.used}/${quota.full.max} · AI ${quota.calls.used}/${quota.calls.max}`}
              </span>}
            </div>
            <div style={{ fontSize: '0.8rem', color: C.tp, margin: '0.5rem 0', lineHeight: 1.5 }}>
              <strong>{angle?.audience || '— audience belum diisi —'}</strong>
              <div style={{ color: C.ts, fontSize: '0.76rem' }}>{angle?.problem}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button onClick={() => setShowAngle(s => !s)} style={btn(false)}>{showAngle ? 'Tutup' : '✏️ Ubah angle'}</button>
              <button onClick={() => generateAll()} disabled={!aiOk || generating} title={aiOk ? '' : 'AI belum diaktifkan'}
                style={{ ...btn(true, '#7C3AED'), opacity: !aiOk || generating ? 0.5 : 1, cursor: !aiOk || generating ? 'not-allowed' : 'pointer' }}>
                {generating ? 'Menjana...' : '✨ Jana semula semua'}
              </button>
            </div>
            {!aiOk && <div style={{ fontSize: '0.72rem', color: '#F59E0B', marginTop: '0.5rem' }}>AI belum diaktifkan — edit teks terus pada preview di bawah.</div>}
          </div>
        </div>

        {showAngle && (
          <AnglePanel angle={angle} setAngle={setAngle} C={C} inputStyle={inputStyle}
            onSave={async () => { await saveMeta({ angle }); setShowAngle(false); }} />
        )}

        {gen && (
          <div style={{ background: C.card, border: C.border, borderRadius: '10px', padding: '0.85rem 1rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: C.ts, marginBottom: '0.5rem' }}>
              {generating ? '✨ AI sedang menulis SP anda...' : '✓ Selesai — semak & edit teks di bawah sebelum publish'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              <GenChip label="Strategi angle" status={gen.brief} C={C} />
              {ANGLE_KEYS.map(k => <GenChip key={k} label={ANGLE_SECTIONS[k].label} status={gen.sections[k]} C={C} onRetry={() => retrySection(k)} />)}
            </div>
            {gen.err && Object.values(gen.sections).includes('fail') && <div style={{ fontSize: '0.74rem', color: '#EF4444', marginTop: '0.5rem' }}>{gen.err} — klik ↻ pada section yang gagal.</div>}
          </div>
        )}

        {/* ── Kanvas (preview boleh edit) ── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.76rem', color: C.tm }}>💡 Klik mana-mana teks untuk edit. Guna <code>**teks**</code> untuk warna sorotan.</div>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              {[['mobile', '📱 Mobile'], ['desktop', '🖥 Desktop']].map(([k, l]) => (
                <button key={k} onClick={() => setView(k)} style={{ ...btn(view === k), padding: '0.35rem 0.7rem' }}>{l}</button>
              ))}
            </div>
          </div>

          <div style={{ maxWidth: view === 'mobile' ? '430px' : '100%', margin: '0 auto', background: '#FFFFFF', borderRadius: '14px', overflow: 'hidden', border: C.border, boxShadow: '0 10px 30px rgba(0,0,0,0.18)' }}>
            {SLOTS.map(slot => {
              const isHidden = hidden.has(slot.key);
              const canHide = !REQUIRED_SLOTS.includes(slot.key);
              if (slot.type === 'hq') {
                if (!hqKeys.has(slot.key)) return null;
                return (
                  <div key={slot.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 0.9rem', background: isHidden ? '#F1F5F9' : '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.78rem', fontFamily: ff, opacity: isHidden ? 0.55 : 1 }}>
                    <span>🔒 <strong style={{ color: '#334155' }}>{slot.fsp} {slot.label}</strong> — dari SP HQ{isHidden ? ' (disembunyikan)' : ''}</span>
                    {canHide && <button onClick={() => toggleHidden(slot.key)} style={miniBtn}>{isHidden ? 'Papar' : 'Sembunyi'}</button>}
                  </div>
                );
              }
              const Comp = ANGLE_COMPONENTS[slot.key];
              const def = ANGLE_SECTIONS[slot.key];
              const status = gen?.sections?.[slot.key];
              return (
                <div key={slot.key} style={{ position: 'relative', borderBottom: '2px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.75rem', background: '#ECFDF5', borderBottom: '1px solid #A7F3D0', fontFamily: ff }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#047857' }}>
                      ✏️ {def.fsp} {def.label}{isHidden ? ' (disembunyikan)' : ''}
                      {(status === 'run' || status === 'wait') && <span style={{ color: '#7C3AED' }}> · AI menulis...</span>}
                    </span>
                    <span style={{ display: 'flex', gap: '0.3rem' }}>
                      {aiOk && !isHidden && <button onClick={() => { setRewriteOpen(o => (o === slot.key ? null : slot.key)); setRewriteText(''); }} style={{ ...miniBtn, color: '#7C3AED', borderColor: '#DDD6FE' }}>✨ Tulis semula</button>}
                      {canHide && <button onClick={() => toggleHidden(slot.key)} style={miniBtn}>{isHidden ? 'Papar' : 'Sembunyi'}</button>}
                    </span>
                  </div>
                  {rewriteOpen === slot.key && (
                    <div style={{ padding: '0.75rem', background: '#F5F3FF', borderBottom: '1px solid #DDD6FE', fontFamily: ff }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
                        {REWRITE_CHIPS.map(t => <button key={t} onClick={() => setRewriteText(t)} style={{ ...miniBtn, background: rewriteText === t ? '#EDE9FE' : '#fff', color: '#5B21B6', borderColor: '#DDD6FE' }}>{t}</button>)}
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <input value={rewriteText} onChange={e => setRewriteText(e.target.value)} placeholder="Arahan anda, cth: fokus pada anak meracau waktu maghrib" maxLength={400}
                          onKeyDown={e => e.key === 'Enter' && !rewriting && rewrite(slot.key, rewriteText)}
                          style={{ flex: 1, padding: '0.5rem 0.65rem', borderRadius: '8px', border: '1px solid #DDD6FE', fontSize: '0.82rem', fontFamily: ff, color: '#0F172A', background: '#fff' }} />
                        <button onClick={() => rewrite(slot.key, rewriteText)} disabled={!!rewriting}
                          style={{ padding: '0.5rem 0.9rem', borderRadius: '8px', border: 'none', background: '#7C3AED', color: '#fff', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', fontFamily: ff, opacity: rewriting ? 0.6 : 1 }}>
                          {rewriting === slot.key ? 'Menulis...' : 'Tulis'}
                        </button>
                      </div>
                    </div>
                  )}
                  {!isHidden && (
                    <div style={{ opacity: status === 'run' || status === 'wait' || rewriting === slot.key ? 0.45 : 1, transition: 'opacity 0.2s' }}>
                      <Comp data={content[slot.key]} edit={edit} theme={theme} product={product} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {picker && (
        <ImagePicker C={C} product={product} current={getIn(content, picker)}
          onClose={() => setPicker(null)}
          onPick={url => { edit.set(picker, url); setPicker(null); }} />
      )}
    </div>
  );
}

const miniBtn = { padding: '0.25rem 0.55rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: ff };

function GenChip({ label, status, C, onRetry }) {
  const map = { wait: ['⏳', C.tm], run: ['✍️', '#7C3AED'], done: ['✓', '#10B981'], fail: ['✕', '#EF4444'] };
  const [icon, color] = map[status] || map.wait;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', fontWeight: 700, color, border: `1px solid ${color}55`, padding: '0.25rem 0.6rem', borderRadius: '999px' }}>
      {icon} {label}
      {status === 'fail' && onRetry && <button onClick={onRetry} style={{ border: 'none', background: 'none', color, cursor: 'pointer', fontWeight: 800, padding: 0 }}>↻</button>}
    </span>
  );
}

function AnglePanel({ angle, setAngle, C, inputStyle, onSave }) {
  const set = (k, v) => setAngle(a => ({ ...a, [k]: v }));
  const label = t => <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: C.ts, margin: '0 0 0.3rem' }}>{t}</label>;
  const chip = on => ({ padding: '0.35rem 0.75rem', borderRadius: '999px', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer', fontFamily: ff, border: on ? '1px solid #10B981' : C.border, background: on ? 'rgba(16,185,129,0.12)' : 'transparent', color: on ? '#10B981' : C.ts });
  return (
    <div style={{ background: C.card, border: C.border, borderRadius: '10px', padding: '1rem', display: 'grid', gap: '0.8rem' }}>
      <div>{label('Target audience')}<input value={angle.audience || ''} onChange={e => set('audience', e.target.value)} style={inputStyle} maxLength={300} /></div>
      <div>{label('Masalah utama')}<textarea value={angle.problem || ''} onChange={e => set('problem', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} maxLength={600} /></div>
      <div>{label('Jenis hook')}<div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>{HOOK_TYPES.map(h => <button key={h.key} title={h.hint} onClick={() => set('hook', h.key)} style={chip(angle.hook === h.key)}>{h.label}</button>)}</div></div>
      <div>{label('Nada')}<div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>{TONES.map(t => <button key={t.key} onClick={() => set('tone', t.key)} style={chip(angle.tone === t.key)}>{t.label}</button>)}</div></div>
      <div>{label('Cerita / maklumat tambahan')}<textarea value={angle.story || ''} onChange={e => set('story', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} maxLength={1200} /></div>
      <div style={{ fontSize: '0.74rem', color: C.tm }}>Simpan angle, kemudian tekan <strong>✨ Jana semula semua</strong> atau <strong>✨ Tulis semula</strong> pada section tertentu.</div>
      <div><button onClick={onSave} style={{ padding: '0.5rem 0.9rem', borderRadius: '8px', border: 'none', background: '#10B981', color: '#fff', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', fontFamily: ff }}>Simpan angle</button></div>
    </div>
  );
}

function ImagePicker({ C, product, current, onClose, onPick }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef(null);

  const upload = async file => {
    if (!file) return;
    setUploading(true); setErr('');
    try {
      const fd = new FormData();
      fd.append('file', await compressImage(file));
      const res = await fetch('/api/sp-generator/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      onPick(json.url);
    } catch (e) { setErr(e.message); setUploading(false); }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.card, border: C.border, borderRadius: '12px', padding: '1.25rem', width: '100%', maxWidth: '560px', maxHeight: '85vh', overflowY: 'auto', fontFamily: ff, color: C.tp }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>📷 Tukar gambar</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', color: C.ts, fontSize: '1.1rem', cursor: 'pointer' }}>✕</button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => upload(e.target.files?.[0])} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          style={{ width: '100%', padding: '1.25rem', borderRadius: '10px', border: '2px dashed #10B981', background: 'rgba(16,185,129,0.06)', color: '#10B981', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', fontFamily: ff }}>
          {uploading ? 'Memuat naik...' : '⬆️ Upload gambar sendiri'}
        </button>
        {err && <div style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>⚠️ {err}</div>}
        {product.gallery.length > 0 && (
          <>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: C.ts, margin: '1.25rem 0 0.6rem' }}>Atau pilih gambar produk HQ</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem' }}>
              {product.gallery.map(src => (
                <button key={src} onClick={() => onPick(src)} style={{ padding: 0, borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: current === src ? '3px solid #10B981' : C.border, background: 'none' }}>
                  <img src={src} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

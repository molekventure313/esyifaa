'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Pengisian Stok — staff upload gambar stok; pemilik buat bacaan ruqyah jarak jauh & tanda selesai.

const TABS = [
  { key: 'all',              label: 'Semua' },
  { key: 'sabun-garam',      label: '🧼 Sabun Garam' },
  { key: 'garam-pengasihan', label: '🧂 Garam Pengasihan' },
  { key: 'kasturi-kijang',   label: '🌿 Kasturi Kijang' },
  { key: 'pengisian-esyifa', label: '✨ Pengisian E-Syifa' },
  { key: 'lain',             label: '📦 Lain-lain' },
];
const LABEL = Object.fromEntries(TABS.map(t => [t.key, t.label]));

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
    return file;   // format tak disokong browser — hantar asal
  }
}

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

const fmtTime = d => new Date(d).toLocaleString('ms-MY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function PengisianStokPage() {
  const lm = useLightMode();
  const cardBg        = lm ? '#FFFFFF' : '#10131A';
  const subCardBg     = lm ? '#F8FAFC' : '#090A0F';
  const cardBorder    = lm ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)';
  const textPrimary   = lm ? '#0F172A' : '#F9FAFB';
  const textSecondary = lm ? '#475569' : '#9CA3AF';
  const textMuted     = lm ? '#64748B' : '#6B7280';
  const ff            = 'var(--font-inter), -apple-system, sans-serif';

  const [tab, setTab]         = useState('all');
  const [status, setStatus]   = useState('pending');
  const [data, setData]       = useState(null);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId]   = useState(null);
  const [viewer, setViewer]   = useState(null);   // url gambar besar

  // Borang upload
  const [upProduct, setUpProduct] = useState('sabun-garam');
  const [upQty, setUpQty]         = useState('');
  const [upNotes, setUpNotes]     = useState('');
  const [files, setFiles]         = useState([]);
  const [uploading, setUploading] = useState(null);   // '2/5'
  const [upMsg, setUpMsg]         = useState(null);
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const json = await (await fetch(`/api/stock-filling?product=${tab}&status=${status}`)).json();
      if (!json.success) throw new Error(json.error);
      setData(json); setError('');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [tab, status]);
  useEffect(() => { setLoading(true); load(); }, [load]);

  const isOwner = data?.role === 'super_admin';

  const upload = async e => {
    e.preventDefault();
    if (!files.length) return setUpMsg({ ok: false, text: 'Pilih sekurang-kurangnya satu gambar.' });
    setUpMsg(null);
    let ok = 0;
    const errors = [];
    for (let i = 0; i < files.length; i++) {
      setUploading(`${i + 1}/${files.length}`);
      try {
        const fd = new FormData();
        fd.append('file', await compressImage(files[i]));
        fd.append('product', upProduct);
        if (upQty) fd.append('qty', upQty);
        if (upNotes) fd.append('notes', upNotes);
        const json = await (await fetch('/api/stock-filling', { method: 'POST', body: fd })).json();
        if (!json.success) throw new Error(json.error);
        ok++;
      } catch (err) { errors.push(`${files[i].name}: ${err.message}`); }
    }
    setUploading(null);
    setUpMsg(errors.length ? { ok: false, text: `${ok} berjaya, ${errors.length} gagal — ${errors.join(' · ')}` } : { ok: true, text: `${ok} gambar dihantar untuk pengisian.` });
    if (ok) {
      setFiles([]); setUpQty(''); setUpNotes('');
      if (fileRef.current) fileRef.current.value = '';
      load();
    }
  };

  const setDone = async (row, done) => {
    setBusyId(row.id);
    try {
      const json = await (await fetch('/api/stock-filling', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: row.id, status: done ? 'done' : 'pending' }),
      })).json();
      if (!json.success) throw new Error(json.error);
      await load();
    } catch (e) { alert(e.message); }
    finally { setBusyId(null); }
  };

  const remove = async row => {
    if (!confirm('Padam gambar ini?')) return;
    setBusyId(row.id);
    try {
      const json = await (await fetch(`/api/stock-filling?id=${row.id}`, { method: 'DELETE' })).json();
      if (!json.success) throw new Error(json.error);
      await load();
    } catch (e) { alert(e.message); }
    finally { setBusyId(null); }
  };

  const input = {
    padding: '0.55rem 0.7rem', borderRadius: '6px', fontSize: '0.85rem', fontFamily: ff, minWidth: 0,
    border: lm ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.15)', background: lm ? '#fff' : '#0B0D13', color: textPrimary,
  };
  const btn = (bg, color = '#fff') => ({ padding: '0.5rem 0.9rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', fontFamily: ff, background: bg, color });
  const pending = data?.pending || {};

  return (
    <div style={{ fontFamily: ff, color: textPrimary, padding: '0.25rem 0' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderRadius: '8px', marginBottom: '1.25rem', background: cardBg, border: cardBorder }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>📸 Pengisian Stok</h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: textSecondary }}>
          Upload gambar stok untuk dibuat bacaan ruqyah jarak jauh (pengisian E-Syifa). Bila bacaan selesai, gambar ditanda ✅ Selesai.
        </p>
      </div>

      {/* Upload */}
      <form onSubmit={upload} style={{ marginBottom: '1.25rem', padding: '1.1rem', borderRadius: '10px', background: cardBg, border: cardBorder, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem', alignItems: 'end' }}>
        <label style={{ display: 'grid', gap: '0.3rem', fontSize: '0.75rem', color: textSecondary, fontWeight: 600 }}>
          Produk
          <select style={input} value={upProduct} onChange={e => setUpProduct(e.target.value)}>
            {TABS.filter(t => t.key !== 'all').map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </label>
        <label style={{ display: 'grid', gap: '0.3rem', fontSize: '0.75rem', color: textSecondary, fontWeight: 600 }}>
          Bilangan unit (pilihan)
          <input style={input} type="number" min="1" inputMode="numeric" value={upQty} onChange={e => setUpQty(e.target.value)} placeholder="cth: 50" />
        </label>
        <label style={{ display: 'grid', gap: '0.3rem', fontSize: '0.75rem', color: textSecondary, fontWeight: 600, gridColumn: 'span 2' }}>
          Nota (pilihan)
          <input style={input} value={upNotes} onChange={e => setUpNotes(e.target.value)} placeholder="cth: stok baru sampai, kotak A" maxLength={300} />
        </label>
        <label style={{ display: 'grid', gap: '0.3rem', fontSize: '0.75rem', color: textSecondary, fontWeight: 600, gridColumn: 'span 2' }}>
          Gambar (boleh pilih banyak)
          <input ref={fileRef} style={{ ...input, padding: '0.45rem' }} type="file" accept="image/*" multiple onChange={e => setFiles([...e.target.files])} />
        </label>
        <button disabled={!!uploading} style={{ ...btn('#10B981'), padding: '0.65rem 1rem', opacity: uploading ? 0.6 : 1 }}>
          {uploading ? `Menghantar ${uploading}...` : `📤 Hantar ${files.length ? `${files.length} gambar` : 'gambar'}`}
        </button>
        {upMsg && <div style={{ gridColumn: '1 / -1', fontSize: '0.82rem', color: upMsg.ok ? '#10B981' : '#EF4444' }}>{upMsg.ok ? '✅' : '⚠️'} {upMsg.text}</div>}
      </form>

      {/* Tab produk + status */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
        {TABS.map(t => {
          const n = t.key === 'all' ? data?.pending_total : pending[t.key];
          const on = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '0.45rem 0.85rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: ff,
              border: on ? '1px solid #10B981' : cardBorder, background: on ? 'rgba(16,185,129,0.12)' : 'transparent', color: on ? '#10B981' : textSecondary,
            }}>
              {t.label}{n ? <span style={{ marginLeft: '0.35rem', background: '#F59E0B', color: '#111', borderRadius: '999px', padding: '0 0.4rem', fontSize: '0.7rem', fontWeight: 800 }}>{n}</span> : null}
            </button>
          );
        })}
        <div style={{ marginLeft: 'auto', display: 'flex', background: subCardBg, border: cardBorder, borderRadius: '8px', padding: '3px' }}>
          {[['pending', '⏳ Belum'], ['done', '✅ Selesai'], ['all', 'Semua']].map(([k, l]) => (
            <button key={k} onClick={() => setStatus(k)} style={{
              padding: '0.35rem 0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, fontFamily: ff,
              background: status === k ? (lm ? '#FFFFFF' : '#1F2937') : 'transparent', color: status === k ? textPrimary : textMuted,
            }}>{l}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: textMuted }}>Memuatkan...</div>
      ) : error ? (
        <div style={{ padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: '0.85rem' }}>⚠️ {error}</div>
      ) : !data.data.length ? (
        <div style={{ padding: '2.5rem', textAlign: 'center', color: textMuted, background: cardBg, border: cardBorder, borderRadius: '10px' }}>
          {status === 'pending' ? 'Tiada gambar menunggu pengisian. 🎉' : 'Tiada gambar.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.9rem' }}>
          {data.data.map(r => {
            const done = r.status === 'done';
            const canDelete = isOwner || (r.uploaded_by === data.me && !done);
            return (
              <div key={r.id} style={{ background: cardBg, border: done ? '1px solid rgba(16,185,129,0.4)' : cardBorder, borderRadius: '10px', overflow: 'hidden', opacity: busyId === r.id ? 0.55 : 1 }}>
                <button onClick={() => r.url && setViewer(r.url)} style={{ display: 'block', width: '100%', padding: 0, border: 'none', background: subCardBg, cursor: 'zoom-in', aspectRatio: '4 / 3' }}>
                  {r.url
                    ? <img src={r.url} alt={LABEL[r.product]} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    : <span style={{ color: textMuted, fontSize: '0.8rem' }}>Gambar tiada</span>}
                </button>
                <div style={{ padding: '0.75rem 0.85rem', display: 'grid', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{LABEL[r.product] || r.product}{r.qty ? ` · ${r.qty} unit` : ''}</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '999px', whiteSpace: 'nowrap', background: done ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.15)', color: done ? '#10B981' : '#F59E0B' }}>
                      {done ? '✅ Selesai' : '⏳ Belum'}
                    </span>
                  </div>
                  {r.notes && <div style={{ fontSize: '0.78rem', color: textSecondary }}>{r.notes}</div>}
                  <div style={{ fontSize: '0.7rem', color: textMuted }}>
                    📤 {r.uploaded_by_name || '—'} · {fmtTime(r.created_at)}
                    {done && r.done_at && <><br />✅ {r.done_by_name || '—'} · {fmtTime(r.done_at)}</>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                    {isOwner && (done
                      ? <button disabled={busyId === r.id} onClick={() => setDone(r, false)} style={btn(lm ? '#E2E8F0' : '#374151', textPrimary)}>↩ Tandakan Belum</button>
                      : <button disabled={busyId === r.id} onClick={() => setDone(r, true)} style={btn('#10B981')}>✅ Tandakan Selesai</button>)}
                    {canDelete && <button disabled={busyId === r.id} onClick={() => remove(r)} style={btn('transparent', '#EF4444')}>🗑</button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewer && (
        <div onClick={() => setViewer(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', cursor: 'zoom-out' }}>
          <img src={viewer} alt="Gambar stok" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '8px' }} />
        </div>
      )}
    </div>
  );
}

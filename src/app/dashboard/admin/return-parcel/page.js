'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Return Parcel — staff upload gambar waybill parcel yang dipulangkan (COD return).
// Selepas upload, AI baca waybill & padankan order: padanan pasti → terus ditanda return (stok dipulangkan,
// keluar dari sales/komisen); tak pasti → 'Perlu semakan' (pilih order, satu klik); tak dapat baca → snap semula.

const STATUS = {
  pending:   { label: '⏳ Belum diproses',     color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  processing:{ label: '🤖 Sedang dibaca...',   color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' },
  review:    { label: '🔎 Perlu semakan',      color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  processed: { label: '✅ Selesai',            color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  unmatched: { label: '⚠️ Tak dapat dipadan', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
};

// Mampatkan gambar (telefon 3–8MB → ~300KB) sebelum upload — tulisan waybill masih jelas pada 1800px
async function compressImage(file, maxSide = 1800, quality = 0.85) {
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
const fmtDate = d => new Date(d).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' });

export default function ReturnParcelPage() {
  const lm = useLightMode();
  const cardBg        = lm ? '#FFFFFF' : '#10131A';
  const subCardBg     = lm ? '#F8FAFC' : '#090A0F';
  const cardBorder    = lm ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)';
  const textPrimary   = lm ? '#0F172A' : '#F9FAFB';
  const textSecondary = lm ? '#475569' : '#9CA3AF';
  const textMuted     = lm ? '#64748B' : '#6B7280';
  const ff            = 'var(--font-inter), -apple-system, sans-serif';

  const [status, setStatus]   = useState('pending');
  const [data, setData]       = useState(null);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId]   = useState(null);
  const [viewer, setViewer]   = useState(null);   // url gambar besar

  // Borang upload
  const [notes, setNotes]         = useState('');
  const [files, setFiles]         = useState([]);
  const [uploading, setUploading] = useState(null);   // '2/5'
  const [upMsg, setUpMsg]         = useState(null);
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const json = await (await fetch(`/api/return-waybills?status=${status}`)).json();
      if (!json.success) throw new Error(json.error);
      setData(json); setError('');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [status]);
  useEffect(() => { setLoading(true); load(); }, [load]);

  const isOwner = data?.role === 'super_admin';
  const counts = data?.counts || {};

  const upload = async e => {
    e.preventDefault();
    if (!files.length) return setUpMsg({ ok: false, text: 'Pilih sekurang-kurangnya satu gambar.' });
    setUpMsg(null);
    let ok = 0;
    const errors = [];
    const ids = [];
    for (let i = 0; i < files.length; i++) {
      setUploading(`Menghantar ${i + 1}/${files.length}`);
      try {
        const fd = new FormData();
        fd.append('file', await compressImage(files[i]));
        if (notes) fd.append('notes', notes);
        const json = await (await fetch('/api/return-waybills', { method: 'POST', body: fd })).json();
        if (!json.success) throw new Error(json.error);
        ok++; ids.push(json.id);
      } catch (err) { errors.push(`${files[i].name}: ${err.message}`); }
    }
    if (ok) {
      setFiles([]); setNotes('');
      if (fileRef.current) fileRef.current.value = '';
      load();
    }
    // AI baca & padankan setiap gambar (yang tertinggal diproses oleh tugas berjadual)
    for (let i = 0; i < ids.length; i++) {
      setUploading(`🤖 Membaca waybill ${i + 1}/${ids.length}`);
      await processOne(ids[i], false);
    }
    setUploading(null);
    setUpMsg(errors.length ? { ok: false, text: `${ok} berjaya, ${errors.length} gagal — ${errors.join(' · ')}` } : { ok: true, text: `${ok} gambar waybill dihantar & diproses. Semak tab 🔎 Perlu semakan / ⚠️ jika ada.` });
    load();
  };

  const processOne = async (id, reload = true) => {
    try {
      await fetch('/api/return-waybills/process', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    } catch (_) {}
    if (reload) load();
  };

  const patch = async (row, body, confirmText) => {
    if (confirmText && !confirm(confirmText)) return;
    setBusyId(row.id);
    try {
      const json = await (await fetch('/api/return-waybills', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: row.id, ...body }),
      })).json();
      if (!json.success) throw new Error(json.error);
      await load();
    } catch (e) { alert(e.message); }
    finally { setBusyId(null); }
  };

  const reset = async row => {
    if (!confirm('Set semula gambar ini ke "Belum diproses"?\n\nNota: return pada order TIDAK dibatalkan.')) return;
    setBusyId(row.id);
    try {
      const json = await (await fetch('/api/return-waybills', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: row.id, action: 'reset' }),
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
      const json = await (await fetch(`/api/return-waybills?id=${row.id}`, { method: 'DELETE' })).json();
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

  return (
    <div style={{ fontFamily: ff, color: textPrimary, padding: '0.25rem 0' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderRadius: '8px', marginBottom: '1.25rem', background: cardBg, border: cardBorder }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>↩️ Return Parcel</h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: textSecondary, lineHeight: 1.55 }}>
          Snap & upload gambar <strong>waybill</strong> setiap parcel COD yang dipulangkan — pastikan nama, no. telefon, alamat &amp; nombor tracking jelas.
          AI akan baca &amp; padankan order: padanan pasti terus ditanda return (stok dipulangkan, order keluar dari sales / komisen);
          yang tak pasti masuk <strong>🔎 Perlu semakan</strong>. Gambar dipadam 7 hari selepas selesai.
        </p>
      </div>

      {/* Upload */}
      <form onSubmit={upload} style={{ marginBottom: '1.25rem', padding: '1.1rem', borderRadius: '10px', background: cardBg, border: cardBorder, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.65rem', alignItems: 'end' }}>
        <label style={{ display: 'grid', gap: '0.3rem', fontSize: '0.75rem', color: textSecondary, fontWeight: 600 }}>
          Gambar waybill (boleh pilih banyak)
          <input ref={fileRef} style={{ ...input, padding: '0.45rem' }} type="file" accept="image/*" multiple onChange={e => setFiles([...e.target.files])} />
        </label>
        <label style={{ display: 'grid', gap: '0.3rem', fontSize: '0.75rem', color: textSecondary, fontWeight: 600 }}>
          Nota (pilihan)
          <input style={input} value={notes} onChange={e => setNotes(e.target.value)} placeholder="cth: parcel pulang 20/10, kotak B" maxLength={300} />
        </label>
        <button disabled={!!uploading} style={{ ...btn('#10B981'), padding: '0.65rem 1rem', opacity: uploading ? 0.6 : 1 }}>
          {uploading ? `${uploading}...` : `📤 Hantar ${files.length ? `${files.length} gambar` : 'gambar'}`}
        </button>
        {upMsg && <div style={{ gridColumn: '1 / -1', fontSize: '0.82rem', color: upMsg.ok ? '#10B981' : '#EF4444' }}>{upMsg.ok ? '✅' : '⚠️'} {upMsg.text}</div>}
      </form>

      {/* Status */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
        {[['pending', STATUS.pending.label], ['review', STATUS.review.label], ['processed', STATUS.processed.label], ['unmatched', STATUS.unmatched.label], ['all', 'Semua']].map(([k, l]) => {
          const on = status === k;
          const n = k === 'all' ? null : counts[k];
          return (
            <button key={k} onClick={() => setStatus(k)} style={{
              padding: '0.45rem 0.85rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: ff,
              border: on ? '1px solid #10B981' : cardBorder, background: on ? 'rgba(16,185,129,0.12)' : 'transparent', color: on ? '#10B981' : textSecondary,
            }}>
              {l}{n ? <span style={{ marginLeft: '0.35rem', background: ['pending', 'review'].includes(k) ? '#F59E0B' : subCardBg, color: ['pending', 'review'].includes(k) ? '#111' : textSecondary, borderRadius: '999px', padding: '0 0.4rem', fontSize: '0.7rem', fontWeight: 800 }}>{n}</span> : null}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: textMuted }}>Memuatkan...</div>
      ) : error ? (
        <div style={{ padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: '0.85rem' }}>⚠️ {error}</div>
      ) : !data.data.length ? (
        <div style={{ padding: '2.5rem', textAlign: 'center', color: textMuted, background: cardBg, border: cardBorder, borderRadius: '10px' }}>
          {status === 'pending' ? 'Tiada waybill menunggu untuk diproses. 🎉' : 'Tiada gambar.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '0.9rem' }}>
          {data.data.map(r => {
            const st = STATUS[r.status] || STATUS.pending;
            const canDelete = isOwner || (r.uploaded_by === data.me && r.status === 'pending');
            return (
              <div key={r.id} style={{ background: cardBg, border: r.status === 'processed' ? '1px solid rgba(16,185,129,0.4)' : cardBorder, borderRadius: '10px', overflow: 'hidden', opacity: busyId === r.id ? 0.55 : 1 }}>
                <button onClick={() => r.url && setViewer(r.url)} style={{ display: 'block', width: '100%', padding: 0, border: 'none', background: subCardBg, cursor: 'zoom-in', aspectRatio: '3 / 4' }}>
                  {r.url
                    ? <img src={r.url} alt="Waybill return" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    : <span style={{ color: textMuted, fontSize: '0.8rem', padding: '1rem', display: 'block' }}>{r.image_deleted_at ? '🗑 Gambar dipadam (7 hari selepas selesai) — maklumat di bawah kekal' : 'Gambar tiada'}</span>}
                </button>
                <div style={{ padding: '0.75rem 0.85rem', display: 'grid', gap: '0.35rem' }}>
                  <span style={{ justifySelf: 'start', fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '999px', background: st.bg, color: st.color }}>{st.label}</span>
                  {r.order && (
                    <div style={{ fontSize: '0.8rem', lineHeight: 1.45 }}>
                      <strong>{r.order.full_name}</strong>
                      <div style={{ color: textSecondary, fontSize: '0.75rem' }}>
                        Order {fmtDate(r.order.created_at)}{r.order.pakej ? ` · ${r.order.pakej}` : ''}{r.order.amount ? ` · RM${r.order.amount}` : ''}
                      </div>
                    </div>
                  )}
                  {r.extracted && (
                    <div style={{ fontSize: '0.72rem', color: textMuted, background: subCardBg, borderRadius: '6px', padding: '0.4rem 0.5rem', lineHeight: 1.5 }}>
                      🤖 {r.extracted.name || '?'} · ***{r.extracted.phone_last4 || '?'} · {r.extracted.postcode || '?'}
                      {r.extracted.cod_amount != null ? ` · RM${r.extracted.cod_amount}` : ''}{r.extracted.units ? ` · ${r.extracted.units} unit` : ''}
                      {r.extracted.tracking && <><br />{r.extracted.tracking}</>}
                    </div>
                  )}
                  {r.status === 'review' && Array.isArray(r.candidates) && r.candidates.map(c => (
                    <div key={c.id} style={{ border: cardBorder, borderRadius: '8px', padding: '0.5rem 0.6rem', fontSize: '0.75rem', display: 'grid', gap: '0.3rem' }}>
                      <div><strong>{c.full_name}</strong>{c.returned ? ' · (dah return)' : ''}</div>
                      <div style={{ color: textSecondary }}>Order {fmtDate(c.created_at)}{c.pakej ? ` · ${c.pakej}` : ''}{c.amount ? ` · RM${c.amount}` : ''}</div>
                      <button disabled={busyId === r.id} onClick={() => patch(r, { action: 'process', submission_id: c.id }, `Sahkan return untuk order ${c.full_name} (${fmtDate(c.created_at)})?\n\nStok dipulangkan & order keluar dari sales / komisen.`)}
                        style={{ ...btn('#10B981'), padding: '0.35rem 0.6rem', fontSize: '0.74rem' }}>✅ Ini ordernya — tanda return</button>
                    </div>
                  ))}
                  {r.process_note && <div style={{ fontSize: '0.75rem', color: r.status === 'unmatched' ? '#EF4444' : textSecondary }}>{r.process_note}</div>}
                  {r.notes && <div style={{ fontSize: '0.75rem', color: textSecondary }}>📝 {r.notes}</div>}
                  <div style={{ fontSize: '0.7rem', color: textMuted }}>
                    📤 {r.uploaded_by_name || '—'} · {fmtTime(r.created_at)}
                    {r.processed_at && <><br />{r.status === 'processed' ? '✅' : '⚠️'} {r.processed_by_name || '—'} · {fmtTime(r.processed_at)}</>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
                    {r.status === 'pending' && <button disabled={busyId === r.id} onClick={() => { setBusyId(r.id); processOne(r.id).finally(() => setBusyId(null)); }} style={btn('#8B5CF6')}>🤖 Proses sekarang</button>}
                    {r.status === 'review' && <button disabled={busyId === r.id} onClick={() => patch(r, { action: 'unmatched', note: 'Tiada order cadangan yang betul — semak manual.' }, 'Tandakan tiada order yang betul?')} style={btn('transparent', textSecondary)}>Tiada yang betul</button>}
                    {isOwner && !['pending', 'processing'].includes(r.status) && <button disabled={busyId === r.id} onClick={() => reset(r)} style={btn(lm ? '#E2E8F0' : '#374151', textPrimary)}>↺ Set semula</button>}
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
          <img src={viewer} alt="Waybill return" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '8px' }} />
        </div>
      )}
    </div>
  );
}

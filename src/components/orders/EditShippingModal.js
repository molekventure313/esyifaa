'use client';
// Borang betulkan maklumat penghantaran (nama, telefon, alamat) → simpan / simpan & hantar semula ke NinjaVan.
// Dipakai Pengurusan Order (HQ) & Semua Order Fighter.
import { useState, useMemo } from 'react';
import { NEGERI, checkShipping, joinAddress, negeriForPoskod, normalizeNegeri, splitAddress } from '@/lib/shipping-validate';

/**
 * @param {{ order: object, save: (body) => Promise<object>, onClose: () => void, onDone: (msg) => void,
 *           t: { cardBg, subBg, border, text, text2, muted, ff }, canPush?: boolean }} props
 *   save(body) → JSON { success, error?, needs_cancel?, warnings?, cancelled?, push? }
 */
export default function EditShippingModal({ order, save, onClose, onDone, t, canPush = true }) {
  const init = useMemo(() => {
    const a = splitAddress(order.address || '');
    return {
      full_name: order.full_name || '', phone: String(order.phone || '').replace(/^60/, '0'),
      street: a.street, poskod: a.poskod, daerah: a.daerah, negeri: normalizeNegeri(a.negeri) || a.negeri,
    };
  }, [order]);
  const [f, setF] = useState(init);
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const pending = order.nv && (order.nv.group === 'pending_pickup' || order.nv.status === 'Pickup Exception');
  const [cancelOk, setCancelOk] = useState(false);

  const set = (k, v) => setF(p => {
    const n = { ...p, [k]: v };
    // Poskod lengkap → cadang negeri jika kosong / tak sepadan
    if (k === 'poskod' && /^\d{5}$/.test(v)) {
      const opts = negeriForPoskod(v);
      if (opts.length && !opts.includes(normalizeNegeri(p.negeri))) n.negeri = opts[0];
    }
    return n;
  });
  const check = checkShipping({ full_name: f.full_name, phone: f.phone, address: joinAddress({ ...f, negeri: normalizeNegeri(f.negeri) || f.negeri }) });
  const negOpts = negeriForPoskod(f.poskod);
  const blocked = check.errors.length > 0 || (pending && !cancelOk);

  const submit = async push => {
    setBusy(push ? 'push' : 'save'); setErr('');
    try {
      const j = await save({ ...f, cancel_parcel: pending && cancelOk, push });
      if (!j.success) throw new Error(j.error || 'Gagal disimpan');
      const parts = ['Maklumat penghantaran disimpan'];
      if (j.cancelled) parts.push(`parcel lama ${j.cancelled} dibatalkan`);
      if (j.push?.ok) parts.push(`dihantar ke NinjaVan (${j.push.tracking_number})`);
      if (j.push && !j.push.ok) { setErr(`Disimpan, tetapi NinjaVan tolak: ${j.push.error}`); onDone?.(null); return; }
      onDone?.(parts.join(' · ') + '.');
      onClose();
    } catch (e) { setErr(e.message); }
    finally { setBusy(''); }
  };

  const inp = { width: '100%', padding: '0.55rem 0.7rem', borderRadius: 7, border: t.border, background: t.subBg, color: t.text, fontSize: '0.85rem', fontFamily: t.ff, outline: 'none', boxSizing: 'border-box' };
  const lbl = { fontSize: '0.72rem', fontWeight: 700, color: t.text2, marginBottom: '0.2rem', display: 'block' };
  const btn = (bg, solid = true) => ({ padding: '0.55rem 0.9rem', borderRadius: 7, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', border: `1px solid ${bg}`, background: solid ? bg : 'transparent', color: solid ? '#fff' : bg, fontFamily: t.ff });
  const wa = `https://wa.me/${String(order.phone || '').replace(/\D/g, '').replace(/^0/, '60')}?text=${encodeURIComponent(
    `Assalamualaikum ${order.full_name || ''}, kami dari E-Syifa ingin sahkan alamat penghantaran order anda:\n\n${order.address || '-'}\n\nBoleh semak & betulkan jika ada kesilapan (terutama poskod & negeri)? Terima kasih 🙏`)}`;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: t.cardBg, border: t.border, borderRadius: 12, width: '100%', maxWidth: 520, maxHeight: '92vh', overflowY: 'auto', padding: '1.1rem 1.2rem', fontFamily: t.ff, color: t.text }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>✏️ Betulkan maklumat penghantaran</div>
            <div style={{ fontSize: '0.74rem', color: t.muted, marginTop: '0.15rem', lineHeight: 1.45 }}>Asal: {order.address || '—'}</div>
          </div>
          <button onClick={onClose} style={{ ...btn(t.muted, false), padding: '0.2rem 0.55rem' }}>✕</button>
        </div>

        {order.nv_error && (
          <div style={{ fontSize: '0.76rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', color: '#EF4444', borderRadius: 7, padding: '0.45rem 0.6rem', marginBottom: '0.7rem' }}>
            ❌ Push terakhir gagal: {order.nv_error}
          </div>
        )}

        <div style={{ display: 'grid', gap: '0.6rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem' }}>
            <label><span style={lbl}>Nama penerima</span><input style={inp} value={f.full_name} onChange={e => set('full_name', e.target.value)} /></label>
            <label><span style={lbl}>No. telefon</span><input style={inp} value={f.phone} inputMode="tel" onChange={e => set('phone', e.target.value)} placeholder="0123456789" /></label>
          </div>
          <label><span style={lbl}>Alamat (no. rumah, jalan, taman)</span>
            <textarea style={{ ...inp, minHeight: 64, resize: 'vertical' }} value={f.street} onChange={e => set('street', e.target.value)} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '0.6rem' }}>
            <label><span style={lbl}>Poskod</span><input style={inp} value={f.poskod} inputMode="numeric" maxLength={5} onChange={e => set('poskod', e.target.value.replace(/\D/g, '').slice(0, 5))} /></label>
            <label><span style={lbl}>Bandar / daerah</span><input style={inp} value={f.daerah} onChange={e => set('daerah', e.target.value)} /></label>
          </div>
          <label><span style={lbl}>Negeri {negOpts.length > 0 && <span style={{ fontWeight: 400, color: t.muted }}>· poskod {f.poskod}: {negOpts.join(' / ')}</span>}</span>
            <select style={inp} value={NEGERI.includes(f.negeri) ? f.negeri : ''} onChange={e => set('negeri', e.target.value)}>
              <option value="">— Pilih negeri —{f.negeri && !NEGERI.includes(f.negeri) ? ` (asal: ${f.negeri})` : ''}</option>
              {NEGERI.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        </div>

        {(check.errors.length > 0 || check.warnings.length > 0) && (
          <div style={{ marginTop: '0.7rem', fontSize: '0.76rem', display: 'grid', gap: '0.2rem' }}>
            {check.errors.map(m => <div key={m} style={{ color: '#EF4444', fontWeight: 700 }}>❌ {m}</div>)}
            {check.warnings.map(m => <div key={m} style={{ color: '#D97706', fontWeight: 600 }}>⚠️ {m}</div>)}
          </div>
        )}
        {!check.errors.length && !check.warnings.length && <div style={{ marginTop: '0.7rem', fontSize: '0.76rem', color: '#10B981', fontWeight: 700 }}>✅ Maklumat lengkap</div>}

        {pending && (
          <label style={{ display: 'flex', gap: '0.45rem', alignItems: 'flex-start', marginTop: '0.7rem', fontSize: '0.76rem', color: t.text2, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 7, padding: '0.45rem 0.6rem' }}>
            <input type="checkbox" checked={cancelOk} onChange={e => setCancelOk(e.target.checked)} style={{ marginTop: 2 }} />
            <span>Order ini ada parcel <strong>{order.nv.tracking_number}</strong> (belum diambil kurier). Batalkan parcel ini dahulu — waybill lama tak boleh dipakai lagi.</span>
          </label>
        )}

        {err && <div style={{ marginTop: '0.65rem', fontSize: '0.78rem', color: '#EF4444', fontWeight: 600 }}>⚠️ {err}</div>}

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.9rem', alignItems: 'center' }}>
          {canPush && <button style={btn('#0EA5E9')} disabled={blocked || !!busy} onClick={() => submit(true)}>{busy === 'push' ? 'Menghantar...' : '🚚 Simpan & hantar ke NinjaVan'}</button>}
          <button style={btn('#10B981', false)} disabled={blocked || !!busy} onClick={() => submit(false)}>{busy === 'save' ? 'Menyimpan...' : '💾 Simpan sahaja'}</button>
          {order.phone && <a href={wa} target="_blank" rel="noopener noreferrer" style={{ ...btn('#25D366', false), textDecoration: 'none', marginLeft: 'auto' }}>💬 Tanya pelanggan</a>}
        </div>
      </div>
    </div>
  );
}

/** Kotak kecil ralat / amaran penghantaran untuk baris order */
export function ShippingIssues({ order, compact = false }) {
  const errs = [...(order.nv_error ? [`Push gagal: ${order.nv_error}`] : []), ...(order.ship_check?.errors || [])];
  const warns = order.ship_check?.warnings || [];
  if (!errs.length && !warns.length) return null;
  const c = errs.length ? '#EF4444' : '#D97706';
  return (
    <div style={{ marginTop: '0.3rem', fontSize: compact ? '0.66rem' : '0.7rem', lineHeight: 1.45, color: c, background: `${c}14`, border: `1px solid ${c}44`, borderRadius: 6, padding: '0.25rem 0.45rem', fontWeight: 600, whiteSpace: 'normal' }}>
      {errs.map(m => <div key={m}>❌ {m}</div>)}
      {warns.map(m => <div key={m}>⚠️ {m}</div>)}
    </div>
  );
}

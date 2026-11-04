'use client';

import { useState } from 'react';

// Kotak stok rosak — untuk order yang dah return: berapa unit tak boleh dijual semula (ditolak dari stok).
// Komponen peringkat atas (bukan dalam page) supaya input tak hilang fokus.
export default function DamageBox({ items, busy, canClear, onSave, onClear, colors }) {
  const { text2, muted, sub, border, ff } = colors;
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState({});
  const [reason, setReason] = useState('');
  if (!items?.length) return null;
  const totalDmg = items.reduce((t, i) => t + i.damaged, 0);
  const anyLeft = items.some(i => i.returned - i.damaged > 0);
  const inp = { width: 54, padding: '0.25rem 0.35rem', borderRadius: 5, border, background: 'transparent', color: 'inherit', fontFamily: ff, fontSize: '0.78rem' };
  return (
    <div style={{ fontSize: '0.74rem', background: sub, borderRadius: 6, padding: '0.45rem 0.55rem', display: 'grid', gap: '0.3rem' }}>
      <div style={{ color: text2 }}>
        ↩️ Masuk stok: {items.map(i => `${i.sku} ${i.returned - i.damaged}`).join(' · ')}
        {totalDmg > 0 && <span style={{ color: '#EF4444', fontWeight: 700 }}> · 🧨 Rosak: {items.filter(i => i.damaged).map(i => `${i.sku} ${i.damaged}`).join(' · ')}</span>}
      </div>
      {!open ? (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {anyLeft && <button disabled={busy} onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', padding: 0, color: '#F59E0B', fontWeight: 700, cursor: 'pointer', fontFamily: ff, fontSize: '0.74rem' }}>🧨 Rekod unit rosak</button>}
          {canClear && totalDmg > 0 && <button disabled={busy} onClick={onClear} style={{ background: 'none', border: 'none', padding: 0, color: muted, cursor: 'pointer', fontFamily: ff, fontSize: '0.72rem' }}>↺ Batal rekod rosak</button>}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.35rem' }}>
          {items.filter(i => i.returned - i.damaged > 0).map(i => (
            <label key={i.product_id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ flex: 1 }}>{i.name}</span>
              <input type="number" min="0" max={i.returned - i.damaged} value={qty[i.product_id] ?? ''} placeholder="0"
                onChange={e => setQty(q => ({ ...q, [i.product_id]: e.target.value }))} style={inp} />
              <span style={{ color: muted }}>/ {i.returned - i.damaged}</span>
            </label>
          ))}
          <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Sebab (pilihan) — cth botol pecah" style={{ ...inp, width: '100%' }} />
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button disabled={busy} onClick={async () => {
              const list = Object.entries(qty).map(([product_id, q]) => ({ product_id, qty: parseInt(q, 10) || 0 })).filter(x => x.qty > 0);
              if (!list.length) return alert('Isi bilangan unit rosak.');
              if (await onSave(list, reason)) { setOpen(false); setQty({}); setReason(''); }
            }} style={{ padding: '0.3rem 0.65rem', borderRadius: 5, border: 'none', background: '#EF4444', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: ff, fontSize: '0.74rem' }}>Simpan rosak</button>
            <button disabled={busy} onClick={() => setOpen(false)} style={{ padding: '0.3rem 0.65rem', borderRadius: 5, border, background: 'transparent', color: text2, cursor: 'pointer', fontFamily: ff, fontSize: '0.74rem' }}>Batal</button>
          </div>
        </div>
      )}
    </div>
  );
}

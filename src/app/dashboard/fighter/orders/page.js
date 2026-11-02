'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useFighterTheme, Card, Badge, rm, inputStyle, btnStyle, fmtTime } from '@/components/fighter/ui';

// Fighter — Order sendiri. Aliran: order masuk → export CSV → upload CSV ke akaun NinjaVan anda (pickup alamat HQ)
// → upload PDF waybill di sini → HQ cetak waybill & pack → stok HQ dicaj ke akaun anda.

const TABS = [
  { id: 'new',       label: '🆕 Perlu waybill', ship: 'new', pay: 'completed' },
  { id: 'ready',     label: '📦 Tunggu HQ pack', ship: 'ready' },
  { id: 'packed',    label: '🚚 Dah pack', ship: 'packed' },
  { id: 'returned',  label: '↩️ Return', ship: 'returned' },
  { id: 'pending',   label: '⏳ Belum bayar', pay: 'pending' },
  { id: 'cancelled', label: '✕ Batal', ship: 'cancelled' },
];
const PRODUCT = { 'garam-pengasihan': 'Garam', 'kasturi-kijang': 'Kasturi' };
const pakejOf = o => (`${o.problem || ''}`.match(/Pakej:\s*([^|\]]+)/i)?.[1] || '').trim();

export default function FighterOrdersPage() {
  const t = useFighterTheme();
  const [tab, setTab] = useState('new');
  const [q, setQ] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [sel, setSel] = useState(new Set());
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null);
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    const T = TABS.find(x => x.id === tab);
    const p = new URLSearchParams({ ship: T.ship || 'all', pay: T.pay || 'all', q });
    try {
      const j = await (await fetch(`/api/fighter/orders?${p}`)).json();
      if (!j.success) throw new Error(j.error);
      setData(j); setError(''); setSel(new Set());
    } catch (e) { setError(e.message); }
  }, [tab, q]);
  useEffect(() => { const h = setTimeout(load, q ? 350 : 0); return () => clearTimeout(h); }, [load, q]);

  const toggle = id => setSel(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const rows = data?.data || [];
  const canSelect = tab === 'new' || tab === 'ready';

  const exportCsv = async () => {
    setBusy('csv'); setMsg(null);
    try {
      const res = await fetch('/api/fighter/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'export', ids: [...sel] }) });
      if (!res.ok) throw new Error((await res.json()).error);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = (res.headers.get('Content-Disposition') || '').match(/filename="([^"]+)"/)?.[1] || 'ninjavan.csv';
      a.click();
      setMsg({ ok: true, text: `CSV ${sel.size} order dimuat turun. Upload ke akaun NinjaVan anda, kemudian upload PDF waybill di sini.` });
    } catch (e) { setMsg({ ok: false, text: e.message }); }
    finally { setBusy(''); }
  };

  const uploadWaybill = async file => {
    if (!file) return;
    setBusy('wb'); setMsg(null);
    try {
      const fd = new FormData();
      fd.append('file', file); fd.append('ids', JSON.stringify([...sel]));
      const j = await (await fetch('/api/fighter/orders/waybill', { method: 'POST', body: fd })).json();
      if (!j.success) throw new Error(j.error);
      setMsg({ ok: true, text: `Waybill dilampirkan pada ${j.count} order — HQ akan pack.` });
      await load();
    } catch (e) { setMsg({ ok: false, text: e.message }); }
    finally { setBusy(''); if (fileRef.current) fileRef.current.value = ''; }
  };

  const viewWaybill = async id => {
    const j = await (await fetch(`/api/fighter/orders/waybill?id=${id}`)).json();
    if (j.url) window.open(j.url, '_blank'); else alert(j.error || 'Tiada waybill.');
  };

  const cancel = async o => {
    if (!confirm(`Batalkan order ${o.full_name}?${o.payment_type === 'fpx_payment' ? '\n\nFPX dah dibayar — refund pelanggan melalui portal CHIP anda.' : ''}`)) return;
    const j = await (await fetch('/api/fighter/orders', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: o.id, action: 'cancel' }) })).json();
    if (!j.success) alert(j.error); else load();
  };

  const c = data?.counts || {};
  const countOf = x => (x.id === 'pending' ? c.pending_pay : c[x.ship]) || 0;

  return (
    <div style={{ fontFamily: t.ff, color: t.text, maxWidth: 1100 }}>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>FIGHTER · ORDER</div>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0.15rem 0 0' }}>📦 Order Saya</h1>
      </div>

      <Card t={t} title="Cara proses order" style={{ padding: '0.85rem 1.1rem' }}>
        <div style={{ fontSize: '0.78rem', color: t.text2, lineHeight: 1.75 }}>
          1️⃣ Tab <strong>Perlu waybill</strong> → pilih order → <strong>Export CSV</strong><br />
          2️⃣ Upload CSV ke <strong>akaun NinjaVan anda</strong> (alamat pickup: HQ E-Syifa') → muat turun PDF waybill<br />
          3️⃣ Pilih order yang sama → <strong>Upload waybill</strong> → HQ cetak, pack & serah ke NinjaVan<br />
          4️⃣ Bila HQ pack, stok dicaj ke akaun anda (lihat <strong>Stok & Bil</strong>)
        </div>
      </Card>

      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
        {TABS.map(x => (
          <button key={x.id} onClick={() => setTab(x.id)} style={{
            padding: '0.42rem 0.8rem', borderRadius: 7, fontSize: '0.8rem', cursor: 'pointer', fontFamily: t.ff,
            fontWeight: tab === x.id ? 700 : 500, border: t.border,
            background: tab === x.id ? t.accent : t.cardBg, color: tab === x.id ? '#FFFFFF' : t.text2,
          }}>{x.label} {countOf(x) > 0 && <span style={{ opacity: 0.8 }}>({countOf(x)})</span>}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.85rem' }}>
        <input style={{ ...inputStyle(t), maxWidth: 300 }} placeholder="Cari nama, telefon, tracking..." value={q} onChange={e => setQ(e.target.value)} />
        {canSelect && (
          <>
            <button style={btnStyle(t.accent, false)} onClick={() => setSel(sel.size === rows.length ? new Set() : new Set(rows.map(r => r.id)))}>
              {sel.size === rows.length && rows.length ? 'Nyahpilih semua' : 'Pilih semua'}
            </button>
            <button style={btnStyle()} disabled={!sel.size || !!busy} onClick={exportCsv}>{busy === 'csv' ? 'Menjana...' : `⬇️ Export CSV (${sel.size})`}</button>
            <button style={btnStyle('#0EA5E9')} disabled={!sel.size || !!busy} onClick={() => fileRef.current?.click()}>{busy === 'wb' ? 'Memuat naik...' : `📄 Upload waybill (${sel.size})`}</button>
            <input ref={fileRef} type="file" accept="application/pdf,image/*" style={{ display: 'none' }} onChange={e => uploadWaybill(e.target.files?.[0])} />
          </>
        )}
      </div>
      {msg && <div style={{ fontSize: '0.82rem', marginBottom: '0.75rem', color: msg.ok ? t.ok : t.bad }}>{msg.ok ? '✅' : '⚠️'} {msg.text}</div>}
      {error && <div style={{ color: t.bad, marginBottom: '0.75rem' }}>{error}</div>}

      <Card t={t} style={{ padding: 0, overflow: 'hidden' }}>
        {!data ? <div style={{ padding: '1.25rem', color: t.muted }}>Memuatkan...</div>
          : !rows.length ? <div style={{ padding: '1.5rem', color: t.muted, textAlign: 'center' }}>Tiada order.</div>
          : rows.map(o => (
            <div key={o.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.8rem 1rem', borderTop: t.border }}>
              {canSelect && <input type="checkbox" checked={sel.has(o.id)} onChange={() => toggle(o.id)} style={{ marginTop: 4, width: 16, height: 16 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '0.9rem' }}>{o.full_name}</strong>
                  <span style={{ fontSize: '0.78rem', color: t.text2 }}>{o.phone}</span>
                  <Badge ok={o.payment_status === 'completed' ? true : o.payment_status === 'pending' ? undefined : false}>
                    {o.payment_type === 'cod' ? 'COD' : 'FPX'} · {o.payment_status === 'completed' ? (o.payment_type === 'cod' ? 'sah' : 'dibayar') : o.payment_status === 'pending' ? 'belum bayar' : o.payment_status}
                  </Badge>
                  {o.exported_at && o.ship_status === 'new' && <Badge>CSV ✓</Badge>}
                </div>
                <div style={{ fontSize: '0.78rem', color: t.text2, marginTop: '0.2rem' }}>
                  {PRODUCT[o.source] || 'Sabun'} — {pakejOf(o) || `${o.qty || ''} unit`} · <strong style={{ color: t.text }}>{rm(o.amount)}</strong> · {fmtTime(o.created_at)}
                </div>
                <div style={{ fontSize: '0.74rem', color: t.muted, marginTop: '0.15rem' }}>{o.address}</div>
                <div style={{ fontSize: '0.72rem', color: t.muted, marginTop: '0.15rem' }}>
                  Stok: {(o.items || []).map(i => `${i.label} x${i.qty}`).join(' · ')}
                  {o.packed_at && <> · 🚚 dipack {fmtTime(o.packed_at)}</>}
                  {o.returned_at && <> · ↩️ return {fmtTime(o.returned_at)}</>}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-end' }}>
                {o.waybill_path && <button style={{ ...btnStyle('#0EA5E9', false), padding: '0.3rem 0.6rem', fontSize: '0.74rem' }} onClick={() => viewWaybill(o.id)}>📄 Waybill</button>}
                {['new', 'ready'].includes(o.ship_status) && (
                  <button style={{ ...btnStyle(t.bad, false), padding: '0.3rem 0.6rem', fontSize: '0.74rem' }} onClick={() => cancel(o)}>Batal</button>
                )}
              </div>
            </div>
          ))}
      </Card>
    </div>
  );
}

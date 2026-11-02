'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFighterTheme, Card, Badge, btnStyle, inputStyle, fmtTime } from '@/components/fighter/ui';

// HQ — Packing Fighter (staff + super_admin). Fighter upload waybill NinjaVan sendiri → staff cetak & pack.
// "Dah pack" = stok HQ ditolak + caj ke akaun fighter. Parcel pulang → "Return" = stok masuk semula + kredit.

const TABS = [
  { id: 'ready', label: '📦 Perlu pack' },
  { id: 'packed', label: '🚚 Dah pack' },
  { id: 'returned', label: '↩️ Return' },
];
const pakejOf = o => (`${o.problem || ''}`.match(/Pakej:\s*([^|\]]+)/i)?.[1] || '').trim();

export default function FighterPackingPage() {
  const t = useFighterTheme();
  const [tab, setTab] = useState('ready');
  const [q, setQ] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [sel, setSel] = useState(new Set());
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    try {
      const j = await (await fetch(`/api/admin/fighter-packing?status=${tab}&q=${encodeURIComponent(q)}`)).json();
      if (!j.success) throw new Error(j.error);
      setData(j); setError(''); setSel(new Set());
    } catch (e) { setError(e.message); }
  }, [tab, q]);
  useEffect(() => { const h = setTimeout(load, q ? 350 : 0); return () => clearTimeout(h); }, [load, q]);

  const act = async (body, note) => {
    setBusy(body.action); setMsg(null);
    try {
      const j = await (await fetch('/api/admin/fighter-packing', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).json();
      if (!j.success) throw new Error(j.error);
      setMsg({ ok: true, text: note(j) });
    } catch (e) { setMsg({ ok: false, text: e.message }); }
    finally { setBusy(''); load(); }
  };

  const rows = data?.data || [];
  // Kumpul ikut fail waybill (satu PDF NinjaVan biasanya untuk beberapa order)
  const groups = [];
  for (const o of rows) {
    const key = tab === 'ready' ? (o.waybill_path || o.id) : o.id;
    let g = groups.find(x => x.key === key);
    if (!g) groups.push(g = { key, url: o.waybill_url, fighter: o.fighter_name, orders: [] });
    g.orders.push(o);
  }
  const toggle = ids => setSel(s => { const n = new Set(s); const all = ids.every(i => n.has(i)); ids.forEach(i => (all ? n.delete(i) : n.add(i))); return n; });

  return (
    <div style={{ fontFamily: t.ff, color: t.text, maxWidth: 1100 }}>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>HQ · PACKING FIGHTER</div>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0.15rem 0 0' }}>📦 Packing Fighter</h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: t.text2 }}>
          Order penjual bebas. Cetak waybill (dari akaun NinjaVan fighter), pack, kemudian tekan <strong>Dah pack</strong> — stok HQ ditolak & dicaj ke fighter.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.85rem', alignItems: 'center' }}>
        {TABS.map(x => (
          <button key={x.id} onClick={() => setTab(x.id)} style={{
            padding: '0.42rem 0.8rem', borderRadius: 7, fontSize: '0.8rem', cursor: 'pointer', fontFamily: t.ff, fontWeight: tab === x.id ? 700 : 500,
            border: t.border, background: tab === x.id ? t.accent : t.cardBg, color: tab === x.id ? '#FFFFFF' : t.text2,
          }}>{x.label}{x.id === 'ready' && data?.ready_count ? ` (${data.ready_count})` : ''}</button>
        ))}
        <input style={{ ...inputStyle(t), maxWidth: 260, marginLeft: 'auto' }} placeholder="Cari nama, telefon, tracking..." value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {tab === 'ready' && rows.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <button style={btnStyle(t.ok)} disabled={!sel.size || !!busy}
            onClick={() => confirm(`Tanda ${sel.size} order DAH PACK? Stok HQ akan ditolak & dicaj ke fighter.`) && act({ action: 'pack', ids: [...sel] }, j => `${j.results.filter(r => r.ok).length} order dipack.`)}>
            {busy === 'pack' ? 'Memproses...' : `✅ Dah pack (${sel.size})`}
          </button>
        </div>
      )}
      {msg && <div style={{ fontSize: '0.82rem', marginBottom: '0.75rem', color: msg.ok ? t.ok : t.bad }}>{msg.ok ? '✅' : '⚠️'} {msg.text}</div>}
      {error && <div style={{ color: t.bad, marginBottom: '0.75rem' }}>{error}</div>}

      {!data ? <div style={{ color: t.muted }}>Memuatkan...</div>
        : !rows.length ? <Card t={t}><div style={{ color: t.muted, textAlign: 'center' }}>Tiada order.</div></Card>
        : groups.map(g => (
          <Card t={t} key={g.key} style={{ padding: '0.85rem 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
              {tab === 'ready' && <input type="checkbox" checked={g.orders.every(o => sel.has(o.id))} onChange={() => toggle(g.orders.map(o => o.id))} style={{ width: 16, height: 16 }} />}
              <strong style={{ fontSize: '0.88rem' }}>🥊 {g.fighter}</strong>
              {tab === 'ready' && <span style={{ fontSize: '0.75rem', color: t.muted }}>{g.orders.length} order · waybill {fmtTime(g.orders[0].waybill_at)}</span>}
              {g.url && <a href={g.url} target="_blank" rel="noopener noreferrer" style={{ ...btnStyle('#0EA5E9', false), padding: '0.3rem 0.65rem', fontSize: '0.76rem', textDecoration: 'none', marginLeft: 'auto' }}>🖨️ Buka waybill</a>}
            </div>
            {g.orders.map(o => (
              <div key={o.id} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', padding: '0.55rem 0', borderTop: t.border }}>
                {tab === 'ready' && <input type="checkbox" checked={sel.has(o.id)} onChange={() => toggle([o.id])} style={{ marginTop: 3 }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem' }}>
                    <strong>{o.full_name}</strong> · {o.phone} <Badge ok={o.payment_type === 'cod' ? undefined : true}>{o.payment_type === 'cod' ? `COD RM${o.amount.toFixed(2)}` : 'FPX'}</Badge>
                    {o.tracking_no && <span style={{ fontSize: '0.75rem', color: t.muted }}> · {o.tracking_no}</span>}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: t.accent, marginTop: '0.15rem' }}>
                    {(o.items || []).map(i => `${i.label} x${i.qty}`).join(' + ')}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: t.muted }}>{pakejOf(o)} · {o.address}</div>
                  {o.packed_at && <div style={{ fontSize: '0.72rem', color: t.muted }}>Dipack {fmtTime(o.packed_at)}{o.returned_at ? ` · Return ${fmtTime(o.returned_at)}` : ''}</div>}
                </div>
                {tab === 'packed' && (
                  <button style={{ ...btnStyle(t.warn, false), padding: '0.3rem 0.6rem', fontSize: '0.74rem' }} disabled={!!busy}
                    onClick={() => confirm(`Parcel ${o.full_name} dah pulang ke HQ? Stok masuk semula & caj fighter dikreditkan.`) && act({ action: 'return', id: o.id }, j => `Return direkod — kredit RM${Number(j.credited).toFixed(2)} ke fighter.`)}>
                    ↩️ Return
                  </button>
                )}
              </div>
            ))}
          </Card>
        ))}
    </div>
  );
}

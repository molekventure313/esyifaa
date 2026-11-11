'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFighterTheme, Card, Badge, btnStyle, inputStyle, fmtTime } from '@/components/fighter/ui';
import DamageBox from '@/components/DamageBox';
import { openMergedWaybills, WAYBILL_CHUNK } from '@/lib/ninjavan/waybill-client';

// HQ — Packing Fighter (staff + super_admin). Parcel NinjaVan HQ (fighter / admin hantar) atau PDF waybill fighter → staff cetak & pack.
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
  const [ret, setRet] = useState(null);   // { id, qty: {sku: n}, reason } — borang return + unit rosak
  const [printFilter, setPrintFilter] = useState('all');   // all | unprinted | printed (parcel NinjaVan HQ)

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

  const damageCall = async (method, body, note) => {
    setBusy('damage'); setMsg(null);
    try {
      const j = await (await fetch('/api/admin/return-damage', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).json();
      if (!j.success) throw new Error(j.error);
      setMsg({ ok: true, text: note(j) }); load(); return true;
    } catch (e) { setMsg({ ok: false, text: e.message }); return false; }
    finally { setBusy(''); }
  };
  const submitReturn = o => {
    const damaged = Object.entries(ret.qty).map(([sku, q]) => ({ sku, qty: parseInt(q, 10) || 0 })).filter(x => x.qty > 0);
    const over = damaged.find(d => d.qty > ((o.items || []).find(i => i.sku === d.sku)?.qty || 0));
    if (over) return alert(`Unit rosak ${over.sku} melebihi kuantiti order.`);
    const dTxt = damaged.length ? `

Rosak: ${damaged.map(d => `${d.sku} x${d.qty}`).join(', ')} — ditolak dari stok & FIGHTER dicaj.` : '';
    if (!confirm(`Parcel ${o.full_name} dah pulang ke HQ? Stok masuk semula & caj fighter dikreditkan.${dTxt}`)) return;
    act({ action: 'return', id: o.id, damaged, reason: ret.reason }, j => `Return direkod — kredit bersih RM${Number(j.credited).toFixed(2)} ke fighter${j.damage?.units ? ` (${j.damage.units} unit rosak dicaj RM${Number(j.damage.charged).toFixed(2)})` : ''}${j.damage?.error ? ` · ⚠️ rosak gagal: ${j.damage.error}` : ''}.`);
    setRet(null);
  };

  const rows = (data?.data || []).filter(o =>
    printFilter === 'all' || (o.nv && (printFilter === 'printed' ? !!o.nv.printed_at : !o.nv.printed_at)));
  // Kumpul ikut fail waybill (satu PDF NinjaVan fighter biasanya untuk beberapa order) · parcel NinjaVan HQ ikut fighter
  const groups = [];
  for (const o of rows) {
    const key = tab === 'ready' ? (o.waybill_path || (o.nv ? `nv:${o.fighter_id}` : o.id)) : o.id;
    let g = groups.find(x => x.key === key);
    if (!g) groups.push(g = { key, url: o.waybill_url, nv: !!o.nv && !o.waybill_path, fighter: o.fighter_name, orders: [] });
    g.orders.push(o);
  }
  const printNv = async ids => {
    const list = ids.filter(id => rows.find(o => o.id === id)?.nv);
    if (!list.length) return setMsg({ ok: false, text: 'Tiada parcel NinjaVan HQ dalam pilihan.' });
    if (list.length > WAYBILL_CHUNK) setMsg({ ok: true, text: `Menyediakan ${list.length} waybill — sila tunggu…` });
    try {
      const { pages, errors } = await openMergedWaybills(part => `/api/admin/ninjavan/waybill?fighter=1&ids=${part.join(',')}`, list);
      setMsg(errors.length ? { ok: false, text: `${pages} waybill dibuka · ${errors.length} ralat — ${errors.slice(0, 2).join(' | ')}` }
        : list.length > WAYBILL_CHUNK ? { ok: true, text: `${pages} waybill sedia untuk dicetak.` } : null);
    } catch (e) { setMsg({ ok: false, text: `Gagal sediakan waybill: ${e.message}` }); }
    load();   // segarkan tanda "Dah print"
  };
  const toggle = ids => setSel(s => { const n = new Set(s); const all = ids.every(i => n.has(i)); ids.forEach(i => (all ? n.delete(i) : n.add(i))); return n; });

  return (
    <div style={{ fontFamily: t.ff, color: t.text, maxWidth: 1100 }}>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>HQ · PACKING FIGHTER</div>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0.15rem 0 0' }}>📦 Packing Fighter</h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: t.text2 }}>
          Order penjual bebas. Cetak waybill (NinjaVan HQ, atau PDF dari akaun NinjaVan fighter), pack, kemudian tekan <strong>Dah pack</strong> — stok HQ ditolak & dicaj ke fighter.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.85rem', alignItems: 'center' }}>
        {TABS.map(x => (
          <button key={x.id} onClick={() => setTab(x.id)} style={{
            padding: '0.42rem 0.8rem', borderRadius: 7, fontSize: '0.8rem', cursor: 'pointer', fontFamily: t.ff, fontWeight: tab === x.id ? 700 : 500,
            border: t.border, background: tab === x.id ? t.accent : t.cardBg, color: tab === x.id ? '#FFFFFF' : t.text2,
          }}>{x.label}{x.id === 'ready' && data?.ready_count ? ` (${data.ready_count})` : ''}</button>
        ))}
        <select value={printFilter} onChange={e => setPrintFilter(e.target.value)} title="Tapis parcel NinjaVan HQ ikut waybill dah dicetak atau belum"
          style={{ ...inputStyle(t), maxWidth: 170, marginLeft: 'auto' }}>
          <option value="all">🖨️ Semua waybill</option>
          <option value="unprinted">⬜ Belum print</option>
          <option value="printed">✅ Dah print</option>
        </select>
        <input style={{ ...inputStyle(t), maxWidth: 260 }} placeholder="Cari nama, telefon, tracking..." value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {tab === 'ready' && rows.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
          <button style={btnStyle(t.accent, false)} onClick={() => setSel(sel.size === rows.length ? new Set() : new Set(rows.map(r => r.id)))}>
            {sel.size === rows.length ? 'Nyahpilih semua' : 'Pilih semua'}
          </button>
          <button style={btnStyle('#0EA5E9')} disabled={!sel.size}
            onClick={() => printNv([...sel])}>
            🖨️ Cetak waybill NinjaVan ({[...sel].filter(id => rows.find(o => o.id === id)?.nv).length})
          </button>
          <button style={btnStyle(t.ok)} disabled={!sel.size || !!busy}
            onClick={() => confirm(`Tanda ${sel.size} order DAH PACK? Stok HQ akan ditolak & dicaj ke fighter (termasuk pos RM4.50 / parcel NinjaVan HQ, +RM2 COD).`) && act({ action: 'pack', ids: [...sel] }, j => `${j.results.filter(r => r.ok).length} order dipack.`)}>
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
              {tab === 'ready' && <span style={{ fontSize: '0.75rem', color: t.muted }}>{g.orders.length} order · {g.nv ? '🚚 NinjaVan HQ' : `waybill ${fmtTime(g.orders[0].waybill_at)}`}</span>}
              {g.nv && tab === 'ready' && (
                <button style={{ ...btnStyle('#0EA5E9', false), padding: '0.3rem 0.65rem', fontSize: '0.76rem', marginLeft: 'auto' }} onClick={() => printNv(g.orders.map(o => o.id))}>
                  🖨️ Cetak waybill ({g.orders.length})
                </button>
              )}
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
                  {o.nv && (
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, marginTop: '0.15rem', color: o.nv.printed_at ? t.ok : '#D97706' }}>
                      🚚 NinjaVan HQ · {o.nv.printed_at
                        ? `🖨️ Dah print ${fmtTime(o.nv.printed_at)}${o.nv.print_count > 1 ? ` (${o.nv.print_count}x)` : ''}`
                        : '⬜ Belum print'}
                      {o.nv.printed_at && tab === 'ready' && (
                        <button disabled={!!busy} title="Tersalah tekan / cetak percubaan — tanda semula sebagai belum print"
                          onClick={() => confirm(`Reset tanda "dah print" waybill ${o.nv.tracking_number}?`) && act({ action: 'unprint', ids: [o.id] }, () => 'Tanda print direset.')}
                          style={{ marginLeft: '0.45rem', padding: '0.05rem 0.45rem', borderRadius: 5, fontSize: '0.66rem', fontWeight: 700, cursor: 'pointer', border: `1px solid ${t.muted}`, background: 'transparent', color: t.text2 }}>
                          ↺ Reset print
                        </button>
                      )}
                    </div>
                  )}
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: t.accent, marginTop: '0.15rem' }}>
                    {(o.items || []).map(i => `${i.label} x${i.qty}`).join(' + ')}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: t.muted }}>{pakejOf(o)} · {o.address}</div>
                  {o.packed_at && <div style={{ fontSize: '0.72rem', color: t.muted }}>Dipack {fmtTime(o.packed_at)}{o.returned_at ? ` · Return ${fmtTime(o.returned_at)}` : ''}</div>}
                  {tab === 'packed' && ret?.id === o.id && (
                    <div style={{ marginTop: '0.45rem', background: t.subBg, border: t.border, borderRadius: 7, padding: '0.55rem 0.65rem', display: 'grid', gap: '0.35rem', fontSize: '0.78rem' }}>
                      <div style={{ fontWeight: 700 }}>↩️ Return parcel — ada unit rosak? <span style={{ fontWeight: 400, color: t.muted }}>(biar kosong jika semua elok · rosak ditanggung fighter)</span></div>
                      {(o.items || []).map(i => (
                        <label key={i.sku} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <span style={{ flex: 1 }}>{i.label}</span>
                          <input type="number" min="0" max={i.qty} placeholder="0" value={ret.qty[i.sku] ?? ''}
                            onChange={e => setRet(r => ({ ...r, qty: { ...r.qty, [i.sku]: e.target.value } }))}
                            style={{ ...inputStyle(t), width: 64, padding: '0.25rem 0.4rem' }} />
                          <span style={{ color: t.muted }}>rosak / {i.qty}</span>
                        </label>
                      ))}
                      <input style={{ ...inputStyle(t), padding: '0.3rem 0.45rem' }} placeholder="Sebab rosak (pilihan)" value={ret.reason}
                        onChange={e => setRet(r => ({ ...r, reason: e.target.value }))} />
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button style={{ ...btnStyle(t.warn), padding: '0.3rem 0.7rem', fontSize: '0.76rem' }} disabled={!!busy} onClick={() => submitReturn(o)}>✅ Sahkan return</button>
                        <button style={{ ...btnStyle(t.muted, false), padding: '0.3rem 0.7rem', fontSize: '0.76rem' }} onClick={() => setRet(null)}>Batal</button>
                      </div>
                    </div>
                  )}
                  {tab === 'returned' && o.damage && (
                    <div style={{ marginTop: '0.35rem' }}>
                      <DamageBox items={o.damage} busy={!!busy} canClear={data?.role === 'super_admin'}
                        onSave={(items, reason) => damageCall('POST', { fighter_order_id: o.id, items, reason }, j => `${j.units} unit rosak direkod — fighter dicaj RM${Number(j.charged).toFixed(2)}.`)}
                        onClear={() => confirm('Batal rekod rosak order ini? Stok dipulangkan & caj rosak fighter dikreditkan.') && damageCall('DELETE', { fighter_order_id: o.id }, j => `Rekod rosak dibatalkan — kredit RM${Number(j.credited).toFixed(2)} ke fighter.`)}
                        colors={{ text2: t.text2, muted: t.muted, sub: t.subBg, border: t.border, ff: t.ff }} />
                    </div>
                  )}
                </div>
                {tab === 'packed' && ret?.id !== o.id && (
                  <button style={{ ...btnStyle(t.warn, false), padding: '0.3rem 0.6rem', fontSize: '0.74rem' }} disabled={!!busy}
                    onClick={() => setRet({ id: o.id, qty: {}, reason: '' })}>
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

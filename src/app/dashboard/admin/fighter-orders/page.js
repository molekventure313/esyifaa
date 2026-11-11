'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFighterTheme, Card, Badge, btnStyle, inputStyle, rm, fmtTime } from '@/components/fighter/ui';
import EditShippingModal, { ShippingIssues } from '@/components/orders/EditShippingModal';

// HQ — Semua Order Fighter (admin + super_admin).
// Lihat semua order penjual bebas + jumlah jualan setiap fighter. Admin urus operasi bagi pihak fighter:
// hantar ke NinjaVan HQ, batal parcel, batal order. Pack / return kekal di Packing Fighter.

const PRODUCT = { 'sabun-garam': 'Sabun', 'garam-pengasihan': 'Garam', 'kasturi-kijang': 'Kasturi' };
const SHIP = {
  new: ['Perlu waybill', undefined], ready: ['Tunggu pack', undefined], packed: ['Dah pack', true],
  returned: ['Return', false], cancelled: ['Batal', false],
};
const PAY = { completed: 'Sah', pending: 'Belum bayar', failed: 'Gagal', cancelled: 'Batal' };
const NV_GROUP = {
  pending_pickup: 'Tunggu pickup', in_transit: 'Dalam perjalanan', delivered: 'Sampai', returned: 'Return',
  exception: 'Masalah hantar', failed: 'Gagal cipta', cancelled: 'Dibatalkan',
};
const pakejOf = o => (`${o.problem || ''}`.match(/Pakej:\s*([^|\]]+)/i)?.[1] || '').trim();
const mytToday = () => new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
const MAX_PUSH = 10;

function Stat({ t, label, value, sub, color }) {
  return (
    <div style={{ background: t.cardBg, border: t.border, borderRadius: 10, padding: '0.7rem 0.85rem' }}>
      <div style={{ fontSize: '0.68rem', color: t.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: color || t.text, marginTop: '0.1rem' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.7rem', color: t.text2 }}>{sub}</div>}
    </div>
  );
}

export default function AdminFighterOrdersPage() {
  const t = useFighterTheme();
  const today = mytToday();
  const [from, setFrom] = useState(`${today.slice(0, 8)}01`);
  const [to, setTo] = useState(today);
  const [fighter, setFighter] = useState('');
  const [ship, setShip] = useState('all');
  const [pay, setPay] = useState('all');
  const [product, setProduct] = useState('all');
  const [q, setQ] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [sel, setSel] = useState(new Set());
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null);
  const [editing, setEditing] = useState(null);   // order yang sedang dibetulkan

  const load = useCallback(async () => {
    try {
      const p = new URLSearchParams({ from, to, fighter, ship, pay, product, q });
      const j = await (await fetch(`/api/admin/fighter-orders?${p}`)).json();
      if (!j.success) throw new Error(j.error);
      setData(j); setError(''); setSel(new Set());
    } catch (e) { setError(e.message); }
  }, [from, to, fighter, ship, pay, product, q]);
  useEffect(() => { const h = setTimeout(load, q ? 350 : 0); return () => clearTimeout(h); }, [load, q]);

  const post = async (body, note) => {
    setBusy(body.action + (body.id || '')); setMsg(null);
    try {
      const j = await (await fetch('/api/admin/fighter-orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).json();
      if (!j.success) throw new Error(j.error || 'Gagal');
      setMsg({ ok: true, text: note(j) });
      return j;
    } catch (e) { setMsg({ ok: false, text: e.message }); return null; }
    finally { setBusy(''); load(); }
  };

  const rows = data?.data || [];
  const canPush = o => o.payment_status === 'completed' && o.ship_status === 'new' && o.courier !== 'own';
  const pushable = rows.filter(canPush);

  const pushNv = async ids => {
    const list = ids.filter(id => pushable.some(o => o.id === id));
    if (!list.length) return setMsg({ ok: false, text: 'Tiada order yang boleh dihantar dalam pilihan (mesti dah bayar/COD sah, belum ada waybill, fighter guna NinjaVan HQ).' });
    const sandbox = data?.nv_env !== 'live' ? '\n\n⚠️ NinjaVan dalam mod SANDBOX — parcel tidak dihantar betul.' : '';
    if (!confirm(`Hantar ${list.length} order fighter ke NinjaVan HQ? Waybill akan muncul di Packing Fighter untuk dicetak.${sandbox}`)) return;
    setBusy('push'); setMsg(null);
    let sent = 0; const errs = [];
    try {
      for (let i = 0; i < list.length; i += MAX_PUSH) {
        const j = await (await fetch('/api/admin/fighter-orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'push', ids: list.slice(i, i + MAX_PUSH) }) })).json();
        sent += j.sent || 0;
        for (const r of j.results || []) if (!r.ok) errs.push(`${rows.find(o => o.id === r.id)?.full_name || r.id}: ${r.error}`);
        if (!j.results && j.error) errs.push(j.error);
      }
      setMsg({ ok: sent > 0, text: `${sent} order dihantar ke NinjaVan${errs.length ? ` · ${errs.length} gagal — ${errs.slice(0, 3).join(' · ')}` : '.'}` });
    } catch (e) { setMsg({ ok: false, text: e.message }); }
    finally { setBusy(''); load(); }
  };

  const cancelNv = o => confirm(`Batal parcel NinjaVan ${o.nv?.tracking_number} untuk ${o.full_name}? Order kembali ke "Perlu waybill" (boleh hantar semula).`)
    && post({ action: 'cancel_nv', id: o.id }, j => `Parcel ${j.tracking_number} dibatalkan.`);
  const cancelOrder = o => {
    const fpx = o.payment_type === 'fpx_payment' && o.payment_status === 'completed';
    if (!confirm(`BATALKAN order ${o.full_name} (${o.fighter_name})?${o.nv?.active ? `\nParcel NinjaVan ${o.nv.tracking_number} turut dibatalkan.` : ''}${fpx ? '\n\nFPX dah dibayar — refund pelanggan diurus fighter di CHIP.' : ''}`)) return;
    post({ action: 'cancel_order', id: o.id }, j => `Order dibatalkan${j.keep_paid ? ' — FPX dibayar, maklumkan fighter untuk refund' : ''}.`);
  };
  // Betulkan alamat: belum dipack & (tiada parcel aktif atau parcel masih menunggu pickup)
  const canEdit = o => ['new', 'ready'].includes(o.ship_status) && (!o.nv?.active || o.nv.cancellable);
  const saveShipping = async body => {
    const res = await fetch('/api/admin/fighter-orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'edit', id: editing.id, ...body }) });
    return res.json().catch(() => ({ success: false, error: `Ralat (${res.status})` }));
  };
  const toggle = id => setSel(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const tot = data?.total;
  const sel2 = [...sel].filter(id => pushable.some(o => o.id === id));
  const selStyle = { ...inputStyle(t), width: 'auto', padding: '0.45rem 0.6rem' };

  return (
    <div style={{ fontFamily: t.ff, color: t.text, maxWidth: 1150 }}>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>HQ · PENJUAL BEBAS</div>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0.15rem 0 0' }}>🥊 Semua Order Fighter</h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: t.text2 }}>
          Semua order fighter & jumlah jualan. Admin boleh <strong>hantar ke NinjaVan HQ</strong> atau <strong>batal</strong> bagi pihak fighter.
          Cetak waybill, pack & return di <a href="/dashboard/admin/fighter-packing" style={{ color: t.accent }}>Packing Fighter</a>.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.85rem', alignItems: 'center' }}>
        <input type="date" value={from} max={to} onChange={e => setFrom(e.target.value)} style={selStyle} />
        <span style={{ color: t.muted, fontSize: '0.8rem' }}>–</span>
        <input type="date" value={to} min={from} onChange={e => setTo(e.target.value)} style={selStyle} />
        <select value={fighter} onChange={e => setFighter(e.target.value)} style={selStyle}>
          <option value="">🥊 Semua fighter</option>
          {(data?.fighters || []).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <select value={ship} onChange={e => setShip(e.target.value)} style={selStyle}>
          <option value="all">🚚 Semua status</option>
          <option value="problem">❌ Perlu dibetulkan</option>
          <option value="stuck">⏰ Tersangkut (&gt;{data?.stuck_hours || 48}j)</option>
          {Object.entries(SHIP).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <select value={pay} onChange={e => setPay(e.target.value)} style={selStyle}>
          <option value="all">💳 Semua bayaran</option>
          {Object.entries(PAY).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <select value={product} onChange={e => setProduct(e.target.value)} style={selStyle}>
          <option value="all">📦 Semua produk</option>
          {Object.entries(PRODUCT).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <input style={{ ...inputStyle(t), maxWidth: 240, marginLeft: 'auto' }} placeholder="Cari nama, telefon, tracking..." value={q} onChange={e => setQ(e.target.value)} />
      </div>
      {q && <div style={{ fontSize: '0.74rem', color: t.muted, margin: '-0.5rem 0 0.75rem' }}>Carian merangkumi semua tarikh.</div>}

      {error && <div style={{ color: t.bad, marginBottom: '0.75rem' }}>{error}</div>}
      {!data ? <div style={{ color: t.muted }}>Memuatkan...</div> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.6rem', marginBottom: '1rem' }}>
            <Stat t={t} label="Jumlah jualan" value={rm(tot.sales)} sub={`${tot.sale_orders} order sah`} color={t.ok} />
            <Stat t={t} label="COD" value={rm(tot.cod)} sub={`FPX ${rm(tot.fpx)}`} />
            <Stat t={t} label="Semua order" value={tot.orders} sub={`${tot.pending_pay} belum bayar`} />
            <Stat t={t} label="Return / Batal" value={`${tot.returned} / ${tot.cancelled}`} color={tot.returned ? t.warn : undefined} />
            <Stat t={t} label="Tersangkut" value={data.stuck_count} sub={`dah bayar, tiada waybill >${data.stuck_hours}j`} color={data.stuck_count ? t.bad : t.ok} />
          </div>

          {data.summary.length > 0 && (
            <Card t={t} title="📊 Jualan setiap fighter" sub={`${data.from} hingga ${data.to} · jualan = order dah bayar / COD sah, tolak batal & return`}>
              <div style={{ overflowX: 'auto', contain: 'inline-size' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ color: t.muted, textAlign: 'left' }}>
                      {['Fighter', 'Order', 'Sah', 'Jualan', 'COD', 'FPX', 'Belum bayar', 'Perlu waybill', 'Return', 'Batal', ''].map(h => (
                        <th key={h} style={{ padding: '0.35rem 0.5rem', borderBottom: t.border, fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.summary.map(f => (
                      <tr key={f.fighter_id} style={{ background: fighter === f.fighter_id ? t.subBg : undefined }}>
                        <td style={{ padding: '0.4rem 0.5rem', fontWeight: 700 }}>{f.name}</td>
                        <td style={{ padding: '0.4rem 0.5rem' }}>{f.orders}</td>
                        <td style={{ padding: '0.4rem 0.5rem' }}>{f.sale_orders}</td>
                        <td style={{ padding: '0.4rem 0.5rem', fontWeight: 800, color: t.ok }}>{rm(f.sales)}</td>
                        <td style={{ padding: '0.4rem 0.5rem' }}>{rm(f.cod)}</td>
                        <td style={{ padding: '0.4rem 0.5rem' }}>{rm(f.fpx)}</td>
                        <td style={{ padding: '0.4rem 0.5rem' }}>{f.pending_pay || '—'}</td>
                        <td style={{ padding: '0.4rem 0.5rem', color: f.stuck ? t.bad : undefined }}>{f.waiting || '—'}{f.stuck ? ` (⏰${f.stuck})` : ''}</td>
                        <td style={{ padding: '0.4rem 0.5rem' }}>{f.returned || '—'}</td>
                        <td style={{ padding: '0.4rem 0.5rem' }}>{f.cancelled || '—'}</td>
                        <td style={{ padding: '0.4rem 0.5rem' }}>
                          <button style={{ ...btnStyle(t.accent, false), padding: '0.2rem 0.55rem', fontSize: '0.72rem' }}
                            onClick={() => setFighter(fighter === f.fighter_id ? '' : f.fighter_id)}>{fighter === f.fighter_id ? 'Semua' : 'Tapis'}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {Object.keys(data.by_product).length > 0 && (
                <div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap', marginTop: '0.6rem', fontSize: '0.76rem', color: t.text2 }}>
                  {Object.entries(data.by_product).map(([k, p]) => <span key={k}>{PRODUCT[k] || k}: <strong style={{ color: t.text }}>{rm(p.sales)}</strong> ({p.orders})</span>)}
                </div>
              )}
            </Card>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: t.text2 }}>{rows.length}{rows.length >= 500 ? '+' : ''} order</span>
            {pushable.length > 0 && (
              <>
                <button style={{ ...btnStyle(t.accent, false), padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                  onClick={() => setSel(sel2.length === pushable.length ? new Set() : new Set(pushable.map(o => o.id)))}>
                  {sel2.length === pushable.length ? 'Nyahpilih' : `Pilih semua perlu waybill (${pushable.length})`}
                </button>
                <button style={{ ...btnStyle('#0EA5E9'), padding: '0.4rem 0.75rem', fontSize: '0.78rem' }} disabled={!sel2.length || !!busy} onClick={() => pushNv(sel2)}>
                  {busy === 'push' ? 'Menghantar...' : `🚚 Hantar ke NinjaVan (${sel2.length})`}
                </button>
              </>
            )}
            {data.nv_env !== 'live' && <span style={{ fontSize: '0.72rem', color: t.warn, fontWeight: 700 }}>⚠️ NinjaVan SANDBOX</span>}
          </div>
          {msg && <div style={{ fontSize: '0.82rem', marginBottom: '0.75rem', color: msg.ok ? t.ok : t.bad }}>{msg.ok ? '✅' : '⚠️'} {msg.text}</div>}

          {!rows.length ? <Card t={t}><div style={{ color: t.muted, textAlign: 'center' }}>Tiada order.</div></Card> : (
            <Card t={t} style={{ padding: '0.4rem 1rem' }}>
              {rows.map((o, i) => {
                const [shipLbl, shipOk] = SHIP[o.ship_status] || [o.ship_status];
                return (
                  <div key={o.id} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', padding: '0.6rem 0', borderTop: i ? t.border : 'none' }}>
                    <div style={{ width: 16, paddingTop: 3 }}>
                      {canPush(o) && <input type="checkbox" checked={sel.has(o.id)} onChange={() => toggle(o.id)} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <strong>{o.full_name}</strong><span style={{ color: t.muted }}>· {o.phone}</span>
                        <Badge ok={shipOk}>{shipLbl}</Badge>
                        <Badge ok={o.payment_status === 'completed' ? true : o.payment_status === 'pending' ? undefined : false}>
                          {o.payment_type === 'cod' ? 'COD' : 'FPX'} · {PAY[o.payment_status] || o.payment_status}
                        </Badge>
                        {o.stuck && <Badge ok={false}>⏰ Tersangkut</Badge>}
                        {o.courier === 'own' && <Badge>NinjaVan sendiri</Badge>}
                      </div>
                      <div style={{ fontSize: '0.78rem', marginTop: '0.15rem' }}>
                        <span style={{ color: t.accent, fontWeight: 700 }}>🥊 {o.fighter_name}</span>
                        <span style={{ color: t.text2 }}> · {PRODUCT[o.source] || 'Sabun'} — {pakejOf(o) || (o.items || []).map(x => `${x.label} x${x.qty}`).join(' + ') || `${o.qty || ''} unit`}</span>
                        <strong> · {rm(o.amount)}</strong>
                        <span style={{ color: t.muted }}> · {fmtTime(o.created_at)}</span>
                      </div>
                      <div style={{ fontSize: '0.73rem', color: t.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', contain: 'inline-size' }}>{o.address}</div>
                      {(o.nv || o.tracking_no) && (
                        <div style={{ fontSize: '0.72rem', marginTop: '0.15rem', fontWeight: 700, color: o.nv?.error ? t.bad : t.text2 }}>
                          🚚 {o.nv?.tracking_number || o.tracking_no}
                          {o.nv && ` · ${o.nv.status === 'Pickup Exception' ? 'Gagal pickup (jadual semula)' : NV_GROUP[o.nv.group] || o.nv.status}`}
                          {o.nv?.printed_at && ` · 🖨️ dah print`}
                          {o.nv?.cod_remitted_at && ` · 💵 COD diterima`}
                          {o.nv?.error && ` · ${o.nv.error}`}
                          {!o.nv && o.waybill_path && ' · waybill fighter (PDF)'}
                        </div>
                      )}
                      {o.ship_status === 'ready' && o.nv?.active && !o.nv.cancellable && (
                        <div style={{ fontSize: '0.72rem', marginTop: '0.2rem', fontWeight: 700, color: t.bad }}>
                          ⚠️ Parcel dah diambil kurier tapi belum ditanda &quot;Dah pack&quot; — stok belum ditolak & fighter belum dicaj.{' '}
                          <a href="/dashboard/admin/fighter-packing" style={{ color: t.accent }}>Tanda di Packing Fighter →</a>
                        </div>
                      )}
                      <ShippingIssues order={o} compact />
                      {o.packed_at && <div style={{ fontSize: '0.7rem', color: t.muted }}>Dipack {fmtTime(o.packed_at)}{o.returned_at ? ` · Return ${fmtTime(o.returned_at)}` : ''}</div>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'stretch' }}>
                      {canEdit(o) && (
                        <button style={{ ...btnStyle(o.nv_error || o.ship_check?.errors?.length ? t.bad : o.ship_check ? t.warn : t.muted, !!(o.nv_error || o.ship_check?.errors?.length)), padding: '0.28rem 0.6rem', fontSize: '0.72rem' }}
                          disabled={!!busy} onClick={() => setEditing(o)}>✏️ Betulkan</button>
                      )}
                      {canPush(o) && (
                        <button style={{ ...btnStyle('#0EA5E9', false), padding: '0.28rem 0.6rem', fontSize: '0.72rem' }} disabled={!!busy} onClick={() => pushNv([o.id])}>🚚 Hantar NV</button>
                      )}
                      {o.ship_status === 'ready' && o.nv?.cancellable && (
                        <button style={{ ...btnStyle(t.warn, false), padding: '0.28rem 0.6rem', fontSize: '0.72rem' }} disabled={!!busy} onClick={() => cancelNv(o)}>
                          {busy === `cancel_nv${o.id}` ? '...' : '✖ Batal parcel'}
                        </button>
                      )}
                      {['new', 'ready'].includes(o.ship_status) && (!o.nv?.active || o.nv.cancellable) && (
                        <button style={{ ...btnStyle(t.bad, false), padding: '0.28rem 0.6rem', fontSize: '0.72rem' }} disabled={!!busy} onClick={() => cancelOrder(o)}>
                          {busy === `cancel_order${o.id}` ? '...' : '🗑 Batal order'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </Card>
          )}
        </>
      )}

      {editing && (
        <EditShippingModal order={editing} save={saveShipping} onClose={() => setEditing(null)}
          onDone={m => { if (m) setMsg({ ok: true, text: m }); load(); }}
          canPush={editing.payment_status === 'completed' && editing.courier !== 'own'}
          t={{ cardBg: t.cardBg, subBg: t.subBg, border: t.border, text: t.text, text2: t.text2, muted: t.muted, ff: t.ff }} />
      )}
    </div>
  );
}

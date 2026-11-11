'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useFighterTheme, Card, Badge, rm, inputStyle, btnStyle, fmtTime } from '@/components/fighter/ui';
import { openMergedWaybills } from '@/lib/ninjavan/waybill-client';

// Fighter — Order sendiri.
// Kurier HQ (lalai): order masuk → 🚀 Hantar ke NinjaVan (akaun HQ, pickup di HQ) → HQ cetak waybill & pack → stok + pos dicaj.
// Akaun sendiri: export CSV → upload ke akaun NinjaVan anda → upload PDF waybill di sini → HQ cetak & pack.

const NV_GROUPS = {
  pending_pickup: { label: 'Menunggu Pickup', color: '#F59E0B', icon: '⏳' },
  in_transit:     { label: 'Dalam Perjalanan', color: '#3B82F6', icon: '🚚' },
  exception:      { label: 'Gagal Hantar', color: '#EF4444', icon: '⚠️' },
  delivered:      { label: 'Delivered', color: '#10B981', icon: '✅' },
  returned:       { label: 'Return', color: '#8B5CF6', icon: '↩️' },
  cancelled:      { label: 'Parcel dibatal', color: '#94A3B8', icon: '🚫' },
  failed:         { label: 'Gagal dihantar', color: '#EF4444', icon: '❌' },
};
const NV_BATCH = 10;

const TABS = [
  { id: 'new',       label: '🆕 Perlu dihantar', ship: 'new', pay: 'completed' },
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

  const hqCourier = (data?.courier || 'hq') === 'hq';

  const pushNv = async () => {
    const ids = [...sel];
    if (!ids.length) return;
    if (!confirm(`Hantar ${ids.length} order ke NinjaVan HQ${data?.nv_env === 'sandbox' ? ' (SANDBOX — ujian)' : ''}?\n\nParcel diambil di HQ. Caj pos RM4.50 / parcel (+RM2 jika COD) masuk bil anda bila HQ pack.`)) return;
    setBusy('nv'); setMsg(null);
    let sent = 0;
    const errors = [];
    try {
      for (let i = 0; i < ids.length; i += NV_BATCH) {
        const j = await (await fetch('/api/fighter/ninjavan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'push', ids: ids.slice(i, i + NV_BATCH) }) })).json();
        if (!j.results) { errors.push(j.error || 'Ralat'); break; }
        for (const r of j.results) {
          if (r.ok) sent++;
          else errors.push(`${rows.find(o => o.id === r.id)?.full_name || r.id}: ${r.error}`);
        }
      }
      setMsg({ ok: !errors.length, text: `${sent} order dihantar ke NinjaVan — HQ akan cetak waybill & pack.${errors.length ? ` ${errors.length} gagal — ${errors.slice(0, 3).join(' | ')}` : ''}` });
    } catch { setMsg({ ok: false, text: 'Ralat rangkaian. Sila cuba lagi.' }); }
    finally { setBusy(''); await load(); }
  };

  const printNv = ids => {
    const list = ids.filter(id => rows.find(o => o.id === id)?.nv?.active);
    if (!list.length) return setMsg({ ok: false, text: 'Tiada parcel NinjaVan untuk order dipilih.' });
    openMergedWaybills(part => `/api/fighter/ninjavan?waybill=${part.join(',')}`, list)
      .then(({ errors }) => { if (errors.length) setMsg({ ok: false, text: errors.slice(0, 2).join(' | ') }); })
      .catch(e => setMsg({ ok: false, text: `Gagal sediakan waybill: ${e.message}` }));
  };

  const cancelNv = async o => {
    if (!confirm(`Batal parcel NinjaVan ${o.nv?.tracking_number} (${o.full_name})?\n\nOrder kembali ke "Perlu dihantar" & boleh dihantar semula.`)) return;
    const j = await (await fetch('/api/fighter/ninjavan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'cancel', id: o.id }) })).json();
    if (!j.success) alert(j.error); else { setMsg({ ok: true, text: `Parcel ${j.tracking_number} dibatalkan.` }); load(); }
  };

  const cancel = async o => {
    if (!confirm(`Batalkan order ${o.full_name}?${o.nv?.active ? '\n\nParcel NinjaVan juga akan dibatalkan.' : ''}${o.payment_type === 'fpx_payment' ? '\n\nFPX dah dibayar — refund pelanggan melalui portal CHIP anda.' : ''}`)) return;
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
        {hqCourier ? (
          <div style={{ fontSize: '0.78rem', color: t.text2, lineHeight: 1.75 }}>
            1️⃣ Tab <strong>Perlu dihantar</strong> → pilih order → <strong>🚀 Hantar ke NinjaVan</strong> (akaun NinjaVan HQ, pickup di HQ)<br />
            2️⃣ HQ cetak waybill, pack & serah ke NinjaVan — status parcel dikemaskini automatik (lihat <strong>Pos & COD</strong>)<br />
            3️⃣ Bila HQ pack: stok + pos <strong>RM4.50 / parcel (+RM2 COD)</strong> dicaj ke bil anda<br />
            4️⃣ COD pelanggan diterima HQ dari NinjaVan → <strong>dikreditkan</strong> ke bil anda (lihat <strong>Stok & Bil</strong>)
          </div>
        ) : (
          <div style={{ fontSize: '0.78rem', color: t.text2, lineHeight: 1.75 }}>
            1️⃣ Tab <strong>Perlu dihantar</strong> → pilih order → <strong>Export CSV</strong><br />
            2️⃣ Upload CSV ke <strong>akaun NinjaVan anda</strong> (alamat pickup: HQ E-Syifa') → muat turun PDF waybill<br />
            3️⃣ Pilih order yang sama → <strong>Upload waybill</strong> → HQ cetak, pack & serah ke NinjaVan<br />
            4️⃣ Bila HQ pack, stok dicaj ke akaun anda (lihat <strong>Stok & Bil</strong>) · tukar ke NinjaVan HQ di <strong>Tetapan Akaun</strong>
          </div>
        )}
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
            {hqCourier ? (
              <>
                {tab === 'new' && <button style={btnStyle('#DC2626')} disabled={!sel.size || !!busy} onClick={pushNv}>{busy === 'nv' ? '⏳ Menghantar...' : `🚀 Hantar ke NinjaVan (${sel.size})`}</button>}
                {tab === 'ready' && <button style={btnStyle('#0EA5E9')} disabled={!sel.size || !!busy} onClick={() => printNv([...sel])}>🖨️ Waybill ({sel.size})</button>}
              </>
            ) : (
              <>
                <button style={btnStyle()} disabled={!sel.size || !!busy} onClick={exportCsv}>{busy === 'csv' ? 'Menjana...' : `⬇️ Export CSV (${sel.size})`}</button>
                <button style={btnStyle('#0EA5E9')} disabled={!sel.size || !!busy} onClick={() => fileRef.current?.click()}>{busy === 'wb' ? 'Memuat naik...' : `📄 Upload waybill (${sel.size})`}</button>
                <input ref={fileRef} type="file" accept="application/pdf,image/*" style={{ display: 'none' }} onChange={e => uploadWaybill(e.target.files?.[0])} />
              </>
            )}
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
                {o.nv && NV_GROUPS[o.nv.group] && (o.nv.active || o.ship_status !== 'new') && (() => {
                  const g = NV_GROUPS[o.nv.group];
                  return (
                    <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.3rem' }} title={o.nv.error || o.nv.event || o.nv.status}>
                      <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem', borderRadius: 8, background: `${g.color}1A`, border: `1px solid ${g.color}55`, color: g.color, fontWeight: 700 }}>{g.icon} {g.label}</span>
                      {o.nv.tracking_number && <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: t.text2 }}>{o.nv.tracking_number}</span>}
                      <span style={{ fontSize: '0.68rem', color: t.muted }}>{o.nv.error ? o.nv.error.slice(0, 90) : `${o.nv.event && o.nv.event !== o.nv.status ? `${o.nv.event} · ` : ''}${fmtTime(o.nv.last_event_at)}`}</span>
                      {o.nv.group === 'delivered' && o.nv.cod_amount > 0 && (
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: o.nv.cod_remitted_at ? t.ok : '#F97316' }}>
                          {o.nv.cod_remitted_at ? `🏦 COD dikreditkan ${fmtTime(o.nv.cod_remitted_at)}` : '💸 COD belum diterima HQ'}
                        </span>
                      )}
                    </div>
                  );
                })()}
                {o.nv?.group === 'failed' && o.ship_status === 'new' && (
                  <div style={{ fontSize: '0.7rem', color: t.bad, marginTop: '0.25rem' }}>❌ Gagal dihantar: {o.nv.error}</div>
                )}
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
                {o.nv?.active && <button style={{ ...btnStyle('#0EA5E9', false), padding: '0.3rem 0.6rem', fontSize: '0.74rem' }} onClick={() => printNv([o.id])}>🖨️ Waybill</button>}
                {o.nv?.active && o.ship_status === 'ready' && (
                  <button style={{ ...btnStyle(t.warn, false), padding: '0.3rem 0.6rem', fontSize: '0.74rem' }} onClick={() => cancelNv(o)}>🚫 Batal parcel</button>
                )}
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

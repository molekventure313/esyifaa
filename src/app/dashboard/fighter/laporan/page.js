'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import Link from 'next/link';
import { useFighterTheme, Card, rm, btnStyle } from '@/components/fighter/ui';

// Fighter — Laporan Saya: untung rugi bulanan + pecahan harian ikut produk.
// Ads: auto dari Meta (Ads Hub, +SST 8%) atau isi manual setiap hari × produk.

function monthOptions(count = 12) {
  const now = new Date(Date.now() + 8 * 3600 * 1000);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    return { key, label: d.toLocaleString('ms-MY', { month: 'long', year: 'numeric', timeZone: 'UTC' }) };
  });
}
const dayLabel = d => new Date(`${d}T00:00:00Z`).toLocaleDateString('ms-MY', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
const roasTxt = v => (v == null ? '—' : `${v.toFixed(2)}x`);

function Stat({ t, label, value, sub, color }) {
  return (
    <div style={{ background: t.cardBg, border: t.border, borderRadius: 10, padding: '0.85rem 1rem' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: color || t.text, marginTop: '0.2rem' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: t.muted, marginTop: '0.15rem' }}>{sub}</div>}
    </div>
  );
}

function AdsInput({ t, value, disabled, onSave }) {
  const [v, setV] = useState(value ? String(value) : '');
  const [state, setState] = useState('');
  useEffect(() => { setV(value ? String(value) : ''); }, [value]);
  const save = async () => {
    const cur = value ? String(value) : '';
    if (v.trim() === cur) return;
    setState('…');
    const ok = await onSave(v.trim());
    setState(ok ? '✓' : '✕');
    setTimeout(() => setState(''), 1500);
  };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <input type="number" min="0" step="0.01" inputMode="decimal" value={v} disabled={disabled} placeholder="0"
        onChange={e => setV(e.target.value)} onBlur={save} onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
        aria-label="Kos ads (RM)"
        style={{ width: 84, padding: '0.3rem 0.45rem', borderRadius: 6, border: t.border, background: t.subBg, color: t.text, fontSize: '0.8rem', textAlign: 'right' }} />
      <span style={{ width: 12, fontSize: '0.75rem', color: state === '✕' ? t.bad : t.ok }}>{state}</span>
    </span>
  );
}

export default function FighterReportPage() {
  const t = useFighterTheme();
  const months = monthOptions();
  const [month, setMonth] = useState(months[0].key);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const j = await fetch(`/api/fighter/report?month=${month}`).then(r => r.json());
      if (j.success) setData(j.data); else setError(j.error);
    } catch { setError('Gagal muatkan laporan.'); }
  }, [month]);
  useEffect(() => { setData(null); load(); }, [load]);

  const setAuto = async auto => {
    setBusy(true); setMsg('');
    try {
      const j = await fetch('/api/ads-hub/connection', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ auto_ads_spend: auto }) }).then(r => r.json());
      if (!j.success) setMsg(j.error || 'Gagal tukar tetapan.');
      else if (auto) setMsg(j.spend?.ok === false ? `Auto dihidupkan, tapi isian gagal: ${j.spend.error}` : 'Auto dihidupkan — ads diisi dari Meta (+SST 8%) dan dikemas kini setiap jam.');
      else setMsg('Ditukar ke isi manual. Angka auto sedia ada kekal, boleh diubah.');
    } catch { setMsg('Gagal tukar tetapan.'); }
    setBusy(false);
    load();
  };

  const saveAds = async (spend_date, product, amount) => {
    try {
      const j = await fetch('/api/fighter/report', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ spend_date, product, amount }) }).then(r => r.json());
      if (!j.success) { setMsg(j.error); return false; }
      load();
      return true;
    } catch { return false; }
  };

  const th = { padding: '0.55rem 0.7rem', fontSize: '0.7rem', fontWeight: 700, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right', whiteSpace: 'nowrap' };
  const td = { padding: '0.5rem 0.7rem', fontSize: '0.82rem', textAlign: 'right', whiteSpace: 'nowrap', borderTop: t.border };
  const profitColor = v => (v > 0 ? t.ok : v < 0 ? t.bad : t.text2);

  const T = data?.totals;
  const auto = !!data?.ads.auto;
  const margin = T && T.sales > 0 ? Math.round((T.profit / T.sales) * 100) : null;

  return (
    <div style={{ fontFamily: t.ff, color: t.text, maxWidth: 1100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.1rem' }}>
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>PORTAL FIGHTER</div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0.15rem 0 0' }}>📊 Laporan Saya</h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: t.text2 }}>Untung rugi anda sendiri: sales − kos stok HQ − pos − ads.</p>
        </div>
        <select value={month} onChange={e => setMonth(e.target.value)} aria-label="Bulan"
          style={{ padding: '0.5rem 0.7rem', borderRadius: 7, border: t.border, background: t.cardBg, color: t.text, fontSize: '0.85rem', fontFamily: t.ff }}>
          {months.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
        </select>
      </div>

      {error && <Card t={t}><div style={{ color: t.bad, fontSize: '0.85rem' }}>{error}</div></Card>}
      {!data && !error && <div style={{ color: t.muted, fontSize: '0.85rem' }}>Memuatkan...</div>}

      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.65rem', marginBottom: '1rem' }}>
            <Stat t={t} label="Sales" value={rm(T.sales)} sub={`${T.orders} order${T.returns ? ` · ${T.returns} return` : ''}`} />
            <Stat t={t} label="Kos stok HQ" value={rm(T.stock)} sub="Harga stok HQ (kos + markup)" />
            <Stat t={t} label="Pos" value={rm(T.postage)} sub={T.returnCost ? `+ kos return ${rm(T.returnCost)}` : 'RM4.50 / parcel, +RM2 COD'} />
            <Stat t={t} label="Ads" value={rm(T.ads)} sub={`ROAS ${roasTxt(T.roas)}`} color="#60A5FA" />
            <Stat t={t} label="Untung bersih" value={rm(T.profit)} sub={margin == null ? '—' : `${margin}% dari sales`} color={profitColor(T.profit)} />
          </div>
          {T.estimated > 0 && (
            <div style={{ fontSize: '0.75rem', color: t.warn, margin: '-0.4rem 0 1rem' }}>
              ≈ {T.estimated} order belum dipack HQ: kos stok & pos masih anggaran (harga semasa). Angka jadi tepat selepas HQ pack.
            </div>
          )}

          <Card t={t} title="💸 Kos ads"
            sub={auto ? 'Diisi automatik dari akaun Meta anda (Ads Hub) termasuk SST 8%, ikut produk setiap campaign. Dikemas kini setiap jam.'
              : 'Isi kos ads sendiri setiap hari ikut produk (klik tarikh dalam jadual di bawah). Masukkan jumlah termasuk SST.'}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button disabled={busy || !data.ads.connected || auto} onClick={() => setAuto(true)} style={{ ...btnStyle(t.accent, auto), opacity: !data.ads.connected ? 0.5 : 1 }}>⚡ Auto dari Meta</button>
              <button disabled={busy || !auto} onClick={() => setAuto(false)} style={btnStyle(t.accent, !auto)}>✍️ Isi manual</button>
              {!data.ads.connected && (
                <span style={{ fontSize: '0.78rem', color: t.text2 }}>
                  Untuk auto, sambung akaun Meta dulu di <Link href="/dashboard/fighter/ads-hub" style={{ color: t.accent, fontWeight: 700 }}>📈 Ads Hub → Tetapan</Link>.
                </span>
              )}
              {auto && data.ads.last_synced_at && (
                <span style={{ fontSize: '0.75rem', color: t.muted }}>Sync terakhir: {new Date(data.ads.last_synced_at).toLocaleString('ms-MY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              )}
            </div>
            {auto && <div style={{ fontSize: '0.74rem', color: t.muted, marginTop: '0.55rem' }}>Produk setiap campaign boleh ditukar di Ads Hub → Tetapan. Isian manual untuk tarikh dari 1 Nov 2026 akan ditimpa angka Meta.</div>}
            {msg && <div style={{ fontSize: '0.8rem', color: t.text2, marginTop: '0.55rem' }}>{msg}</div>}
          </Card>

          <Card t={t} title="📦 Ikut produk">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>
                  <th style={{ ...th, textAlign: 'left' }}>Produk</th><th style={th}>Order</th><th style={th}>Sales</th><th style={th}>Kos stok + pos</th><th style={th}>Ads</th><th style={th}>Untung</th><th style={th}>ROAS</th>
                </tr></thead>
                <tbody>
                  {data.productSummary.map(p => (
                    <tr key={p.key}>
                      <td style={{ ...td, textAlign: 'left', fontWeight: 600 }}>{p.label}</td>
                      <td style={td}>{p.orders}</td><td style={td}>{rm(p.sales)}</td><td style={td}>{rm(p.cost)}</td>
                      <td style={{ ...td, color: '#60A5FA' }}>{rm(p.ads)}</td>
                      <td style={{ ...td, fontWeight: 700, color: profitColor(p.profit) }}>{rm(p.profit)}</td>
                      <td style={td}>{roasTxt(p.roas)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card t={t} title="📅 Pecahan harian" sub={auto ? 'Klik tarikh untuk lihat pecahan produk.' : 'Klik tarikh untuk pecahan produk & isi kos ads. ⚠️ = ada order tapi ads belum diisi.'}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>
                  <th style={{ ...th, textAlign: 'left' }}>Tarikh</th><th style={th}>Order</th><th style={th}>Sales</th><th style={th}>Kos stok + pos</th><th style={th}>Ads</th><th style={th}>Untung</th><th style={th}>ROAS</th>
                </tr></thead>
                <tbody>
                  {data.dailyBreakdown.filter(d => !d.isFuture).reverse().map(d => {
                    const isOpen = open === d.date;
                    const empty = !d.orders && !d.ads && !d.returns;
                    return (
                      <Fragment key={d.date}>
                        <tr onClick={() => setOpen(isOpen ? null : d.date)} style={{ cursor: 'pointer', background: isOpen ? t.subBg : 'transparent', opacity: empty && !isOpen ? 0.55 : 1 }}>
                          <td style={{ ...td, textAlign: 'left', fontWeight: 600 }}>
                            {isOpen ? '▾' : '▸'} {dayLabel(d.date)}{d.isToday && <span style={{ color: t.accent, fontSize: '0.7rem' }}> · hari ini</span>}
                            {!auto && d.missingAds && <span title="Ada order tapi ads belum diisi"> ⚠️</span>}
                          </td>
                          <td style={td}>{d.orders}{d.returns ? <span style={{ color: t.bad, fontSize: '0.72rem' }}> +{d.returns}R</span> : ''}</td>
                          <td style={td}>{rm(d.sales)}</td>
                          <td style={td}>{d.estimated ? '≈ ' : ''}{rm(d.cost)}</td>
                          <td style={{ ...td, color: '#60A5FA' }}>{rm(d.ads)}</td>
                          <td style={{ ...td, fontWeight: 700, color: profitColor(d.profit) }}>{rm(d.profit)}</td>
                          <td style={td}>{roasTxt(d.roas)}</td>
                        </tr>
                        {isOpen && d.products.map(p => (
                          <tr key={p.key} style={{ background: t.subBg }}>
                            <td style={{ ...td, textAlign: 'left', paddingLeft: '1.8rem', color: t.text2 }}>{p.label}</td>
                            <td style={td}>{p.orders}</td><td style={td}>{rm(p.sales)}</td><td style={td}>{rm(p.cost)}</td>
                            <td style={td}>
                              {!auto && p.editable
                                ? <AdsInput t={t} value={p.ads} onSave={v => saveAds(d.date, p.key, v)} />
                                : <span style={{ color: '#60A5FA' }}>{rm(p.ads)}</span>}
                            </td>
                            <td style={{ ...td, color: profitColor(p.profit) }}>{rm(p.profit)}</td>
                            <td style={td}>{roasTxt(p.roas)}</td>
                          </tr>
                        ))}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

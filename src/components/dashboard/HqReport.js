'use client';

import { useState, useEffect, useCallback } from 'react';

// Tab "Report HQ" (Laporan Marketer) — P&L penuh sebulan:
// Sales → kos produk/shipping/FPX → untung kasar → ads → gaji marketer → komitmen tetap → belanja lain → untung bersih

const CATEGORY_LABEL = { sewa: '🏢 Sewa', bil: '💡 Bil', langganan: '💻 Langganan', gaji: '👤 Gaji', lain: '🧾 Lain-lain' };

const rm = v => `RM ${(parseFloat(v) || 0).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function monthOptions(count = 12) {
  const now = new Date(Date.now() + 8 * 3600 * 1000);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    return { key, label: d.toLocaleString('ms-MY', { month: 'long', year: 'numeric', timeZone: 'UTC' }) };
  });
}

// ── Baris P&L ───────────────────────────────────────────────────────────────
function Line({ t, label, value, sub, minus, indent, muted }) {
  const { textPrimary, textSecondary, textMuted, red } = t;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: indent ? '0.3rem 0 0.3rem 1.25rem' : '0.5rem 0', fontSize: indent ? '0.8rem' : '0.9rem', color: muted || indent ? textSecondary : textPrimary }}>
      <span style={{ minWidth: 0 }}>{label}{sub && <span style={{ fontSize: '0.72rem', color: textMuted }}> · {sub}</span>}</span>
      <span style={{ whiteSpace: 'nowrap', fontWeight: indent ? 500 : 600, color: minus && !indent ? red : undefined }}>
        {minus && !indent ? '− ' : ''}{rm(value)}
      </span>
    </div>
  );
}
function Subtotal({ t, label, value, pct, big }) {
  const { lm, textMuted, green, red } = t;
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem',
      margin: '0.4rem 0 0.9rem', padding: big ? '1rem 1.1rem' : '0.6rem 0.8rem', borderRadius: '8px',
      background: value >= 0 ? (lm ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.1)') : (lm ? 'rgba(220,38,38,0.07)' : 'rgba(248,113,113,0.1)'),
      border: big ? `2px solid ${value >= 0 ? '#10B981' : '#EF4444'}` : 'none',
    }}>
      <span style={{ fontWeight: 800, fontSize: big ? '1rem' : '0.85rem', letterSpacing: '0.02em' }}>{label}</span>
      <span style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
        <strong style={{ fontSize: big ? '1.4rem' : '1rem', color: value >= 0 ? green : red }}>{rm(value)}</strong>
        {pct !== undefined && <span style={{ fontSize: '0.72rem', color: textMuted, marginLeft: '0.4rem' }}>({pct}%)</span>}
      </span>
    </div>
  );
}
function Section({ t, title, children, action }) {
  const { textMuted, rowBorder } = t;
  return (
    <div style={{ borderTop: rowBorder, paddingTop: '0.6rem', marginTop: '0.2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</div>
        {action}
      </div>
      {children}
    </div>
  );
}


export default function HqReport({ lm, cardBg, cardBorder, textPrimary, textSecondary, textMuted, ff }) {
  const months = monthOptions();
  const [month, setMonth]     = useState(months[0].key);
  const [data, setData]       = useState(null);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(true);
  const [showPayroll, setShowPayroll] = useState(false);
  const [form, setForm]       = useState(null);   // { id?, type, name, amount, category, start_month, month }
  const [saving, setSaving]   = useState(false);

  const green = lm ? '#047857' : '#34D399';
  const red   = lm ? '#DC2626' : '#F87171';
  const rowBorder = lm ? '1px solid #F1F5F9' : '1px solid rgba(255,255,255,0.05)';
  const inputSt = {
    padding: '0.45rem 0.6rem', borderRadius: '6px', fontSize: '0.82rem', fontFamily: ff,
    border: lm ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.15)',
    background: lm ? '#FFFFFF' : '#0B0D13', color: textPrimary, minWidth: 0,
  };
  const btn = (bg, color = '#fff') => ({
    padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, fontFamily: ff,
    border: 'none', cursor: 'pointer', background: bg, color,
  });

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res  = await fetch(`/api/admin/marketers/report?mode=hq&month=${month}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Gagal muatkan report');
      setData(json);
    } catch (e) { setError(e.message); setData(null); }
    finally { setLoading(false); }
  }, [month]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const body = {
        id: form.id, name: form.name, amount: form.amount, category: form.category, type: form.type,
        ...(form.type === 'one_off' ? { month: form.month || month } : { start_month: form.start_month || null }),
      };
      const res  = await fetch('/api/admin/hq-expenses', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setForm(null);
      await load();
    } catch (e) { alert(`Gagal simpan: ${e.message}`); }
    finally { setSaving(false); }
  };

  const remove = async (e) => {
    const msg = e.type === 'fixed'
      ? `Padam komitmen "${e.name}"? Ia akan hilang dari SEMUA bulan.\n\nKalau komitmen dah tamat, lebih baik tekan "Tamatkan" supaya bulan lepas kekal.`
      : `Padam belanja "${e.name}"?`;
    if (!confirm(msg)) return;
    const res = await fetch(`/api/admin/hq-expenses?id=${e.id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!json.success) return alert(`Gagal padam: ${json.error}`);
    load();
  };

  // Tamatkan komitmen tetap — kekal dikira hingga bulan sebelum bulan dipilih
  const endFixed = async (e) => {
    const [y, m] = month.split('-').map(Number);
    const prev = new Date(Date.UTC(y, m - 2, 1));
    const endMonth = `${prev.getUTCFullYear()}-${String(prev.getUTCMonth() + 1).padStart(2, '0')}`;
    if (!confirm(`Tamatkan "${e.name}"? Ia tidak lagi dikira mulai ${months.find(x => x.key === month)?.label || month}.`)) return;
    const res = await fetch('/api/admin/hq-expenses', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: e.id, end_month: endMonth }),
    });
    const json = await res.json();
    if (!json.success) return alert(`Gagal: ${json.error}`);
    load();
  };

  const expenseForm = () => form && (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', margin: '0.5rem 0', padding: '0.75rem', borderRadius: '8px', background: lm ? '#F8FAFC' : 'rgba(255,255,255,0.03)', border: cardBorder }}>
      <input style={{ ...inputSt, flex: '2 1 160px' }} placeholder={form.type === 'fixed' ? 'Nama (cth: Sewa Ofis)' : 'Nama (cth: Baiki printer)'}
        value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
      <input style={{ ...inputSt, flex: '1 1 100px' }} type="number" min="0" step="0.01" placeholder="RM"
        value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
      <select style={{ ...inputSt, flex: '1 1 120px' }} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
        {Object.entries(CATEGORY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      {form.type === 'fixed' && !form.id && (
        <label style={{ fontSize: '0.75rem', color: textSecondary, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          Mula
          <select style={inputSt} value={form.start_month || ''} onChange={e => setForm({ ...form, start_month: e.target.value })}>
            <option value="">Semua bulan</option>
            {months.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
        </label>
      )}
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <button onClick={save} disabled={saving || !form.name || form.amount === ''} style={{ ...btn('#10B981'), opacity: saving ? 0.6 : 1 }}>{saving ? '...' : 'Simpan'}</button>
        <button onClick={() => setForm(null)} style={btn(lm ? '#E2E8F0' : '#374151', lm ? '#334155' : '#fff')}>Batal</button>
      </div>
    </div>
  );

  const expenseRow = e => (
    <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', padding: '0.3rem 0 0.3rem 1.25rem', fontSize: '0.8rem', color: textSecondary }}>
      <span style={{ minWidth: 0 }}>
        {e.name} <span style={{ fontSize: '0.68rem', color: textMuted }}>{CATEGORY_LABEL[e.category] || ''}</span>
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
        <span>{rm(e.amount)}</span>
        <button title="Edit" onClick={() => setForm({ id: e.id, type: e.type, name: e.name, amount: e.amount, category: e.category || 'lain' })}
          style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}>✏️</button>
        {e.type === 'fixed' && (
          <button title="Tamatkan mulai bulan ini" onClick={() => endFixed(e)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.7rem', padding: 0, color: textMuted, textDecoration: 'underline' }}>Tamatkan</button>
        )}
        <button title="Padam" onClick={() => remove(e)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}>🗑</button>
      </span>
    </div>
  );

  const t = { lm, textPrimary, textSecondary, textMuted, green, red, rowBorder };
  const d = data;
  const pct = v => (d?.sales.revenue > 0 ? ((v / d.sales.revenue) * 100).toFixed(1) : '0.0');
  const payroll = d?.payroll;

  return (
    <div>
      {/* Pilih bulan */}
      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <select value={month} onChange={e => setMonth(e.target.value)} style={{ ...inputSt, fontWeight: 700 }}>
          {months.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
        </select>
        <span style={{ fontSize: '0.75rem', color: textMuted }}>Semua sales HQ + marketer · order return tidak dikira</span>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: textMuted }}>Memuatkan Report HQ...</div>
      ) : error ? (
        <div style={{ padding: '1.25rem', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: red, fontSize: '0.85rem' }}>⚠️ {error}</div>
      ) : d && (
        <>
          {/* Kad ringkasan */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {[
              { label: '💰 Jumlah Sales', val: d.sales.revenue, sub: `${d.sales.orders} order`, color: green },
              { label: '📊 Untung Kasar', val: d.gross_profit, sub: `${pct(d.gross_profit)}% margin`, color: d.gross_profit >= 0 ? green : red },
              { label: '💸 Jumlah Perbelanjaan', val: d.total_expenses, sub: `${pct(d.total_expenses)}% dari sales`, color: red },
              { label: '✅ Untung Bersih', val: d.net_profit, sub: `${pct(d.net_profit)}% margin`, color: d.net_profit >= 0 ? green : red },
            ].map(c => (
              <div key={c.label} style={{ background: cardBg, border: cardBorder, borderRadius: '10px', padding: '1rem 1.1rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: textSecondary }}>{c.label}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: c.color, marginTop: '0.3rem' }}>{rm(c.val)}</div>
                <div style={{ fontSize: '0.72rem', color: textMuted, marginTop: '0.15rem' }}>{c.sub}</div>
              </div>
            ))}
          </div>

          {/* P&L */}
          <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', padding: '1.25rem 1.4rem', maxWidth: '760px' }}>
            <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 800 }}>🏢 Untung Rugi HQ — {months.find(m => m.key === d.month)?.label || d.month}</h2>

            <Section t={t} title="Sales">
              <Line t={t} label="💰 Jumlah Sales" value={d.sales.revenue} sub={`${d.sales.orders} order`} />
              <Line t={t} indent label="🌐 Web" value={d.sales.web_revenue} sub={`${d.sales.web_orders} order`} />
              <Line t={t} indent label="💬 WhatsApp" value={d.sales.wa_revenue} sub={`${d.sales.wa_orders} order`} />
              <Line t={t} indent label="🏢 Sales HQ" value={d.sales.hq_revenue} sub={`${d.sales.hq_orders} order`} />
              <Line t={t} indent label="👥 Sales Marketer" value={d.sales.marketer_revenue} sub={`${d.sales.marketer_orders} order`} />
            </Section>

            <Section t={t} title="Kos Jualan">
              <Line t={t} minus label="📦 Kos produk (COGS)" value={d.cogs.product} />
              <Line t={t} minus label="🚚 Kos shipping" value={d.cogs.postage} sub="FPX RM4 · COD RM6" />
              <Line t={t} minus label="💳 Caj FPX" value={d.cogs.fpx_fee} sub={`${d.cogs.fpx_count} transaksi × RM${d.cogs.fpx_fee_each}`} />
              {d.cogs.returned_count > 0 && (
                <Line t={t} minus label="🔁 Shipping order return" value={d.cogs.return_postage} sub={`${d.cogs.returned_count} order`} />
              )}
              <Subtotal t={t} label="UNTUNG KASAR" value={d.gross_profit} pct={pct(d.gross_profit)} />
            </Section>

            <Section t={t} title="Iklan">
              <Line t={t} minus label="📣 Kos Ads" value={d.ads.total} />
              <Line t={t} indent label="🏢 HQ" value={d.ads.hq} />
              <Line t={t} indent label="👥 Marketer" value={d.ads.marketer} />
              <Subtotal t={t} label="UNTUNG SELEPAS ADS" value={d.after_ads} pct={pct(d.after_ads)} />
            </Section>

            <Section t={t} title="Gaji Marketer"
              action={payroll.rows.length > 0 && (
                <button onClick={() => setShowPayroll(v => !v)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, color: lm ? '#3B82F6' : '#60A5FA', fontFamily: ff }}>
                  {showPayroll ? '▲ Sembunyi' : `▼ Lihat ${payroll.rows.length} marketer`}
                </button>
              )}>
              <Line t={t} minus label="👥 Gaji asas" value={payroll.basic} sub="semua marketer aktif (teamsale tiada basic)" />
              <Line t={t} minus label="🎯 Komisen" value={payroll.komisen} sub="marketer 5%/10% · teamsale 30% · override ketua 10%" />
              {showPayroll && (
                <div style={{ overflowX: 'auto', margin: '0.4rem 0 0.6rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', fontFamily: ff }}>
                    <thead>
                      <tr style={{ color: textMuted, textAlign: 'right' }}>
                        {['Marketer', 'Profit', 'Kadar', 'Komisen', 'Basic', 'Jumlah'].map((h, i) => (
                          <th key={h} style={{ padding: '0.4rem 0.6rem', textAlign: i === 0 ? 'left' : 'right', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payroll.rows.map(p => (
                        <tr key={p.id} style={{ borderTop: rowBorder, color: textSecondary }}>
                          <td style={{ padding: '0.4rem 0.6rem', color: textPrimary, fontWeight: 600 }}>
                            {p.is_teamsale && <span style={{ color: textMuted }}>↳ </span>}{p.name}
                            {p.is_teamsale && <span style={{ fontSize: '0.68rem', color: '#8B5CF6', marginLeft: '0.3rem' }}>teamsale</span>}
                            {p.override > 0 && <div style={{ fontSize: '0.68rem', color: textMuted, fontWeight: 400 }}>termasuk override {rm(p.override)}</div>}
                          </td>
                          <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right', whiteSpace: 'nowrap', color: p.profit >= 0 ? green : red }}>{rm(p.profit)}</td>
                          <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>{p.commission_pct}%</td>
                          <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right', whiteSpace: 'nowrap' }}>{rm(p.komisen)}</td>
                          <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right', whiteSpace: 'nowrap' }}>{rm(p.basic)}</td>
                          <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 700, color: textPrimary }}>{rm(p.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            <Section t={t} title="Komitmen Tetap (bulanan)"
              action={<button onClick={() => setForm({ type: 'fixed', name: '', amount: '', category: 'sewa', start_month: '' })} style={btn('#3B82F6')}>+ Tambah komitmen</button>}>
              {form?.type === 'fixed' && expenseForm()}
              <Line t={t} minus label="🏢 Jumlah komitmen tetap" value={d.expenses.fixed_total} />
              {d.expenses.fixed.map(expenseRow)}
              {d.expenses.fixed.length === 0 && <div style={{ padding: '0.3rem 0 0.3rem 1.25rem', fontSize: '0.78rem', color: textMuted }}>Tiada komitmen tetap.</div>}
            </Section>

            <Section t={t} title="Belanja Lain (bulan ini sahaja)"
              action={<button onClick={() => setForm({ type: 'one_off', name: '', amount: '', category: 'lain', month })} style={btn('#3B82F6')}>+ Tambah belanja</button>}>
              {form?.type === 'one_off' && expenseForm()}
              <Line t={t} minus label="🧾 Jumlah belanja lain" value={d.expenses.one_off_total} />
              {d.expenses.one_off.map(expenseRow)}
            </Section>

            <div style={{ borderTop: `2px dashed ${lm ? '#CBD5E1' : 'rgba(255,255,255,0.15)'}`, marginTop: '0.75rem', paddingTop: '0.75rem' }}>
              <Subtotal t={t} big label="✅ UNTUNG BERSIH SEBENAR" value={d.net_profit} pct={pct(d.net_profit)} />
              <div style={{ fontSize: '0.72rem', color: textMuted, lineHeight: 1.5 }}>
                Selepas tolak kos produk, shipping, caj FPX, ads, gaji & komisen semua marketer, komitmen tetap dan belanja lain.
                Kos produk ikut purata kos stok semasa.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

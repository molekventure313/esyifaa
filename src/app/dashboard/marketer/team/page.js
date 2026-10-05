'use client';

import { useState, useEffect, useCallback } from 'react';
import DailyProductTable, { ProductSummaryTable, formatRM } from '@/components/dashboard/DailyProductTable';

// Team Saya — ketua marketer urus teamsale: tambah akaun, prestasi, isi kos ads, lihat order.

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

const thisMonth = () => {
  const d = new Date(Date.now() + 8 * 3600 * 1000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};
const monthLabel = m => new Date(`${m}-01T12:00:00Z`).toLocaleString('ms-MY', { month: 'long', year: 'numeric' });
const shiftMonth = (m, n) => {
  const [y, mo] = m.split('-').map(Number);
  const d = new Date(Date.UTC(y, mo - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};

export default function TeamPage() {
  const lm = useLightMode();
  const cardBg        = lm ? '#FFFFFF' : '#10131A';
  const subCardBg     = lm ? '#F8FAFC' : '#090A0F';
  const cardBorder    = lm ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)';
  const textPrimary   = lm ? '#0F172A' : '#F9FAFB';
  const textSecondary = lm ? '#475569' : '#9CA3AF';
  const textMuted     = lm ? '#64748B' : '#6B7280';
  const ff            = 'var(--font-inter), -apple-system, sans-serif';
  const theme = { lm, cardBg, subCardBg, cardBorder, textPrimary, textSecondary, textMuted };

  const [month, setMonth]     = useState(thisMonth());
  const [data, setData]       = useState(null);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);   // teamsale id
  const [detail, setDetail]   = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm]       = useState({ fullName: '', email: '', phone: '', password: '' });
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState('');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const json = await (await fetch(`/api/marketer/team?month=${month}`)).json();
      if (!json.success) throw new Error(json.error);
      setData(json); setError('');
    } catch (e) { setError(e.message); }
    finally { if (!silent) setLoading(false); }
  }, [month]);

  const loadDetail = useCallback(async () => {
    if (!selected) { setDetail(null); return; }
    try {
      const json = await (await fetch(`/api/marketer/team?id=${selected}&month=${month}`)).json();
      if (json.success) setDetail(json);
    } catch (_) {}
  }, [selected, month]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadDetail(); }, [loadDetail]);

  const refreshAll = () => { load(true); loadDetail(); };

  const addMember = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      const json = await (await fetch('/api/marketer/team', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })).json();
      if (!json.success) throw new Error(json.error);
      setMsg(`✅ ${json.message}`);
      setForm({ fullName: '', email: '', phone: '', password: '' });
      setShowAdd(false);
      load(true);
    } catch (e) { setMsg(`⚠️ ${e.message}`); }
    finally { setSaving(false); }
  };

  const editWhatsapp = async (m) => {
    const val = prompt(`No. WhatsApp ${m.name} (dipapar di salespage anda). Kosongkan untuk buang:`, m.marketer_whatsapp || '');
    if (val === null) return;
    const json = await (await fetch('/api/marketer/team', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: m.id, whatsapp: val.trim() }),
    })).json();
    if (!json.success) return alert(json.error);
    load(true);
  };

  const toggleActive = async (m) => {
    if (!confirm(`${m.is_active ? 'Nyahaktif' : 'Aktifkan'} ${m.name}?${m.is_active ? '\n\nDia tidak boleh login selepas dinyahaktif.' : ''}`)) return;
    const json = await (await fetch('/api/marketer/team', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: m.id, is_active: !m.is_active }),
    })).json();
    if (!json.success) return alert(json.error);
    load(true);
  };

  const input = {
    padding: '0.55rem 0.7rem', borderRadius: '6px', fontSize: '0.85rem', fontFamily: ff, minWidth: 0,
    border: lm ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.15)', background: lm ? '#fff' : '#0B0D13', color: textPrimary,
  };
  const btn = (bg, color = '#fff') => ({ padding: '0.5rem 0.9rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', fontFamily: ff, background: bg, color });
  const cell = { padding: '0.65rem 0.9rem', textAlign: 'right', whiteSpace: 'nowrap' };
  const t = data?.totals;

  return (
    <div style={{ fontFamily: ff, color: textPrimary, padding: '0.25rem 0' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderRadius: '8px', marginBottom: '1.25rem', background: cardBg, border: cardBorder, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>👥 Team Saya</h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: textSecondary }}>
            Teamsale dapat {data?.teamsale_pct ?? 30}% dari profit selepas ads (tiada basic) · anda dapat override {data?.override_pct ?? 10}% · kos ads teamsale diisi oleh anda
          </p>
        </div>
        {data?.team?.some(m => m.is_active)
          ? <span style={{ fontSize: '0.75rem', color: textMuted, maxWidth: '260px' }}>Had 1 teamsale aktif. Nyahaktif teamsale sekarang untuk tambah yang baru.</span>
          : <button onClick={() => { setShowAdd(v => !v); setMsg(''); }} style={btn('#10B981')}>{showAdd ? 'Tutup' : '+ Tambah Teamsale'}</button>}
      </div>

      {msg && <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', background: cardBg, border: cardBorder, fontSize: '0.85rem' }}>{msg}</div>}

      {showAdd && (
        <form onSubmit={addMember} style={{ marginBottom: '1.25rem', padding: '1.1rem', borderRadius: '10px', background: cardBg, border: cardBorder, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.65rem', alignItems: 'end' }}>
          <input style={input} required placeholder="Nama penuh" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
          <input style={input} required type="email" placeholder="E-mel (untuk login)" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input style={input} placeholder="No. telefon / WhatsApp" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <input style={input} required minLength={6} type="text" placeholder="Kata laluan (min 6)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <button disabled={saving} style={{ ...btn('#3B82F6'), opacity: saving ? 0.6 : 1 }}>{saving ? 'Menyimpan...' : 'Cipta Akaun'}</button>
          <div style={{ gridColumn: '1 / -1', fontSize: '0.75rem', color: textMuted }}>
            Akaun terus aktif. No. telefon jadi <strong>no. WhatsApp di salespage anda</strong> — butang WhatsApp di SP terus ke teamsale. Beri e-mel & kata laluan kepada teamsale; dia login di halaman login biasa dan masukkan order di menu Order WhatsApp.
          </div>
        </form>
      )}

      {/* Bulan */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <button onClick={() => setMonth(m => shiftMonth(m, -1))} style={btn(lm ? '#E2E8F0' : '#1F2937', textPrimary)}>‹</button>
        <strong style={{ minWidth: '9rem', textAlign: 'center' }}>{monthLabel(month)}</strong>
        <button onClick={() => setMonth(m => shiftMonth(m, 1))} disabled={month >= thisMonth()} style={{ ...btn(lm ? '#E2E8F0' : '#1F2937', textPrimary), opacity: month >= thisMonth() ? 0.4 : 1 }}>›</button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: textMuted }}>Memuatkan team...</div>
      ) : error ? (
        <div style={{ padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: '0.85rem' }}>⚠️ {error}</div>
      ) : !data.team.length ? (
        <div style={{ padding: '2.5rem', textAlign: 'center', color: textMuted, background: cardBg, border: cardBorder, borderRadius: '10px' }}>
          Belum ada teamsale. Tekan <strong>+ Tambah Teamsale</strong> untuk mula.
        </div>
      ) : (
        <>
          <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: subCardBg, borderBottom: cardBorder }}>
                    {['Teamsale', 'Order', 'Sales', 'Ads', 'COGS', 'Profit', `Komisen ${data.teamsale_pct}%`, `Override Anda ${data.override_pct}%`, ''].map((h, i) => (
                      <th key={i} style={{ ...cell, textAlign: i === 0 ? 'left' : 'right', fontSize: '0.72rem', textTransform: 'uppercase', color: textSecondary }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.team.map(m => (
                    <tr key={m.id} onClick={() => setSelected(s => (s === m.id ? null : m.id))}
                      style={{ borderBottom: cardBorder, cursor: 'pointer', background: selected === m.id ? subCardBg : 'transparent', opacity: m.is_active ? 1 : 0.55 }}>
                      <td style={{ ...cell, textAlign: 'left', fontWeight: 700 }}>
                        {selected === m.id ? '▾' : '▸'} {m.name}
                        {!m.is_active && <span style={{ marginLeft: '0.4rem', fontSize: '0.65rem', color: '#EF4444' }}>TAK AKTIF</span>}
                        <div style={{ fontSize: '0.7rem', color: textMuted, fontWeight: 400 }}>{m.email}</div>
                        <div onClick={e => { e.stopPropagation(); editWhatsapp(m); }} title="Klik untuk ubah no. WhatsApp"
                          style={{ fontSize: '0.72rem', fontWeight: 600, marginTop: '0.15rem', cursor: 'pointer', color: m.marketer_whatsapp ? '#25D366' : '#F59E0B' }}>
                          {m.marketer_whatsapp
                            ? <>💬 {m.marketer_whatsapp}{m.is_active && ' · dipapar di SP'} ✏️</>
                            : <>⚠️ No. WhatsApp belum diisi — SP guna nombor anda ✏️</>}
                        </div>
                      </td>
                      <td style={{ ...cell, color: textSecondary }}>{m.orders}</td>
                      <td style={{ ...cell, color: '#10B981', fontWeight: 600 }}>{formatRM(m.sales)}</td>
                      <td style={{ ...cell, color: '#F59E0B', fontWeight: 600 }}>{formatRM(m.ads)}</td>
                      <td style={{ ...cell, color: '#8B5CF6' }}>{formatRM(m.cogs)}</td>
                      <td style={{ ...cell, fontWeight: 700, color: m.profit >= 0 ? '#10B981' : '#EF4444' }}>{formatRM(m.profit)}</td>
                      <td style={{ ...cell }}>{formatRM(m.komisen)}</td>
                      <td style={{ ...cell, fontWeight: 700, color: '#10B981' }}>{formatRM(m.override)}</td>
                      <td style={cell} onClick={e => e.stopPropagation()}>
                        <button onClick={() => toggleActive(m)} style={{ ...btn('transparent', m.is_active ? '#EF4444' : '#10B981'), padding: '0.2rem 0.4rem', fontSize: '0.72rem' }}>
                          {m.is_active ? 'Nyahaktif' : 'Aktifkan'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: subCardBg, fontWeight: 800 }}>
                    <td style={{ ...cell, textAlign: 'left' }}>JUMLAH</td>
                    <td style={cell}>{t.orders}</td>
                    <td style={{ ...cell, color: '#10B981' }}>{formatRM(t.sales)}</td>
                    <td style={{ ...cell, color: '#F59E0B' }}>{formatRM(t.ads)}</td>
                    <td style={{ ...cell, color: '#8B5CF6' }}>{formatRM(t.cogs)}</td>
                    <td style={{ ...cell, color: t.profit >= 0 ? '#10B981' : '#EF4444' }}>{formatRM(t.profit)}</td>
                    <td style={cell}>{formatRM(t.komisen)}</td>
                    <td style={{ ...cell, color: '#10B981' }}>{formatRM(t.override)}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ padding: '0.65rem 1rem', fontSize: '0.75rem', color: textMuted, borderTop: cardBorder }}>
              Klik teamsale untuk isi kos ads harian & lihat semua order dia.
            </div>
          </div>

          {/* Detail teamsale */}
          {selected && detail?.member?.id === selected && (
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                {detail.member.full_name} <span style={{ fontSize: '0.78rem', color: textMuted, fontWeight: 500 }}>· {detail.member.phone || detail.member.email}</span>
              </h2>

              <DailyProductTable
                days={detail.days}
                totals={{ sales: detail.summary.sales, ads: detail.summary.ads, cogs: detail.summary.cogs, profit: detail.summary.profit, komisen: detail.summary.komisen }}
                commissionPct={detail.summary.komisen_pct}
                endpoint={`/api/marketer/team/ads?member=${selected}`}
                onSaved={refreshAll}
                theme={theme}
                hint={<>Isi <strong style={{ color: '#F59E0B' }}>kos ads</strong> yang anda belanja untuk teamsale ni — klik tarikh, isi ikut produk, tekan Enter.</>}
              />

              <ProductSummaryTable rows={detail.productSummary} theme={theme} />

              <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: cardBorder, fontWeight: 800 }}>📦 Order {monthLabel(month)} ({detail.orders.length})</div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ background: subCardBg }}>
                        {['Tarikh', 'Pelanggan', 'Produk', 'Alamat', 'Bayaran', 'Status', 'Jumlah'].map((h, i) => (
                          <th key={h} style={{ ...cell, textAlign: i === 6 ? 'right' : 'left', fontSize: '0.7rem', textTransform: 'uppercase', color: textSecondary }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {detail.orders.map(o => (
                        <tr key={o.id} style={{ borderTop: cardBorder, verticalAlign: 'top' }}>
                          <td style={{ ...cell, textAlign: 'left', color: textSecondary }}>{new Date(o.created_at).toLocaleString('ms-MY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                          <td style={{ ...cell, textAlign: 'left' }}><div style={{ fontWeight: 600 }}>{o.full_name}</div><div style={{ color: textMuted }}>{o.phone}</div></td>
                          <td style={{ ...cell, textAlign: 'left', whiteSpace: 'normal', minWidth: '180px' }}>{o.produk_label}</td>
                          <td style={{ ...cell, textAlign: 'left', whiteSpace: 'normal', minWidth: '200px', color: textSecondary }}>{o.address || '—'}</td>
                          <td style={{ ...cell, textAlign: 'left' }}>{o.payment_type === 'cod' ? 'COD' : 'FPX'}{o.order_channel === 'whatsapp' ? ' · 💬' : ''}</td>
                          <td style={{ ...cell, textAlign: 'left', color: o.returned_at ? '#EF4444' : o.payment_status === 'completed' ? '#10B981' : '#F59E0B' }}>
                            {o.returned_at ? 'Return' : o.payment_status === 'completed' ? 'Selesai' : o.payment_status === 'failed' ? 'Gagal' : 'Pending'}
                          </td>
                          <td style={{ ...cell, fontWeight: 700 }}>{formatRM(o.amount)}</td>
                        </tr>
                      ))}
                      {!detail.orders.length && <tr><td colSpan={7} style={{ padding: '1.5rem', textAlign: 'center', color: textMuted }}>Tiada order bulan ni.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

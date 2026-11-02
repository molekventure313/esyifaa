'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';

// Dashboard Pos & COD — status parcel NinjaVan (webhook V2) & floating COD. Akses: super_admin.
const GROUPS = [
  { key: 'pending_pickup', label: 'Menunggu Pickup',  color: '#F59E0B', icon: '⏳' },
  { key: 'in_transit',     label: 'Dalam Perjalanan', color: '#3B82F6', icon: '🚚' },
  { key: 'exception',      label: 'Gagal Hantar',     color: '#EF4444', icon: '⚠️' },
  { key: 'delivered',      label: 'Delivered',        color: '#10B981', icon: '✅' },
  { key: 'returned',       label: 'Return',           color: '#8B5CF6', icon: '↩️' },
  { key: 'cancelled',      label: 'Dibatal',          color: '#94A3B8', icon: '🚫' },
  { key: 'failed',         label: 'Gagal Dihantar',   color: '#EF4444', icon: '❌' },
];
const GROUP_BY_KEY = Object.fromEntries(GROUPS.map(g => [g.key, g]));
const PERIODS = [
  { value: 'today', label: '📅 Hari Ini' }, { value: 'yesterday', label: 'Semalam' },
  { value: 'month', label: 'Bulan Ini' }, { value: 'year', label: 'Tahun Ini' }, { value: 'all', label: 'Semua' },
];
const rm = n => `RM ${(Number(n) || 0).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDateTime = d => d
  ? new Date(d).toLocaleString('ms-MY', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true })
  : '—';

export default function NinjaVanDashboardPage() {
  const { showToast } = useToast();
  const [period,   setPeriod]   = useState('month');
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [group,    setGroup]    = useState('all');     // all | floating | <group key>
  const [selected, setSelected] = useState(new Set());
  const [saving,   setSaving]   = useState(false);

  const [isLightMode, setIsLightMode] = useState(false);
  useEffect(() => {
    const checkTheme = () => setIsLightMode(document.body.classList.contains('light-mode') ||
      document.documentElement.getAttribute('data-theme') === 'light');
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const cardBg        = isLightMode ? '#FFFFFF' : '#10131A';
  const subCardBg     = isLightMode ? '#F8FAFC' : '#090A0F';
  const cardBorder    = isLightMode ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)';
  const textPrimary   = isLightMode ? '#0F172A' : '#F9FAFB';
  const textSecondary = isLightMode ? '#475569' : '#9CA3AF';
  const textMuted     = isLightMode ? '#64748B' : '#6B7280';

  const load = useCallback(async () => {
    try {
      const res  = await fetch(`/api/admin/ninjavan/summary?period=${period}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Gagal memuatkan data');
      setData(json);
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    setLoading(true);
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const isFloating = p => p.group === 'delivered' && p.cod_amount > 0 && !p.cod_remitted_at;
  const parcels = (data?.parcels || []).filter(p =>
    group === 'all' ? true : group === 'floating' ? isFloating(p) : p.group === group);

  const toggle = id => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const markRemitted = async (undo = false) => {
    const ids = [...selected];
    if (!ids.length) return;
    if (!confirm(undo ? `Batalkan tanda COD diterima untuk ${ids.length} parcel?` : `Tanda COD ${ids.length} parcel sudah diterima dari NinjaVan?`)) return;
    setSaving(true);
    try {
      const res  = await fetch('/api/admin/ninjavan/remit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids, undo }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Gagal dikemaskini');
      showToast(`${json.updated} parcel dikemaskini.`, 'success');
      setSelected(new Set());
      await load();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const card = { background: cardBg, border: cardBorder, borderRadius: '8px', padding: '1rem 1.25rem', boxShadow: isLightMode ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' };
  const c = data?.cod || {};

  return (
    <div style={{ fontFamily: 'var(--font-inter), -apple-system, sans-serif', color: textPrimary, padding: '0.25rem 0' }}>

      {/* ─── Header ─── */}
      <div style={{ ...card, padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.725rem', fontWeight: 700, color: isLightMode ? '#B91C1C' : '#F87171', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            🚚 NINJAVAN
          </span>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0 0', letterSpacing: '-0.02em' }}>
            Pos &amp; COD
            {data?.env === 'sandbox' && (
              <span style={{ marginLeft: '0.6rem', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'rgba(245,158,11,0.15)', color: '#F59E0B', verticalAlign: 'middle' }}>SANDBOX</span>
            )}
          </h1>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: textSecondary }}>
            Status setiap parcel dikemaskini automatik dari webhook NinjaVan · ikut tarikh parcel dihantar
          </p>
        </div>
        <div style={{ display: 'flex', background: subCardBg, border: cardBorder, borderRadius: '8px', padding: '3px' }}>
          {PERIODS.map(t => (
            <button key={t.value} onClick={() => setPeriod(t.value)} style={{
              padding: '0.4rem 0.85rem', borderRadius: '6px', fontSize: '0.78rem', border: 'none', cursor: 'pointer',
              fontWeight: period === t.value ? 700 : 500,
              background: period === t.value ? (isLightMode ? '#FFFFFF' : '#1E1B4B') : 'transparent',
              color: period === t.value ? (isLightMode ? '#4F46E5' : '#A5B4FC') : textSecondary,
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <div style={{ ...card, textAlign: 'center', color: textSecondary, padding: '3rem 0' }}>Memuatkan...</div>
      ) : data && (
        <>
          {/* ─── COD ─── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {[
              { label: 'Floating COD', sub: `${c.floating_count || 0} parcel delivered — duit belum diterima`, value: rm(c.floating), color: '#F97316', icon: '💸', onClick: () => setGroup('floating') },
              { label: 'COD Dalam Perjalanan', sub: 'Belum sampai ke pelanggan', value: rm(c.on_the_way), color: '#3B82F6', icon: '🚚' },
              { label: 'COD Diterima', sub: 'Ditanda diterima dari NinjaVan', value: rm(c.remitted), color: '#10B981', icon: '🏦' },
              { label: 'COD Return', sub: 'Parcel return — tiada kutipan', value: rm(c.returned), color: '#8B5CF6', icon: '↩️' },
              { label: 'Kadar Delivered', sub: `Return ${data.rates.returned_pct ?? '—'}% · dari parcel yang selesai`, value: data.rates.delivered_pct == null ? '—' : `${data.rates.delivered_pct}%`, color: '#10B981', icon: '🎯' },
            ].map(s => (
              <div key={s.label} onClick={s.onClick} style={{ ...card, cursor: s.onClick ? 'pointer' : 'default' }}>
                <div style={{ fontSize: '1.2rem' }}>{s.icon}</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: s.color, marginTop: '0.2rem' }}>{s.value}</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, marginTop: '0.1rem' }}>{s.label}</div>
                <div style={{ fontSize: '0.68rem', color: textMuted, marginTop: '0.15rem' }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* ─── Status parcel ─── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div onClick={() => setGroup('all')} style={{ ...card, padding: '0.85rem 1rem', cursor: 'pointer', outline: group === 'all' ? '2px solid #6366F1' : 'none' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{data.total}</div>
              <div style={{ fontSize: '0.72rem', color: textMuted }}>📦 Semua parcel · {rm(c.total)} COD</div>
            </div>
            {GROUPS.map(g => (
              <div key={g.key} onClick={() => setGroup(g.key)} style={{ ...card, padding: '0.85rem 1rem', cursor: 'pointer', outline: group === g.key ? `2px solid ${g.color}` : 'none' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: g.color }}>{data.counts[g.key] || 0}</div>
                <div style={{ fontSize: '0.72rem', color: textMuted }}>{g.icon} {g.label}{c[g.key] ? ` · ${rm(c[g.key])}` : ''}</div>
              </div>
            ))}
          </div>

          {/* ─── Senarai parcel ─── */}
          <div style={{ ...card, padding: '1.25rem', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                {group === 'all' ? 'Semua parcel' : group === 'floating' ? '💸 Floating COD' : `${GROUP_BY_KEY[group].icon} ${GROUP_BY_KEY[group].label}`}
                <span style={{ color: textMuted, fontWeight: 500 }}> · {parcels.length}</span>
              </div>
              {selected.size > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => markRemitted(false)} disabled={saving} style={{ padding: '0.45rem 0.9rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', background: '#10B981', border: 'none', color: '#fff' }}>
                    🏦 Tanda COD Diterima ({selected.size})
                  </button>
                  <button onClick={() => markRemitted(true)} disabled={saving} style={{ padding: '0.45rem 0.9rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', background: subCardBg, border: cardBorder, color: textSecondary }}>
                    Batal tanda
                  </button>
                </div>
              )}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: cardBorder }}>
                  <th style={{ padding: '0.6rem 0.4rem', width: '28px' }} />
                  {['Tracking', 'Pelanggan', 'Status', 'COD', 'Kemaskini', 'Dihantar'].map(h => (
                    <th key={h} style={{ padding: '0.6rem 0.4rem', color: textSecondary, fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parcels.map(p => {
                  const g = GROUP_BY_KEY[p.group] || GROUP_BY_KEY.in_transit;
                  const remittable = p.group === 'delivered' && p.cod_amount > 0;
                  return (
                    <tr key={p.id} style={{ borderBottom: isLightMode ? '1px solid #F1F5F9' : '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.6rem 0.4rem' }}>
                        {remittable && <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} style={{ cursor: 'pointer', accentColor: '#10B981' }} />}
                      </td>
                      <td style={{ padding: '0.6rem 0.4rem', fontFamily: 'monospace', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                        {p.tracking_number || '—'}
                        {p.is_test && <span style={{ marginLeft: '0.35rem', fontSize: '0.6rem', color: '#F59E0B', fontFamily: 'inherit' }}>UJIAN</span>}
                      </td>
                      <td style={{ padding: '0.6rem 0.4rem' }}>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        {p.phone && <div style={{ fontSize: '0.68rem', color: textMuted }}>{p.phone}</div>}
                      </td>
                      <td style={{ padding: '0.6rem 0.4rem' }}>
                        <span style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem', borderRadius: '8px', background: `${g.color}1A`, border: `1px solid ${g.color}55`, color: g.color, fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {g.icon} {g.label}
                        </span>
                        {p.event && p.event !== p.status && <div style={{ fontSize: '0.65rem', color: textMuted, marginTop: '0.2rem' }}>{p.event}</div>}
                      </td>
                      <td style={{ padding: '0.6rem 0.4rem', whiteSpace: 'nowrap' }}>
                        {p.cod_amount > 0 ? (
                          <>
                            <div style={{ fontWeight: 700 }}>{rm(p.cod_amount)}</div>
                            {p.group === 'delivered' && (
                              <div style={{ fontSize: '0.62rem', color: p.cod_remitted_at ? '#10B981' : '#F97316', fontWeight: 600 }}>
                                {p.cod_remitted_at ? `🏦 Diterima ${fmtDateTime(p.cod_remitted_at)}` : '💸 Belum diterima'}
                              </div>
                            )}
                          </>
                        ) : <span style={{ color: textMuted }}>Prabayar</span>}
                      </td>
                      <td style={{ padding: '0.6rem 0.4rem', color: textSecondary, whiteSpace: 'nowrap' }}>{fmtDateTime(p.last_event_at)}</td>
                      <td style={{ padding: '0.6rem 0.4rem', color: textMuted, whiteSpace: 'nowrap' }}>{fmtDateTime(p.created_at)}</td>
                    </tr>
                  );
                })}
                {parcels.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: '2.5rem 0', textAlign: 'center', color: textMuted }}>Tiada parcel dalam kategori ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

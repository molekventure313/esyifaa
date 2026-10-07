'use client';

import { useState, useEffect, useCallback } from 'react';

// UI selari dengan Pengurusan Order admin (/dashboard/admin/pesakit-berbayar) — tanpa fungsi admin
// (export / return / padam pukal). Marketer boleh: Mark as Paid (FPX pending/gagal) & padam order sendiri.

const STATUS_LABELS = {
  completed: { label: 'Selesai', color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', icon: '✅' },
  pending:   { label: 'Pending', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', icon: '⏳' },
  failed:    { label: 'Gagal',   color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',  icon: '❌' },
  cancelled: { label: 'Dibatal', color: '#94A3B8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.3)', icon: '🚫' },
};

const TYPE_LABELS = {
  cod:         { label: 'COD', color: '#F97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', icon: '📦' },
  fpx_payment: { label: 'FPX', color: '#60A5FA', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)', icon: '💳' },
};

const Badge = ({ cfg }) => (
  <span style={{
    fontSize: '0.7rem', padding: '0.2rem 0.55rem', borderRadius: '10px',
    background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, fontWeight: 700, whiteSpace: 'nowrap',
  }}>{cfg.icon} {cfg.label}</span>
);

const canMarkPaid = o => o.payment_type === 'fpx_payment' && ['pending', 'failed'].includes(o.payment_status);

export default function MarketerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const [status, setStatus] = useState('all');
  const [channel, setChannel] = useState('all');   // all | web | whatsapp
  const [owner, setOwner] = useState('all');       // ketua: all | self | team
  const [hasTeam, setHasTeam] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [isLightMode, setIsLightMode] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [payTarget, setPayTarget] = useState(null);   // order dalam tetingkap Mark as Paid
  const [payRef, setPayRef] = useState('');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');

  useEffect(() => {
    const checkTheme = () => {
      setIsLightMode(
        document.body.classList.contains('light-mode') ||
        document.documentElement.getAttribute('data-theme') === 'light'
      );
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const lm = isLightMode;
  const cardBg        = lm ? '#FFFFFF' : '#10131A';
  const subCardBg     = lm ? '#F8FAFC' : '#090A0F';
  const cardBorder    = lm ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)';
  const textPrimary   = lm ? '#0F172A' : '#F9FAFB';
  const textSecondary = lm ? '#475569' : '#9CA3AF';
  const textMuted     = lm ? '#64748B' : '#6B7280';
  const ff            = 'var(--font-inter), -apple-system, sans-serif';

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/marketer/orders?period=${period}&status=${status}&owner=${owner}`);
      const json = await res.json();
      if (json.success) {
        setOrders(json.data || []);
        setHasTeam(!!json.has_team);
        setStats(json.stats || null);
        setLastUpdated(new Date().toLocaleTimeString('ms-MY'));
      }
    } catch (_) {}
    finally { setLoading(false); }
  }, [period, status, owner]);

  useEffect(() => {
    setLoading(true);
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleDelete = async (order) => {
    const ok = window.confirm(
      `Padam order ${order.full_name} (${order.phone})?\n\n` +
      `Order ini akan dipadam SEPENUHNYA — tidak akan dihantar, dan tidak boleh dikembalikan.\n` +
      `Guna untuk order test / order salah sahaja.`
    );
    if (!ok) return;
    setDeletingId(order.id);
    try {
      const res = await fetch(`/api/orders/${order.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Gagal memadam order');
      setOrders(prev => prev.filter(o => o.id !== order.id));
    } catch (e) {
      window.alert(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  const openPay = (order) => { setPayTarget(order); setPayRef(''); setPayError(''); };

  const confirmPay = async () => {
    if (!payTarget) return;
    setPaying(true);
    setPayError('');
    try {
      const res = await fetch(`/api/orders/${payTarget.id}/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: payRef.trim() }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Gagal menanda paid');
      setPayTarget(null);
      await fetchOrders();
    } catch (e) {
      setPayError(e.message);
    } finally {
      setPaying(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (channel !== 'all' && (o.order_channel || 'web') !== channel) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (o.full_name || '').toLowerCase().includes(q) || (o.phone || '').toLowerCase().includes(q);
  });

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const formatTime = (d) => d ? new Date(d).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
  const waLink = (phone) => `https://wa.me/${(phone || '').replace(/[^0-9]/g, '').replace(/^0/, '60')}`;
  const td = { padding: '0.85rem 0.5rem', verticalAlign: 'top' };
  const actionBtn = (bg, border, color) => ({
    display: 'inline-flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center',
    padding: '0.3rem 0.55rem', borderRadius: '6px', background: bg, border: `1px solid ${border}`,
    color, fontWeight: 700, fontSize: '0.68rem', cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none',
  });

  return (
    <div style={{ fontFamily: ff, color: textPrimary, padding: '0.25rem 0' }}>
      {/* Header */}
      <div style={{
        padding: '1.25rem 1.5rem', borderRadius: '8px', marginBottom: '1.5rem',
        background: cardBg, border: cardBorder,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
        boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: textPrimary, letterSpacing: '-0.02em' }}>
            Orders Saya
          </h1>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: textSecondary }}>
            Semua order COD &amp; FPX dari link anda — dikemaskini setiap 15 saat
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.75rem', color: textMuted, background: subCardBg, padding: '0.4rem 0.85rem', borderRadius: '6px', border: cardBorder }}>
            Dikemaskini: <strong style={{ color: '#60A5FA' }}>{lastUpdated || 'Baru sahaja'}</strong>
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, background: subCardBg, padding: '0.4rem 0.85rem', borderRadius: '6px', border: cardBorder }}>
            {filteredOrders.length} rekod
          </div>
        </div>
      </div>

      {/* Stats cards — tempoh dipilih */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Order Selesai',     value: stats.total_completed, color: '#10B981', icon: '✅' },
            { label: 'Jumlah Sales (RM)', value: `RM ${(stats.total_revenue_rm || 0).toFixed(2)}`, color: '#10B981', icon: '💰' },
            { label: 'Order COD',         value: stats.total_cod,       color: '#F97316', icon: '📦' },
            { label: 'Order FPX',         value: stats.total_fpx,       color: '#60A5FA', icon: '💳' },
            { label: 'Pending',           value: stats.total_pending,   color: '#F59E0B', icon: '⏳' },
            { label: 'Gagal',             value: stats.total_failed,    color: '#EF4444', icon: '❌' },
          ].map(s => (
            <div key={s.label} style={{ background: cardBg, border: cardBorder, borderRadius: '8px', padding: '1rem 1.25rem', boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
              <div style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>{s.icon}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: textMuted, marginTop: '0.15rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{
        padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem',
        background: cardBg, border: cardBorder,
        display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { value: 'all', label: 'Semua Masa' },
            { value: 'today', label: 'Hari Ini' },
            { value: 'yesterday', label: 'Kelmarin' },
            { value: 'week', label: 'Mingguan' },
            { value: 'month', label: 'Bulanan' },
          ].map(t => (
            <button key={t.value} onClick={() => setPeriod(t.value)} style={{
              padding: '0.45rem 0.9rem', borderRadius: '6px', fontSize: '0.78rem',
              fontWeight: 600, cursor: 'pointer', border: 'none',
              background: period === t.value ? (lm ? '#1D4ED8' : '#3B82F6') : subCardBg,
              color: period === t.value ? '#fff' : textSecondary,
            }}>{t.label}</button>
          ))}
        </div>
        <div style={{ width: '1px', height: '28px', background: lm ? '#E2E8F0' : 'rgba(255,255,255,0.1)' }} />
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { value: 'all', label: 'Semua Status' },
            { value: 'completed', label: '✅ Selesai' },
            { value: 'pending', label: '⏳ Pending' },
            { value: 'failed', label: '❌ Gagal' },
          ].map(t => (
            <button key={t.value} onClick={() => setStatus(t.value)} style={{
              padding: '0.45rem 0.9rem', borderRadius: '6px', fontSize: '0.78rem',
              fontWeight: 600, cursor: 'pointer', border: 'none',
              background: status === t.value ? (lm ? '#047857' : '#064E3B') : subCardBg,
              color: status === t.value ? (lm ? '#fff' : '#34D399') : textSecondary,
            }}>{t.label}</button>
          ))}
        </div>
        <div style={{ width: '1px', height: '28px', background: lm ? '#E2E8F0' : 'rgba(255,255,255,0.1)' }} />
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { value: 'all', label: 'Semua Saluran' },
            { value: 'web', label: '🌐 Web' },
            { value: 'whatsapp', label: '💬 WhatsApp' },
          ].map(t => (
            <button key={t.value} onClick={() => setChannel(t.value)} style={{
              padding: '0.45rem 0.9rem', borderRadius: '6px', fontSize: '0.78rem',
              fontWeight: 600, cursor: 'pointer', border: 'none',
              background: channel === t.value ? '#16A34A' : subCardBg,
              color: channel === t.value ? '#fff' : textSecondary,
            }}>{t.label}</button>
          ))}
        </div>
        {hasTeam && (
          <>
            <div style={{ width: '1px', height: '28px', background: lm ? '#E2E8F0' : 'rgba(255,255,255,0.1)' }} />
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[
                { value: 'all', label: 'Semua (Sendiri + Team)' },
                { value: 'self', label: '👤 Sendiri' },
                { value: 'team', label: '👥 Team' },
              ].map(t => (
                <button key={t.value} onClick={() => setOwner(t.value)} style={{
                  padding: '0.45rem 0.9rem', borderRadius: '6px', fontSize: '0.78rem',
                  fontWeight: 600, cursor: 'pointer', border: 'none',
                  background: owner === t.value ? '#7C3AED' : subCardBg,
                  color: owner === t.value ? '#fff' : textSecondary,
                }}>{t.label}</button>
              ))}
            </div>
          </>
        )}
        <input
          type="text" placeholder="Cari nama / phone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          style={{
            flex: 1, minWidth: '200px', padding: '0.55rem 0.85rem', background: subCardBg,
            border: lm ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.12)',
            borderRadius: '6px', color: textPrimary, fontSize: '0.85rem', outline: 'none',
          }}
        />
      </div>

      {/* Tip mark as paid */}
      <div style={{
        padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.78rem', lineHeight: 1.55,
        background: lm ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)', color: textSecondary,
      }}>
        💡 <strong style={{ color: textPrimary }}>Pelanggan bayar melalui WhatsApp / transfer?</strong> Isi borang order di salespage anda (pilih FPX),
        tutup page bayaran, kemudian tekan <strong style={{ color: '#10B981' }}>✅ Mark as Paid</strong> pada order tu di sini — stok akan ditolak &amp; sales dikira.
      </div>

      <div style={{ background: cardBg, borderRadius: '8px', border: cardBorder, padding: '1.25rem', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem 0', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', borderColor: 'rgba(59,130,246,0.2)', borderTopColor: '#3B82F6', borderStyle: 'solid', borderWidth: '3px', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <span style={{ color: textSecondary, fontSize: '0.85rem' }}>Memuatkan senarai order...</span>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: lm ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)' }}>
                {['Pelanggan', 'Telefon', 'Produk', 'Jumlah', 'Alamat', 'Bayaran', 'Penghantaran', 'Tindakan', 'Tarikh'].map(h => (
                  <th key={h} style={{ padding: '0.7rem 0.5rem', color: textSecondary, fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', whiteSpace: 'nowrap', textAlign: h === 'Tarikh' ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} style={{ borderBottom: lm ? '1px solid #F1F5F9' : '1px solid rgba(255,255,255,0.04)' }}>
                  {/* Pelanggan */}
                  <td style={{ ...td, minWidth: '140px' }}>
                    <div style={{ fontWeight: 700, color: textPrimary, fontSize: '0.875rem' }}>{order.full_name}</div>
                    {order.is_team && (
                      <div style={{ fontSize: '0.65rem', color: '#A78BFA', fontWeight: 700, marginTop: '0.15rem' }}>👥 {order.owner_name || 'Teamsale'}</div>
                    )}
                    {order.source && (
                      <div style={{ fontSize: '0.65rem', color: textMuted, marginTop: '0.15rem' }}>
                        Dari: <span style={{ fontWeight: 600 }}>{order.source}</span>
                      </div>
                    )}
                  </td>

                  {/* Telefon */}
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: 600, color: textPrimary }}>{order.phone}</div>
                  </td>

                  {/* Produk */}
                  <td style={{ ...td, minWidth: '150px' }}>
                    <div style={{ marginBottom: '0.3rem' }}>
                      {TYPE_LABELS[order.payment_type] && <Badge cfg={TYPE_LABELS[order.payment_type]} />}
                      {order.order_channel === 'whatsapp' && (
                        <span title={order.order_origin === 'fb_ads' ? 'Order WhatsApp — pelanggan dari FB Ads' : order.order_origin === 'repeat' ? 'Order WhatsApp — pelanggan repeat' : 'Order WhatsApp'} style={{
                          fontSize: '0.65rem', padding: '0.15rem 0.45rem', borderRadius: '8px', marginLeft: '0.35rem', whiteSpace: 'nowrap',
                          background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.35)', color: '#16A34A', fontWeight: 700,
                        }}>💬 WhatsApp{order.order_origin === 'fb_ads' ? ' · FB Ads' : order.order_origin === 'repeat' ? ' · Repeat' : ''}</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: textSecondary, fontWeight: 600 }}>{order.produk_label || '—'}</div>
                  </td>

                  {/* Jumlah */}
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    {(order.amount || order.amount_paid) ? (
                      <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#10B981' }}>
                        RM {parseFloat(order.amount || order.amount_paid).toFixed(2)}
                      </span>
                    ) : <span style={{ fontSize: '0.72rem', color: textMuted, fontStyle: 'italic' }}>—</span>}
                  </td>

                  {/* Alamat */}
                  <td style={{ ...td, minWidth: '160px', maxWidth: '220px' }}>
                    {order.address ? (
                      <div style={{ fontSize: '0.78rem', color: textSecondary, lineHeight: 1.5 }}>📍 {order.address}</div>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: textMuted, fontStyle: 'italic' }}>
                        {order.payment_type === 'fpx_payment' ? 'Digital' : '—'}
                      </span>
                    )}
                  </td>

                  {/* Bayaran */}
                  <td style={td}>
                    <Badge cfg={STATUS_LABELS[order.payment_status] || STATUS_LABELS.pending} />
                  </td>

                  {/* Penghantaran (export NinjaVan oleh admin) */}
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    {order.payment_status !== 'completed' ? (
                      <span style={{ fontSize: '0.72rem', color: textMuted }}>—</span>
                    ) : order.returned_at ? (
                      <span style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem', borderRadius: '8px', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', color: '#60A5FA', fontWeight: 700 }}>↩️ Returned</span>
                    ) : order.ninjavan_exported_at ? (
                      <div>
                        <span style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981', fontWeight: 700 }}>🚚 Dah Dihantar</span>
                        <div style={{ fontSize: '0.6rem', color: textMuted, marginTop: '0.2rem' }}>{formatDate(order.ninjavan_exported_at)}</div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem', borderRadius: '8px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B', fontWeight: 600 }}>🆕 Belum</span>
                    )}
                  </td>

                  {/* Tindakan */}
                  <td style={td}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {!order.is_team && canMarkPaid(order) && (
                        <button onClick={() => openPay(order)} style={actionBtn('rgba(16,185,129,0.12)', 'rgba(16,185,129,0.35)', '#10B981')}>
                          ✅ Mark as Paid
                        </button>
                      )}
                      {order.phone && (
                        <a href={waLink(order.phone)} target="_blank" rel="noopener noreferrer" style={actionBtn('#25D366', '#25D366', '#fff')}>
                          💬 WA
                        </a>
                      )}
                      {!order.is_team && (   // order teamsale: lihat sahaja
                      <button
                        onClick={() => handleDelete(order)}
                        disabled={deletingId === order.id}
                        style={{ ...actionBtn('rgba(239,68,68,0.1)', 'rgba(239,68,68,0.25)', '#EF4444'), cursor: deletingId === order.id ? 'wait' : 'pointer', opacity: deletingId === order.id ? 0.6 : 1 }}
                      >
                        {deletingId === order.id ? '...' : '🗑 Padam'}
                      </button>
                      )}
                    </div>
                  </td>

                  {/* Tarikh */}
                  <td style={{ ...td, color: textMuted, fontSize: '0.775rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: 600, color: textSecondary }}>{formatDate(order.created_at)}</div>
                    <div style={{ fontSize: '0.675rem' }}>{formatTime(order.created_at)}</div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: '3rem 0', textAlign: 'center', color: textMuted, fontSize: '0.85rem' }}>Tiada rekod order.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── Tetingkap Mark as Paid ─── */}
      {payTarget && (
        <div
          onClick={() => !paying && setPayTarget(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '440px', background: cardBg, border: cardBorder, borderRadius: '12px', padding: '1.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
            <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem', fontWeight: 800, color: textPrimary }}>✅ Sahkan Bayaran</h3>
            <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: textSecondary }}>
              Pastikan pelanggan dah bayar penuh sebelum tanda paid.
            </p>

            <div style={{ background: subCardBg, border: cardBorder, borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', display: 'grid', gap: '0.35rem' }}>
              {[
                ['Pelanggan', `${payTarget.full_name} · ${payTarget.phone}`],
                ['Produk', payTarget.produk_label || '—'],
                ['Jumlah', `RM ${parseFloat(payTarget.amount || payTarget.amount_paid || 0).toFixed(2)}`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                  <span style={{ color: textMuted }}>{k}</span>
                  <strong style={{ color: k === 'Jumlah' ? '#10B981' : textPrimary, textAlign: 'right' }}>{v}</strong>
                </div>
              ))}
            </div>

            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: textPrimary, marginBottom: '0.35rem' }}>
              No. rujukan / nota bayaran <span style={{ color: textMuted, fontWeight: 400 }}>(pilihan)</span>
            </label>
            <input
              type="text" value={payRef} onChange={e => setPayRef(e.target.value)} maxLength={120}
              placeholder="Cth: DuitNow 27/9 · ref 123456"
              style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.8rem', borderRadius: '8px', background: subCardBg, border: cardBorder, color: textPrimary, fontSize: '0.85rem', outline: 'none', marginBottom: '0.75rem' }}
            />

            <p style={{ margin: '0 0 1rem', fontSize: '0.72rem', color: textMuted, lineHeight: 1.5 }}>
              Selepas disahkan: status jadi <strong>Selesai</strong>, stok ditolak, sales dikira dalam Gaji &amp; laporan, dan order masuk senarai hantar (NinjaVan).
            </p>

            {payError && (
              <div style={{ marginBottom: '0.75rem', padding: '0.6rem 0.8rem', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: '0.78rem' }}>
                {payError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setPayTarget(null)} disabled={paying} style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: cardBorder, background: 'transparent', color: textSecondary, fontWeight: 600, cursor: 'pointer' }}>
                Batal
              </button>
              <button onClick={confirmPay} disabled={paying} style={{ padding: '0.6rem 1.1rem', borderRadius: '8px', border: 'none', background: '#10B981', color: '#fff', fontWeight: 800, cursor: paying ? 'wait' : 'pointer', opacity: paying ? 0.7 : 1 }}>
                {paying ? 'Mengesahkan...' : 'Ya, Tanda PAID'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

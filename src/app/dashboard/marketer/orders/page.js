'use client';

import { useState, useEffect, useCallback } from 'react';

const STATUS_LABELS = {
  completed: { label: 'Selesai', color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', icon: '✅' },
  pending:   { label: 'Pending', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', icon: '⏳' },
  failed:    { label: 'Gagal',   color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',  icon: '❌' },
};

export default function MarketerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const [status, setStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [isLightMode, setIsLightMode] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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

  const cardBg        = isLightMode ? '#FFFFFF' : '#10131A';
  const subCardBg     = isLightMode ? '#F8FAFC' : '#090A0F';
  const cardBorder    = isLightMode ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)';
  const textPrimary   = isLightMode ? '#0F172A' : '#F9FAFB';
  const textSecondary = isLightMode ? '#475569' : '#9CA3AF';
  const textMuted     = isLightMode ? '#64748B' : '#6B7280';
  const ff            = 'var(--font-inter), -apple-system, sans-serif';

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/marketer/orders?period=${period}&status=${status}`);
      const json = await res.json();
      if (json.success) {
        setOrders(json.data || []);
        setLastUpdated(new Date().toLocaleTimeString('ms-MY'));
      }
    } catch (_) {}
    finally { setLoading(false); }
  }, [period, status]);

  useEffect(() => {
    setLoading(true);
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleDelete = async (order) => {
    const ok = window.confirm(
      `Padam order ${order.full_name} (${order.phone})?

` +
      `Order ini akan dipadam SEPENUHNYA — tidak akan dihantar, dan tidak boleh dikembalikan.
` +
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

  const filteredOrders = orders.filter(o => {
    if (!searchTerm) return true;
    const lSearch = searchTerm.toLowerCase();
    return (o.full_name || '').toLowerCase().includes(lSearch) || (o.phone || '').toLowerCase().includes(lSearch);
  });

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const formatTime = (d) => d ? new Date(d).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
  const formatRM = (val) => val ? `RM ${parseFloat(val).toFixed(2)}` : '—';

  return (
    <div style={{ fontFamily: ff, color: textPrimary, padding: '0.25rem 0' }}>
      <div style={{
        padding: '1.25rem 1.5rem', borderRadius: '8px', marginBottom: '1.5rem',
        background: cardBg, border: cardBorder,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1rem',
        boxShadow: isLightMode ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: textPrimary, letterSpacing: '-0.02em' }}>
            Semua Order Marketer
          </h1>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: textSecondary }}>
            Senarai lengkap jualan — dikemaskini setiap 15 saat
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
              background: period === t.value ? (isLightMode ? '#1D4ED8' : '#3B82F6') : subCardBg,
              color: period === t.value ? '#fff' : textSecondary,
            }}>{t.label}</button>
          ))}
        </div>
        <div style={{ width: '1px', height: '28px', background: isLightMode ? '#E2E8F0' : 'rgba(255,255,255,0.1)' }} />
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
              background: status === t.value ? (isLightMode ? '#047857' : '#064E3B') : subCardBg,
              color: status === t.value ? (isLightMode ? '#fff' : '#34D399') : textSecondary,
            }}>{t.label}</button>
          ))}
        </div>
        <input
          type="text" placeholder="Cari nama / phone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          style={{
            flex: 1, minWidth: '200px', padding: '0.55rem 0.85rem', background: subCardBg,
            border: isLightMode ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.12)',
            borderRadius: '6px', color: textPrimary, fontSize: '0.85rem', outline: 'none',
          }}
        />
      </div>

      <div style={{ background: cardBg, borderRadius: '8px', border: cardBorder, padding: '1.25rem', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem 0', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="spinner" style={{ width: '32px', height: '32px', borderColor: 'rgba(59,130,246,0.2)', borderTopColor: '#3B82F6', borderStyle: 'solid', borderWidth: '3px', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <span style={{ color: textSecondary, fontSize: '0.85rem' }}>Memuatkan senarai order...</span>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: isLightMode ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)' }}>
                {['Pelanggan', 'Telefon', 'Source / SP', 'Kuantiti', 'Jumlah', 'Status', 'Tarikh', ''].map(h => (
                  <th key={h} style={{ padding: '0.7rem 0.5rem', color: textSecondary, fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                const s = STATUS_LABELS[order.payment_status] || STATUS_LABELS.pending;
                return (
                  <tr key={order.id} style={{ borderBottom: isLightMode ? '1px solid #F1F5F9' : '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.85rem 0.5rem', minWidth: '140px' }}>
                      <div style={{ fontWeight: 700, color: textPrimary, fontSize: '0.875rem' }}>{order.full_name}</div>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, color: textPrimary }}>{order.phone}</div>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, color: textPrimary }}>{order.source || '—'}</div>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, color: textPrimary }}>{order.qty || 1}</div>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', whiteSpace: 'nowrap' }}>
                      {(order.amount || order.amount_paid) ? (
                        <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#10B981' }}>{formatRM(order.amount || order.amount_paid)}</span>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: textMuted, fontStyle: 'italic' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem', borderRadius: '10px', background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {s.icon} {s.label}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', color: textMuted, fontSize: '0.775rem', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, color: textSecondary }}>{formatDate(order.created_at)}</div>
                      <div style={{ fontSize: '0.675rem' }}>{formatTime(order.created_at)}</div>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                      {['cod', 'fpx_payment'].includes(order.payment_type) && (
                        <button
                          onClick={() => handleDelete(order)}
                          disabled={deletingId === order.id}
                          title="Padam order (test / salah)"
                          style={{
                            padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600,
                            border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)', color: '#EF4444',
                            cursor: deletingId === order.id ? 'wait' : 'pointer', whiteSpace: 'nowrap',
                            opacity: deletingId === order.id ? 0.6 : 1,
                          }}
                        >
                          {deletingId === order.id ? '...' : '🗑 Padam'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem 0', textAlign: 'center', color: textMuted, fontSize: '0.85rem' }}>Tiada rekod order.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

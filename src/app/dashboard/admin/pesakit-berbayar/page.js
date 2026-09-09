'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';

const PAYMENT_STATUS_LABELS = {
  completed: { label: 'Selesai', color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', icon: '✅' },
  pending:   { label: 'Pending', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', icon: '⏳' },
  failed:    { label: 'Gagal', color: '#EF4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', icon: '❌' },
};

const PAYMENT_TYPE_LABELS = {
  cod:         { label: 'COD', color: '#F97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', icon: '📦' },
  fpx_payment: { label: 'FPX', color: '#60A5FA', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)', icon: '💳' },
};

export default function PengurusanOrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [stats, setStats] = useState({
    total_completed: 0, total_pending: 0, total_failed: 0,
    total_cod: 0, total_fpx: 0, total_revenue_rm: 0,
  });
  const { showToast } = useToast();

  const [isLightMode, setIsLightMode] = useState(false);
  useEffect(() => {
    const checkTheme = () => {
      const isLight = document.body.classList.contains('light-mode') ||
        document.documentElement.getAttribute('data-theme') === 'light';
      setIsLightMode(isLight);
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const cardBg      = isLightMode ? '#FFFFFF' : '#10131A';
  const subCardBg   = isLightMode ? '#F8FAFC' : '#090A0F';
  const cardBorder  = isLightMode ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)';
  const textPrimary = isLightMode ? '#0F172A' : '#F9FAFB';
  const textSecondary = isLightMode ? '#475569' : '#9CA3AF';
  const textMuted   = isLightMode ? '#64748B' : '#6B7280';

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (paymentStatusFilter !== 'all') params.set('payment_status', paymentStatusFilter);
      if (paymentTypeFilter !== 'all') params.set('payment_type', paymentTypeFilter);
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      const res = await fetch(`/api/payments/list?${params.toString()}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setOrders(json.data || []);
        setStats(json.stats || {
          total_completed: 0, total_pending: 0, total_failed: 0,
          total_cod: 0, total_fpx: 0, total_revenue_rm: 0,
        });
        setLastUpdated(new Date().toLocaleTimeString('ms-MY'));
      }
    } catch (err) {
      showToast('Ralat memuatkan senarai order', 'error');
    } finally {
      setLoading(false);
    }
  }, [paymentStatusFilter, paymentTypeFilter, searchTerm]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
  const formatTime = (d) => d
    ? new Date(d).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', hour12: false })
    : '';

  const StatusBadge = ({ status }) => {
    const s = PAYMENT_STATUS_LABELS[status] || PAYMENT_STATUS_LABELS.pending;
    return (
      <span style={{
        fontSize: '0.7rem', padding: '0.2rem 0.55rem', borderRadius: '10px',
        background: s.bg, border: `1px solid ${s.border}`,
        color: s.color, fontWeight: 700, whiteSpace: 'nowrap',
      }}>
        {s.icon} {s.label}
      </span>
    );
  };

  const TypeBadge = ({ type }) => {
    const t = PAYMENT_TYPE_LABELS[type] || PAYMENT_TYPE_LABELS.fpx_payment;
    return (
      <span style={{
        fontSize: '0.7rem', padding: '0.2rem 0.55rem', borderRadius: '10px',
        background: t.bg, border: `1px solid ${t.border}`,
        color: t.color, fontWeight: 700, whiteSpace: 'nowrap',
      }}>
        {t.icon} {t.label}
      </span>
    );
  };

  return (
    <div style={{ fontFamily: 'var(--font-inter), -apple-system, sans-serif', color: textPrimary, padding: '0.25rem 0' }}>

      {/* ─── Header ─── */}
      <div style={{
        padding: '1.25rem 1.5rem', borderRadius: '8px', marginBottom: '1.5rem',
        background: cardBg, border: cardBorder,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1rem',
        boxShadow: isLightMode ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: isLightMode ? '#1D4ED8' : '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              📦 PENGURUSAN ORDER
            </span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: textPrimary, letterSpacing: '-0.02em' }}>
            Pengurusan Order
          </h1>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: textSecondary }}>
            Semua order FPX (Pengisian ESyifaa) &amp; COD (Sabun Garam) — dikemaskini setiap 15 saat
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', color: textMuted, background: subCardBg, padding: '0.4rem 0.85rem', borderRadius: '6px', border: cardBorder }}>
            Dikemaskini: <strong style={{ color: '#60A5FA' }}>{lastUpdated || 'Baru sahaja'}</strong>
          </div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, background: subCardBg, padding: '0.4rem 0.85rem', borderRadius: '6px', border: cardBorder }}>
            {orders.length} rekod
          </div>
        </div>
      </div>

      {/* ─── Stats Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Order Selesai', value: stats.total_completed, color: '#10B981', icon: '✅' },
          { label: 'Jumlah Sales (RM)', value: `RM ${(stats.total_revenue_rm || 0).toFixed(2)}`, color: '#10B981', icon: '💰' },
          { label: 'Order COD', value: stats.total_cod, color: '#F97316', icon: '📦' },
          { label: 'Order FPX', value: stats.total_fpx, color: '#60A5FA', icon: '💳' },
          { label: 'Pending', value: stats.total_pending, color: '#F59E0B', icon: '⏳' },
          { label: 'Gagal', value: stats.total_failed, color: '#EF4444', icon: '❌' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: cardBg, border: cardBorder, borderRadius: '8px', padding: '1rem 1.25rem', boxShadow: isLightMode ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
            <div style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '0.72rem', color: textMuted, marginTop: '0.15rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ─── Filters ─── */}
      <div style={{
        padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem',
        background: cardBg, border: cardBorder,
        display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center',
      }}>
        {/* Type Filter */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[
            { value: 'all', label: '📋 Semua' },
            { value: 'fpx_payment', label: '💳 FPX' },
            { value: 'cod', label: '📦 COD' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setPaymentTypeFilter(tab.value)}
              style={{
                padding: '0.45rem 0.9rem', borderRadius: '6px', fontSize: '0.78rem',
                fontWeight: 600, cursor: 'pointer', border: 'none',
                background: paymentTypeFilter === tab.value
                  ? (isLightMode ? '#1D4ED8' : '#3B82F6') : subCardBg,
                color: paymentTypeFilter === tab.value ? '#fff' : textSecondary,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ width: '1px', height: '28px', background: isLightMode ? '#E2E8F0' : 'rgba(255,255,255,0.1)' }} />

        {/* Status Filter */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[
            { value: 'all', label: 'Semua Status' },
            { value: 'completed', label: '✅ Selesai' },
            { value: 'pending', label: '⏳ Pending' },
            { value: 'failed', label: '❌ Gagal' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setPaymentStatusFilter(tab.value)}
              style={{
                padding: '0.45rem 0.9rem', borderRadius: '6px', fontSize: '0.78rem',
                fontWeight: 600, cursor: 'pointer', border: 'none',
                background: paymentStatusFilter === tab.value
                  ? (isLightMode ? '#047857' : '#064E3B') : subCardBg,
                color: paymentStatusFilter === tab.value
                  ? (isLightMode ? '#fff' : '#34D399') : textSecondary,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Cari nama atau nombor telefon..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            flex: 1, minWidth: '200px', padding: '0.55rem 0.85rem',
            background: subCardBg,
            border: isLightMode ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.12)',
            borderRadius: '6px', color: textPrimary, fontSize: '0.85rem', outline: 'none',
          }}
        />
      </div>

      {/* ─── Table ─── */}
      <div style={{ background: cardBg, borderRadius: '8px', border: cardBorder, padding: '1.25rem', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem 0', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="spinner" style={{ width: '32px', height: '32px', borderColor: 'rgba(59,130,246,0.2)', borderTopColor: '#3B82F6' }} />
            <span style={{ color: textSecondary, fontSize: '0.85rem' }}>Memuatkan senarai order...</span>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: isLightMode ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)' }}>
                {['Pelanggan', 'Telefon', 'Produk', 'Alamat', 'Bayaran', 'Status', 'Tindakan', 'Tarikh'].map(h => (
                  <th key={h} style={{ padding: '0.7rem 0.5rem', color: textSecondary, fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} style={{ borderBottom: isLightMode ? '1px solid #F1F5F9' : '1px solid rgba(255,255,255,0.04)' }}>

                  {/* Pelanggan */}
                  <td style={{ padding: '0.85rem 0.5rem', minWidth: '140px' }}>
                    <div style={{ fontWeight: 700, color: textPrimary, fontSize: '0.875rem' }}>{order.full_name}</div>
                    {order.source && (
                      <div style={{ fontSize: '0.65rem', color: textMuted, marginTop: '0.15rem' }}>
                        Dari: <span style={{ fontWeight: 600 }}>{order.source}</span>
                      </div>
                    )}
                  </td>

                  {/* Telefon */}
                  <td style={{ padding: '0.85rem 0.5rem', whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: 600, color: textPrimary }}>{order.phone}</div>
                  </td>

                  {/* Produk */}
                  <td style={{ padding: '0.85rem 0.5rem', minWidth: '120px' }}>
                    <div style={{ marginBottom: '0.3rem' }}>
                      <TypeBadge type={order.payment_type} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: textSecondary, fontWeight: 600 }}>
                      {order.produk_label || '—'}
                    </div>
                    {order.amount_paid && (
                      <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700, marginTop: '0.15rem' }}>
                        RM {parseFloat(order.amount_paid).toFixed(2)}
                      </div>
                    )}
                  </td>

                  {/* Alamat */}
                  <td style={{ padding: '0.85rem 0.5rem', minWidth: '160px', maxWidth: '200px' }}>
                    {order.address ? (
                      <div style={{ fontSize: '0.78rem', color: textSecondary, lineHeight: 1.5 }}>
                        📍 {order.address}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: textMuted, fontStyle: 'italic' }}>
                        {order.payment_type === 'fpx_payment' ? 'Digital — tiada alamat' : '—'}
                      </span>
                    )}
                  </td>

                  {/* Status Bayaran */}
                  <td style={{ padding: '0.85rem 0.5rem' }}>
                    <StatusBadge status={order.payment_status} />
                    {order.payment_type === 'fpx_payment' && order.chip_bill_id && (
                      <div style={{ fontSize: '0.6rem', color: textMuted, marginTop: '0.3rem', fontFamily: 'monospace' }}>
                        #{order.chip_bill_id.substring(0, 10)}...
                      </div>
                    )}
                  </td>

                  {/* Status Order */}
                  <td style={{ padding: '0.85rem 0.5rem' }}>
                    {order.case_status ? (
                      <span style={{
                        fontSize: '0.7rem', padding: '0.2rem 0.55rem', borderRadius: '10px',
                        background: isLightMode ? '#F0FDF4' : 'rgba(16,185,129,0.1)',
                        border: isLightMode ? '1px solid #A7F3D0' : '1px solid rgba(16,185,129,0.25)',
                        color: isLightMode ? '#047857' : '#34D399',
                        fontWeight: 600,
                      }}>
                        {order.case_status}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: textMuted, fontStyle: 'italic' }}>—</span>
                    )}
                  </td>

                  {/* Tindakan */}
                  <td style={{ padding: '0.85rem 0.5rem' }}>
                    {order.phone && (
                      <a
                        href={`https://wa.me/${order.phone.replace(/[^0-9]/g, '').replace(/^0/, '60')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                          padding: '0.35rem 0.65rem', borderRadius: '6px',
                          background: '#25D366', color: '#fff',
                          fontWeight: 700, fontSize: '0.72rem',
                          textDecoration: 'none', whiteSpace: 'nowrap',
                          boxShadow: '0 2px 6px rgba(37,211,102,0.3)',
                        }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        WA
                      </a>
                    )}
                  </td>

                  {/* Tarikh */}
                  <td style={{ padding: '0.85rem 0.5rem', color: textMuted, fontSize: '0.775rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: 600, color: textSecondary }}>{formatDate(order.created_at)}</div>
                    <div style={{ fontSize: '0.675rem' }}>{formatTime(order.created_at)}</div>
                  </td>
                </tr>
              ))}

              {orders.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem 0', textAlign: 'center', color: textMuted, fontSize: '0.85rem' }}>
                    Tiada rekod order lagi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

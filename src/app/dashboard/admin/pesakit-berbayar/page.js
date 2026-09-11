'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';

const PAYMENT_STATUS_LABELS = {
  completed: { label: 'Selesai', color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', icon: '✅' },
  pending:   { label: 'Pending', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', icon: '⏳' },
  failed:    { label: 'Gagal',   color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',  icon: '❌' },
};

const PAYMENT_TYPE_LABELS = {
  cod:         { label: 'COD', color: '#F97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', icon: '📦' },
  fpx_payment: { label: 'FPX', color: '#60A5FA', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)', icon: '💳' },
};

export default function PengurusanOrderPage() {
  const [orders,              setOrders]              = useState([]);
  const [loading,             setLoading]             = useState(true);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [paymentTypeFilter,   setPaymentTypeFilter]   = useState('all');
  const [searchTerm,          setSearchTerm]          = useState('');
  const [lastUpdated,         setLastUpdated]         = useState('');
  const [stats, setStats] = useState({
    total_completed: 0, total_pending: 0, total_failed: 0,
    total_cod: 0, total_fpx: 0, total_revenue_rm: 0,
  });

  // Multi-select delete
  const [selectedIds,   setSelectedIds]   = useState(new Set());
  const [deleting,      setDeleting]      = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Export
  const [exporting,   setExporting]   = useState(false);

  // Return COD
  const [returningId, setReturningId] = useState(null);

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

  const cardBg        = isLightMode ? '#FFFFFF' : '#10131A';
  const subCardBg     = isLightMode ? '#F8FAFC' : '#090A0F';
  const cardBorder    = isLightMode ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)';
  const textPrimary   = isLightMode ? '#0F172A' : '#F9FAFB';
  const textSecondary = isLightMode ? '#475569' : '#9CA3AF';
  const textMuted     = isLightMode ? '#64748B' : '#6B7280';

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (paymentStatusFilter !== 'all') params.set('payment_status', paymentStatusFilter);

      if (paymentTypeFilter === 'physical') {
        params.set('physical', 'true');
      } else if (paymentTypeFilter !== 'all') {
        params.set('payment_type', paymentTypeFilter);
      }

      if (searchTerm.trim()) params.set('search', searchTerm.trim());

      const res  = await fetch(`/api/payments/list?${params.toString()}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setOrders(json.data || []);
        setStats(json.stats || { total_completed: 0, total_pending: 0, total_failed: 0, total_cod: 0, total_fpx: 0, total_revenue_rm: 0 });
        setLastUpdated(new Date().toLocaleTimeString('ms-MY'));
        setSelectedIds(prev => {
          const newIds = new Set((json.data || []).map(o => o.id));
          return new Set([...prev].filter(id => newIds.has(id)));
        });
      }
    } catch {
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

  // ─── Selection ─────────────────────────────────────────────────────────────
  const toggleSelect    = (id) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleSelectAll = () => setSelectedIds(prev => prev.size === orders.length ? new Set() : new Set(orders.map(o => o.id)));
  const allSelected     = orders.length > 0 && selectedIds.size === orders.length;
  const someSelected    = selectedIds.size > 0;

  // ─── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    setDeleting(true);
    setConfirmDelete(false);
    try {
      const res  = await fetch('/api/orders/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [...selectedIds] }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast(json.message || `${json.deleted} order dipadam.`, 'success');
        setSelectedIds(new Set());
        await fetchOrders();
      } else {
        showToast(json.error || 'Ralat semasa memadam order.', 'error');
      }
    } catch {
      showToast('Ralat rangkaian. Sila cuba lagi.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // ─── Export NinjaVan ───────────────────────────────────────────────────────
  const handleExport = async (specificIds) => {
    setExporting(true);
    try {
      const params = new URLSearchParams();

      // Export only selected IDs if provided
      const idsToExport = specificIds ?? [...selectedIds];
      if (idsToExport.length > 0) {
        params.set('ids', idsToExport.join(','));
      } else {
        // Export all visible orders (based on current filters)
        if (paymentTypeFilter === 'physical') params.set('physical', 'true');
        else if (paymentTypeFilter !== 'all') params.set('payment_type', paymentTypeFilter);
        if (paymentStatusFilter !== 'all') params.set('status', paymentStatusFilter);
      }

      const res = await fetch(`/api/orders/export-ninjavan?${params.toString()}`);

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Export gagal (${res.status})`);
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      const today = new Date().toISOString().slice(0, 10);
      a.href     = url;
      a.download = `ninjavan_orders_${today}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(`CSV berjaya diexport! (${idsToExport.length || 'semua'} order)`, 'success');
      setSelectedIds(new Set());
      await fetchOrders(); // refresh — badge "Dah Export" akan muncul
    } catch (err) {
      showToast(err.message || 'Export gagal', 'error');
    } finally {
      setExporting(false);
    }
  };

  // ─── Return COD ────────────────────────────────────────────────────────────
  const handleReturn = async (orderId, orderName) => {
    if (!confirm(`Return order COD dari ${orderName}?\n\nStok akan ditambah semula ke dalam sistem.`)) return;
    setReturningId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/return`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        showToast(json.message || 'Return berjaya. Stok dikembalikan.', 'success');
        await fetchOrders();
      } else {
        showToast(json.error || 'Return gagal', 'error');
      }
    } catch {
      showToast('Ralat rangkaian. Sila cuba lagi.', 'error');
    } finally {
      setReturningId(null);
    }
  };

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
  const formatTime = (d) => d
    ? new Date(d).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', hour12: false })
    : '';

  const StatusBadge = ({ status }) => {
    const s = PAYMENT_STATUS_LABELS[status] || PAYMENT_STATUS_LABELS.pending;
    return (
      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem', borderRadius: '10px', background: s.bg, border: `1px solid ${s.border}`, color: s.color, fontWeight: 700, whiteSpace: 'nowrap' }}>
        {s.icon} {s.label}
      </span>
    );
  };

  const TypeBadge = ({ type }) => {
    const t = PAYMENT_TYPE_LABELS[type] || PAYMENT_TYPE_LABELS.fpx_payment;
    return (
      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem', borderRadius: '10px', background: t.bg, border: `1px solid ${t.border}`, color: t.color, fontWeight: 700, whiteSpace: 'nowrap' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Export All Physical Completed Button */}
          <button
            onClick={() => {
              // Quick export: set filter to physical + completed, export all
              const physicalCompleted = orders.filter(o =>
                o.payment_status === 'completed' &&
                (o.payment_type === 'cod' || (o.payment_type === 'fpx_payment' && (o.source || '').includes('sabun')))
              );
              handleExport(physicalCompleted.map(o => o.id));
            }}
            disabled={exporting}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem',
              fontWeight: 700, cursor: exporting ? 'not-allowed' : 'pointer',
              background: isLightMode ? '#1E40AF' : '#2563EB',
              color: '#fff', border: 'none',
              opacity: exporting ? 0.7 : 1,
            }}
          >
            {exporting ? '⏳ Exporting...' : '📦 Export NinjaVan'}
          </button>
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
          { label: 'Order Selesai',     value: stats.total_completed,                          color: '#10B981', icon: '✅' },
          { label: 'Jumlah Sales (RM)', value: `RM ${(stats.total_revenue_rm || 0).toFixed(2)}`, color: '#10B981', icon: '💰' },
          { label: 'Order COD',         value: stats.total_cod,                                color: '#F97316', icon: '📦' },
          { label: 'Order FPX',         value: stats.total_fpx,                                color: '#60A5FA', icon: '💳' },
          { label: 'Pending',           value: stats.total_pending,                            color: '#F59E0B', icon: '⏳' },
          { label: 'Gagal',             value: stats.total_failed,                             color: '#EF4444', icon: '❌' },
        ].map(stat => (
          <div key={stat.label} style={{ background: cardBg, border: cardBorder, borderRadius: '8px', padding: '1rem 1.25rem', boxShadow: isLightMode ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
            <div style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '0.72rem', color: textMuted, marginTop: '0.15rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ─── Filters ─── */}
      <div style={{
        padding: '1rem', borderRadius: '8px', marginBottom: '1rem',
        background: cardBg, border: cardBorder,
        display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center',
      }}>
        {/* Type Filter */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { value: 'all',      label: '📋 Semua' },
            { value: 'physical', label: '🚚 Produk Fizikal' },
            { value: 'fpx_payment', label: '💳 FPX' },
            { value: 'cod',      label: '📦 COD' },
          ].map(tab => (
            <button key={tab.value} onClick={() => setPaymentTypeFilter(tab.value)} style={{
              padding: '0.45rem 0.9rem', borderRadius: '6px', fontSize: '0.78rem',
              fontWeight: 600, cursor: 'pointer', border: 'none',
              background: paymentTypeFilter === tab.value ? (isLightMode ? '#1D4ED8' : '#3B82F6') : subCardBg,
              color: paymentTypeFilter === tab.value ? '#fff' : textSecondary,
            }}>{tab.label}</button>
          ))}
        </div>

        <div style={{ width: '1px', height: '28px', background: isLightMode ? '#E2E8F0' : 'rgba(255,255,255,0.1)' }} />

        {/* Status Filter */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { value: 'all',       label: 'Semua Status' },
            { value: 'completed', label: '✅ Selesai' },
            { value: 'pending',   label: '⏳ Pending' },
            { value: 'failed',    label: '❌ Gagal' },
          ].map(tab => (
            <button key={tab.value} onClick={() => setPaymentStatusFilter(tab.value)} style={{
              padding: '0.45rem 0.9rem', borderRadius: '6px', fontSize: '0.78rem',
              fontWeight: 600, cursor: 'pointer', border: 'none',
              background: paymentStatusFilter === tab.value ? (isLightMode ? '#047857' : '#064E3B') : subCardBg,
              color: paymentStatusFilter === tab.value ? (isLightMode ? '#fff' : '#34D399') : textSecondary,
            }}>{tab.label}</button>
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

      {/* ─── Export Hint ─── */}
      {paymentTypeFilter === 'physical' && paymentStatusFilter === 'completed' && (
        <div style={{
          padding: '0.65rem 1rem', borderRadius: '8px', marginBottom: '1rem',
          background: isLightMode ? '#EFF6FF' : 'rgba(37,99,235,0.08)',
          border: isLightMode ? '1px solid #BFDBFE' : '1px solid rgba(37,99,235,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
        }}>
          <span style={{ fontSize: '0.825rem', color: isLightMode ? '#1D4ED8' : '#93C5FD' }}>
            💡 <strong>Tip:</strong> Tick semua checkbox di bawah → klik "Export Terpilih" untuk export semua order ni ke NinjaVan.
          </span>
        </div>
      )}

      {/* ─── Bulk Action Bar ─── */}
      {someSelected && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem',
          background: isLightMode ? '#F0FDF4' : 'rgba(16,185,129,0.06)',
          border: isLightMode ? '1px solid #A7F3D0' : '1px solid rgba(16,185,129,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: isLightMode ? '#065F46' : '#6EE7B7' }}>
            {selectedIds.size} order dipilih
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => setSelectedIds(new Set())} style={{
              padding: '0.45rem 0.9rem', borderRadius: '6px', fontSize: '0.78rem',
              fontWeight: 600, cursor: 'pointer', background: subCardBg, border: cardBorder, color: textSecondary,
            }}>Batalkan Pilihan</button>

            {/* Export selected */}
            <button
              onClick={() => handleExport([...selectedIds])}
              disabled={exporting}
              style={{
                padding: '0.45rem 1rem', borderRadius: '6px', fontSize: '0.78rem',
                fontWeight: 700, cursor: exporting ? 'not-allowed' : 'pointer',
                background: '#2563EB', border: 'none', color: '#fff',
                opacity: exporting ? 0.7 : 1,
              }}
            >
              {exporting ? '⏳...' : `📦 Export ${selectedIds.size} ke NinjaVan`}
            </button>

            {/* Delete selected */}
            <button
              onClick={() => setConfirmDelete(true)}
              disabled={deleting}
              style={{
                padding: '0.45rem 1rem', borderRadius: '6px', fontSize: '0.78rem',
                fontWeight: 700, cursor: deleting ? 'not-allowed' : 'pointer',
                background: '#DC2626', border: 'none', color: '#fff',
                opacity: deleting ? 0.7 : 1,
              }}
            >
              {deleting ? 'Memadam...' : `🗑️ Padam ${selectedIds.size}`}
            </button>
          </div>
        </div>
      )}

      {/* ─── Confirm Delete Dialog ─── */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{
            background: isLightMode ? '#FFFFFF' : '#10131A',
            border: isLightMode ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.12)',
            borderRadius: '16px', padding: '2rem', maxWidth: '400px', width: '90%', textAlign: 'center',
            boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚠️</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: textPrimary, marginBottom: '0.5rem' }}>
              Padam {selectedIds.size} Order?
            </h3>
            <p style={{ fontSize: '0.875rem', color: textSecondary, marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Tindakan ini tidak boleh dibatalkan. Order yang dipadam tidak akan boleh dipulihkan.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => setConfirmDelete(false)} style={{ padding: '0.65rem 1.5rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', background: subCardBg, border: cardBorder, color: textPrimary }}>Batal</button>
              <button onClick={handleDelete} style={{ padding: '0.65rem 1.5rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', background: '#DC2626', border: 'none', color: '#fff' }}>Ya, Padam</button>
            </div>
          </div>
        </div>
      )}

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
                <th style={{ padding: '0.7rem 0.5rem', width: '32px' }}>
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll}
                    style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: '#3B82F6' }} />
                </th>
                {['Pelanggan', 'Telefon', 'Produk', 'Jumlah', 'Alamat', 'Bayaran', 'Export', 'Tindakan', 'Tarikh'].map(h => (
                  <th key={h} style={{ padding: '0.7rem 0.5rem', color: textSecondary, fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const isSelected = selectedIds.has(order.id);
                const isExported = !!order.ninjavan_exported_at;
                return (
                  <tr key={order.id} style={{
                    borderBottom: isLightMode ? '1px solid #F1F5F9' : '1px solid rgba(255,255,255,0.04)',
                    background: isSelected ? (isLightMode ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.08)') : 'transparent',
                    transition: 'background 0.1s',
                  }}>

                    {/* Checkbox */}
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(order.id)}
                        style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: '#3B82F6' }} />
                    </td>

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
                    </td>

                    {/* Jumlah */}
                    <td style={{ padding: '0.85rem 0.5rem', whiteSpace: 'nowrap' }}>
                      {order.amount_paid ? (
                        <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#10B981' }}>
                          RM {parseFloat(order.amount_paid).toFixed(2)}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: textMuted, fontStyle: 'italic' }}>—</span>
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
                          {order.payment_type === 'fpx_payment' ? 'Digital' : '—'}
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

                    {/* Export Status */}
                    <td style={{ padding: '0.85rem 0.5rem', whiteSpace: 'nowrap' }}>
                      {isExported ? (
                        <div>
                          <span style={{
                            fontSize: '0.68rem', padding: '0.2rem 0.5rem', borderRadius: '8px',
                            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                            color: '#10B981', fontWeight: 700,
                          }}>✅ Dah Export</span>
                          <div style={{ fontSize: '0.6rem', color: textMuted, marginTop: '0.2rem' }}>
                            {formatDate(order.ninjavan_exported_at)}
                          </div>
                        </div>
                      ) : (
                        <span style={{
                          fontSize: '0.68rem', padding: '0.2rem 0.5rem', borderRadius: '8px',
                          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                          color: '#F59E0B', fontWeight: 600,
                        }}>🆕 Belum</span>
                      )}
                    </td>

                    {/* Tindakan */}
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {order.phone && (
                          <a
                            href={`https://wa.me/${order.phone.replace(/[^0-9]/g, '').replace(/^0/, '60')}`}
                            target="_blank" rel="noopener noreferrer"
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
                        <button
                          onClick={() => handleExport([order.id])}
                          disabled={exporting}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                            padding: '0.3rem 0.55rem', borderRadius: '6px',
                            background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)',
                            color: '#3B82F6', fontWeight: 700, fontSize: '0.68rem',
                            cursor: exporting ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
                          }}
                        >
                          📦 Export
                        </button>

                        {/* Return button — COD + completed + not yet returned */}
                        {order.payment_type === 'cod' && order.payment_status === 'completed' && (
                          order.returned_at ? (
                            <span style={{
                              fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '6px',
                              background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)',
                              color: '#60A5FA', fontWeight: 700, whiteSpace: 'nowrap',
                            }}>
                              ↩️ Returned
                            </span>
                          ) : (
                            <button
                              onClick={() => handleReturn(order.id, order.full_name)}
                              disabled={returningId === order.id}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                padding: '0.3rem 0.55rem', borderRadius: '6px',
                                background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)',
                                color: '#60A5FA', fontWeight: 700, fontSize: '0.68rem',
                                cursor: returningId === order.id ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
                              }}
                            >
                              {returningId === order.id ? '...' : '🔄 Return'}
                            </button>
                          )
                        )}

                        <button
                          onClick={() => { setSelectedIds(new Set([order.id])); setConfirmDelete(true); }}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                            padding: '0.3rem 0.55rem', borderRadius: '6px',
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                            color: '#EF4444', fontWeight: 700, fontSize: '0.68rem',
                            cursor: 'pointer', whiteSpace: 'nowrap',
                          }}
                        >
                          🗑️ Padam
                        </button>
                      </div>
                    </td>

                    {/* Tarikh */}
                    <td style={{ padding: '0.85rem 0.5rem', color: textMuted, fontSize: '0.775rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, color: textSecondary }}>{formatDate(order.created_at)}</div>
                      <div style={{ fontSize: '0.675rem' }}>{formatTime(order.created_at)}</div>
                    </td>
                  </tr>
                );
              })}

              {orders.length === 0 && !loading && (
                <tr>
                  <td colSpan={10} style={{ padding: '3rem 0', textAlign: 'center', color: textMuted, fontSize: '0.85rem' }}>
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

'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';

export default function MarketersPage() {
  const [marketers, setMarketers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editingGajiId, setEditingGajiId] = useState(null);
  const [gajiForm, setGajiForm] = useState({ basic: 0, commission: 0 });
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const { showToast } = useToast();

  const fetchMarketers = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch('/api/admin/marketers');
      const result = await res.json();
      if (res.ok && result.data) {
        setMarketers(Array.isArray(result.data) ? result.data : []);
        setLastRefreshed(new Date());
      } else {
        throw new Error(result.error || 'Gagal memuatkan senarai marketer');
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketers();
    const interval = setInterval(() => {
      fetchMarketers(false);
    }, 8000); // Auto-refresh every 8 seconds
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (marketerId, newIsActive, pName) => {
    setUpdatingId(marketerId);
    try {
      const res = await fetch('/api/admin/marketers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: marketerId,
          is_active: newIsActive
        })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Gagal mengemaskini status marketer');

      showToast(
        newIsActive 
          ? `Akaun marketer ${pName} telah DILULUSKAN!` 
          : `Akaun marketer ${pName} telah DITOLAK / DINYAHAKTIFKAN!`, 
        newIsActive ? 'success' : 'error'
      );
      fetchMarketers(false);
    } catch (err) {
      showToast(err.message || 'Ralat mengemaskini status marketer', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteMarketer = async (marketerId, pName) => {
    const confirmed = window.confirm(
      `Anda pasti mahu MEMADAM KEKAL akaun marketer "${pName}"?\n\nTindakan ini TIDAK BOLEH diundur.`
    );
    if (!confirmed) return;

    setDeletingId(marketerId);
    try {
      const res = await fetch(`/api/admin/marketers?id=${marketerId}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast(`Akaun marketer ${pName} berjaya dipadam.`, 'success');
        fetchMarketers();
      } else {
        throw new Error(json.error || 'Gagal memadam akaun');
      }
    } catch (err) {
      showToast(err.message || 'Ralat semasa memadam akaun', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const startEditGaji = (m) => {
    setEditingGajiId(m.id);
    setGajiForm({
      basic: m.marketer_basic_salary || 0,
      commission: m.marketer_commission_pct || 0
    });
  };

  const handleSaveGaji = async (marketerId) => {
    setUpdatingId(marketerId);
    try {
      const res = await fetch('/api/admin/marketers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: marketerId,
          marketer_basic_salary: parseFloat(gajiForm.basic) || 0,
          marketer_commission_pct: parseFloat(gajiForm.commission) || 0
        })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Gagal mengemaskini gaji');

      showToast(`Gaji berjaya dikemaskini.`, 'success');
      setEditingGajiId(null);
      fetchMarketers(false);
    } catch (err) {
      showToast(err.message || 'Ralat mengemaskini gaji', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatRM = (val) => new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(val || 0);

  const pendingCount = marketers.filter(p => !p.is_active).length;
  const approvedCount = marketers.filter(p => p.is_active).length;

  return (
    <div style={{ fontFamily: 'var(--font-inter), -apple-system, sans-serif', color: '#F9FAFB', padding: '0.25rem 0' }}>
      
      {/* Page Header */}
      <div 
        style={{ 
          padding: '1.25rem 1.5rem', 
          borderRadius: '8px', 
          marginBottom: '1.75rem',
          background: '#10131A',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 600, color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              PENGURUSAN MARKETER
            </span>
            <span style={{ fontSize: '0.65rem', background: 'rgba(16,185,129,0.1)', color: '#10B981', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
              Live Update • {lastRefreshed.toLocaleTimeString('ms-MY')}
            </span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#F9FAFB', letterSpacing: '-0.02em' }}>
            Prestasi &amp; Senarai Marketer
          </h1>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#9CA3AF' }}>
            Urus akaun marketer, tetapkan gaji &amp; komisen, serta pantau jualan dan kos iklan (Ads Spend).
          </p>
        </div>
      </div>

      {/* Summary Status Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        <div style={{ background: '#10131A', padding: '1rem 1.25rem', borderRadius: '8px', border: pendingCount > 0 ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: pendingCount > 0 ? '#F59E0B' : '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
            Menunggu Kelulusan
          </span>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: pendingCount > 0 ? '#F59E0B' : '#F9FAFB' }}>
            {pendingCount} Marketer
          </span>
        </div>

        <div style={{ background: '#10131A', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#34D399', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
            Diluluskan &amp; Aktif
          </span>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10B981' }}>
            {approvedCount} Marketer
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="spinner" style={{ width: '32px', height: '32px', borderColor: 'rgba(16,185,129,0.2)', borderTopColor: '#10B981' }}></div>
          <span style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Memuatkan senarai marketer...</span>
        </div>
      ) : (
        <div style={{ background: '#10131A', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '1rem', color: '#9CA3AF', fontWeight: 600 }}>NAMA &amp; EMAIL</th>
                  <th style={{ padding: '1rem', color: '#9CA3AF', fontWeight: 600 }}>KOD MARKETER</th>
                  <th style={{ padding: '1rem', color: '#9CA3AF', fontWeight: 600 }}>STATUS</th>
                  <th style={{ padding: '1rem', color: '#9CA3AF', fontWeight: 600 }}>ORDERS</th>
                  <th style={{ padding: '1rem', color: '#9CA3AF', fontWeight: 600 }}>REVENUE</th>
                  <th style={{ padding: '1rem', color: '#9CA3AF', fontWeight: 600 }}>ADS SPEND</th>
                  <th style={{ padding: '1rem', color: '#9CA3AF', fontWeight: 600 }}>PROFIT</th>
                  <th style={{ padding: '1rem', color: '#9CA3AF', fontWeight: 600 }}>GAJI SETTING</th>
                  <th style={{ padding: '1rem', color: '#9CA3AF', fontWeight: 600 }}>TINDAKAN</th>
                </tr>
              </thead>
              <tbody>
                {marketers.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>
                      Tiada marketer berdaftar.
                    </td>
                  </tr>
                ) : (
                  marketers.map(m => {
                    const profit = (m.total_revenue || 0) - (m.total_ads_spend || 0);
                    return (
                      <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 600, color: '#F9FAFB' }}>{m.full_name}</div>
                          <div style={{ color: '#6B7280', fontSize: '0.75rem' }}>{m.email}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontFamily: 'monospace' }}>
                            {m.marketer_code || '-'}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {!m.is_active ? (
                            <button
                              onClick={() => handleStatusChange(m.id, true, m.full_name)}
                              disabled={updatingId === m.id}
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.4)', cursor: 'pointer', fontWeight: 600 }}
                            >
                              Luluskan
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(m.id, false, m.full_name)}
                              disabled={updatingId === m.id}
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.4)', cursor: 'pointer', fontWeight: 600 }}
                            >
                              Aktif
                            </button>
                          )}
                        </td>
                        <td style={{ padding: '1rem', fontWeight: 600 }}>{m.total_orders}</td>
                        <td style={{ padding: '1rem', color: '#10B981' }}>{formatRM(m.total_revenue)}</td>
                        <td style={{ padding: '1rem', color: '#EF4444' }}>{formatRM(m.total_ads_spend)}</td>
                        <td style={{ padding: '1rem', fontWeight: 600, color: profit >= 0 ? '#10B981' : '#EF4444' }}>
                          {formatRM(profit)}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {editingGajiId === m.id ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '150px' }}>
                              <input 
                                type="number" 
                                value={gajiForm.basic} 
                                onChange={e => setGajiForm({...gajiForm, basic: e.target.value})} 
                                placeholder="Basic RM"
                                style={{ background: '#000', border: '1px solid #333', color: '#fff', padding: '0.3rem', borderRadius: '4px' }}
                              />
                              <input 
                                type="number" 
                                value={gajiForm.commission} 
                                onChange={e => setGajiForm({...gajiForm, commission: e.target.value})} 
                                placeholder="Komisen %"
                                style={{ background: '#000', border: '1px solid #333', color: '#fff', padding: '0.3rem', borderRadius: '4px' }}
                              />
                              <div style={{ display: 'flex', gap: '0.3rem' }}>
                                <button onClick={() => handleSaveGaji(m.id)} style={{ flex: 1, background: '#10B981', color: '#fff', border: 'none', padding: '0.3rem', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                                <button onClick={() => setEditingGajiId(null)} style={{ flex: 1, background: '#374151', color: '#fff', border: 'none', padding: '0.3rem', borderRadius: '4px', cursor: 'pointer' }}>Batal</button>
                              </div>
                            </div>
                          ) : (
                            <div onClick={() => startEditGaji(m)} style={{ cursor: 'pointer', padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', border: '1px dashed rgba(255,255,255,0.2)' }} title="Klik untuk edit">
                              <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Basic: <strong style={{ color: '#F9FAFB' }}>RM {m.marketer_basic_salary || 0}</strong></div>
                              <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Komisen: <strong style={{ color: '#F9FAFB' }}>{m.marketer_commission_pct || 0}%</strong></div>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <button
                            onClick={() => handleDeleteMarketer(m.id, m.full_name)}
                            disabled={deletingId === m.id}
                            style={{ padding: '0.4rem', borderRadius: '4px', background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer' }}
                            title="Padam Maklumat Marketer"
                          >
                            Padam
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

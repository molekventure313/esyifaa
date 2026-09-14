'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';

const PERIODS = [
  { id: 'today', label: 'Hari Ini' },
  { id: 'yesterday', label: 'Kelmarin' },
  { id: 'week', label: 'Mingguan' },
  { id: 'month', label: 'Bulanan' },
  { id: 'all', label: 'Keseluruhan' },
];

function getTodayMY() {
  const now = new Date();
  const myNow = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return myNow.toISOString().split('T')[0];
}

function formatRM(val) {
  if (!val && val !== 0) return 'RM 0.00';
  return `RM ${parseFloat(val).toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function MarketerAdsPage() {
  const { showToast } = useToast();
  const [period, setPeriod] = useState('today');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formDate, setFormDate] = useState(getTodayMY());
  const [formAmount, setFormAmount] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [isLightMode, setIsLightMode] = useState(false);
  useEffect(() => {
    const checkTheme = () => {
      setIsLightMode(document.body.classList.contains('light-mode') || document.documentElement.getAttribute('data-theme') === 'light');
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/marketer/ads-spend?period=${period}`);
      const json = await res.json();
      if (json.success) setRecords(json.data || []);
      else throw new Error(json.error);
    } catch (err) {
      showToast(err.message || 'Gagal memuatkan data', 'error');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleEdit = (record) => {
    setEditingId(record.id);
    setFormDate(record.spend_date);
    setFormAmount(String(record.amount));
    setFormNotes(record.notes || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormDate(getTodayMY());
    setFormAmount('');
    setFormNotes('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formAmount || isNaN(parseFloat(formAmount)) || parseFloat(formAmount) < 0) {
      showToast('Sila masukkan jumlah yang sah', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const isEdit = !!editingId;
      const res = await fetch('/api/marketer/ads-spend', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit
          ? { id: editingId, amount: parseFloat(formAmount), notes: formNotes }
          : { spend_date: formDate, amount: parseFloat(formAmount), notes: formNotes }
        ),
      });
      const json = await res.json();
      if (json.success) {
        showToast(isEdit ? 'Rekod berjaya dikemaskini!' : 'Berjaya disimpan!', 'success');
        handleCancelEdit();
        fetchData();
      } else {
        throw new Error(json.error);
      }
    } catch (err) {
      showToast(err.message || 'Ralat semasa menyimpan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const lm = isLightMode;
  const cardBg = lm ? '#FFFFFF' : '#10131A';
  const subCardBg = lm ? '#F8FAFC' : '#090A0F';
  const cardBorder = lm ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)';
  const textPrimary = lm ? '#0F172A' : '#F9FAFB';
  const textSecondary = lm ? '#475569' : '#9CA3AF';
  const textMuted = lm ? '#64748B' : '#6B7280';
  const inputBg = lm ? '#F8FAFC' : '#0D1017';
  const inputBorder = lm ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.12)';

  const totalSpent = records.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

  return (
    <div style={{ fontFamily: 'var(--font-inter), -apple-system, sans-serif', color: textPrimary, padding: '0.25rem 0' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderRadius: '8px', marginBottom: '1.5rem', background: cardBg, border: cardBorder, boxShadow: lm ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 700, margin: '0 0 0.2rem', letterSpacing: '-0.02em' }}>Kos Pengiklanan</h1>
        <p style={{ margin: 0, fontSize: '0.85rem', color: textSecondary }}>Masukkan perbelanjaan iklan harian untuk pengiraan profit.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', padding: '1.25rem 1.4rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Total Spent (RM)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60A5FA', lineHeight: 1 }}>{formatRM(totalSpent)}</div>
        </div>
        <div style={{ background: cardBg, border: cardBorder, borderRadius: '10px', padding: '1.25rem 1.4rem' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Bilangan Rekod</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: textPrimary, lineHeight: 1 }}>{records.length}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem', alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', background: subCardBg, padding: '0.3rem', borderRadius: '8px', border: cardBorder, width: 'fit-content' }}>
            {PERIODS.map(p => (
              <button key={p.id} onClick={() => setPeriod(p.id)} style={{ padding: '0.4rem 1rem', borderRadius: '6px', border: 'none', background: period === p.id ? (lm ? '#10B981' : '#065F46') : 'transparent', color: period === p.id ? '#FFFFFF' : textMuted, fontWeight: period === p.id ? 700 : 500, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                {p.label}
              </button>
            ))}
          </div>

          <div style={{ background: cardBg, borderRadius: '8px', border: cardBorder, overflow: 'hidden' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem', flexDirection: 'column', gap: '0.75rem' }}>
                <span style={{ color: textSecondary, fontSize: '0.82rem' }}>Memuatkan...</span>
              </div>
            ) : records.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: textMuted, fontSize: '0.85rem' }}>Tiada rekod.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: lm ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)', background: subCardBg }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: textSecondary, fontWeight: 700, fontSize: '0.66rem', textTransform: 'uppercase' }}>Tarikh</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: textSecondary, fontWeight: 700, fontSize: '0.66rem', textTransform: 'uppercase' }}>Jumlah (RM)</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: textSecondary, fontWeight: 700, fontSize: '0.66rem', textTransform: 'uppercase' }}>Nota / Platform</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: textSecondary, fontWeight: 700, fontSize: '0.66rem', textTransform: 'uppercase' }}>Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(rec => (
                    <tr key={rec.id} style={{ borderBottom: lm ? '1px solid #F1F5F9' : '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{new Date(rec.spend_date + 'T00:00:00').toLocaleDateString('ms-MY')}</td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', color: '#10B981', fontWeight: 700 }}>{formatRM(rec.amount)}</td>
                      <td style={{ padding: '0.85rem 1rem', color: textSecondary }}>{rec.notes || '-'}</td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <button onClick={() => handleEdit(rec)} style={{ padding: '0.3rem 0.65rem', borderRadius: '5px', background: lm ? '#F1F5F9' : 'rgba(255,255,255,0.06)', border: lm ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.12)', color: textSecondary, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div style={{ position: 'sticky', top: '1rem' }}>
          <div style={{ background: cardBg, borderRadius: '8px', border: editingId ? '1px solid rgba(59,130,246,0.4)' : cardBorder, padding: '1.25rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: textPrimary, marginBottom: '1rem' }}>
              {editingId ? '✏️ Kemaskini Rekod' : '➕ Tambah Perbelanjaan'}
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: textSecondary, marginBottom: '0.4rem' }}>Tarikh</label>
                <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} disabled={!!editingId} style={{ width: '100%', padding: '0.55rem 0.75rem', background: editingId ? (lm ? '#F1F5F9' : '#0A0C12') : inputBg, border: inputBorder, borderRadius: '6px', color: textPrimary, fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box', opacity: editingId ? 0.6 : 1 }} />
              </div>
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: textSecondary, marginBottom: '0.4rem' }}>Jumlah Spent (RM)</label>
                <input type="number" step="0.01" min="0" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} placeholder="0.00" required style={{ width: '100%', padding: '0.55rem 0.75rem', background: inputBg, border: inputBorder, borderRadius: '6px', color: textPrimary, fontSize: '0.9rem', fontWeight: 700, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: textSecondary, marginBottom: '0.4rem' }}>Platform Iklan / Nota</label>
                <input type="text" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Contoh: Facebook Ads" style={{ width: '100%', padding: '0.55rem 0.75rem', background: inputBg, border: inputBorder, borderRadius: '6px', color: textPrimary, fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" disabled={submitting} style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', background: editingId ? 'rgba(59,130,246,0.85)' : '#10B981', color: '#FFFFFF', fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
                {submitting ? 'Menyimpan...' : editingId ? 'Kemaskini' : 'Simpan'}
              </button>
              {editingId && (
                <button type="button" onClick={handleCancelEdit} style={{ width: '100%', marginTop: '0.5rem', padding: '0.55rem', borderRadius: '6px', background: 'transparent', color: textMuted, fontWeight: 600, fontSize: '0.8rem', border: inputBorder, cursor: 'pointer' }}>Batal</button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';

// Input kos ads SATU hari untuk SATU produk — simpan bila Enter / blur.
// Dipakai: page Gaji marketer (/api/marketer/ads-spend) & jadual ads HQ admin (/api/admin/ads-spend).
export default function AdsInput({ date, product, value, disabled, onSaved, lm, textPrimary, endpoint = '/api/marketer/ads-spend' }) {
  const fmt = (v) => (v ? String(parseFloat(v)) : '');
  const [val, setVal]       = useState(fmt(value));
  const [status, setStatus] = useState(null); // 'saving' | 'saved' | 'error'
  const [errMsg, setErrMsg] = useState('');
  const [focused, setFocused] = useState(false);

  // Sync dengan nilai server bila tak sedang ditaip (cth: lepas refresh / tukar bulan)
  useEffect(() => { if (!focused) setVal(fmt(value)); }, [value, focused]);

  const save = async () => {
    const next = val.trim() === '' ? 0 : parseFloat(val);
    if (!Number.isFinite(next) || next < 0) { setStatus('error'); setErrMsg('Jumlah tidak sah'); return; }
    if (Math.abs(next - (parseFloat(value) || 0)) < 0.005) return; // tiada perubahan
    setStatus('saving');
    try {
      const res  = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spend_date: date, product, amount: next }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Gagal simpan');
      setStatus('saved');
      onSaved();
      setTimeout(() => setStatus(s => (s === 'saved' ? null : s)), 2000);
    } catch (e) {
      setStatus('error'); setErrMsg(e.message);
    }
  };

  if (disabled) return <span style={{ opacity: 0.4 }}>—</span>;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end' }}>
      <span style={{ fontSize: '0.72rem', width: '0.9rem', textAlign: 'center' }} title={status === 'error' ? errMsg : ''}>
        {status === 'saving' ? '⏳' : status === 'saved' ? '✅' : status === 'error' ? '⚠️' : ''}
      </span>
      <span style={{ fontSize: '0.72rem', color: '#F59E0B', fontWeight: 600 }}>RM</span>
      <input
        type="number" inputMode="decimal" step="0.01" min="0" placeholder="0"
        value={val}
        onChange={e => { setVal(e.target.value); if (status === 'error') setStatus(null); }}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); save(); }}
        onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
        style={{
          width: '76px', padding: '0.35rem 0.5rem', borderRadius: '6px', textAlign: 'right',
          fontSize: '0.85rem', fontWeight: 600, color: textPrimary, outline: 'none',
          background: lm ? '#FFFBEB' : 'rgba(245,158,11,0.06)',
          border: status === 'error' ? '1px solid #EF4444' : (lm ? '1px solid #FCD34D' : '1px solid rgba(245,158,11,0.3)'),
        }}
      />
    </div>
  );
}


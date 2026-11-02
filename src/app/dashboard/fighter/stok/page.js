'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFighterTheme, Card, Badge, rm, btnStyle, fmtTime } from '@/components/fighter/ui';

// Fighter — Stok & Bil: caj stok HQ (setiap order yang HQ pack), kredit return, bil berkala & resit bayaran

export default function FighterBillingPage() {
  const t = useFighterTheme();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    try {
      const j = await (await fetch('/api/fighter/billing')).json();
      if (!j.success) throw new Error(j.error);
      setData(j); setError('');
    } catch (e) { setError(e.message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const upload = async (billId, file) => {
    if (!file) return;
    setBusy(billId);
    try {
      const fd = new FormData();
      fd.append('bill_id', billId); fd.append('file', file);
      const j = await (await fetch('/api/fighter/billing', { method: 'POST', body: fd })).json();
      if (!j.success) throw new Error(j.error);
      await load();
    } catch (e) { alert(e.message); }
    finally { setBusy(''); }
  };

  if (error) return <div style={{ padding: '1.5rem', color: t.bad, fontFamily: t.ff }}>{error}</div>;
  if (!data) return <div style={{ padding: '1.5rem', color: t.muted, fontFamily: t.ff }}>Memuatkan...</div>;

  const stat = (label, value, color, sub) => (
    <div style={{ background: t.cardBg, border: t.border, borderRadius: 10, padding: '0.9rem 1.1rem', flex: 1, minWidth: 200 }}>
      <div style={{ fontSize: '0.72rem', color: t.muted, fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 800, color, marginTop: '0.2rem' }}>{rm(value)}</div>
      <div style={{ fontSize: '0.72rem', color: t.muted }}>{sub}</div>
    </div>
  );

  return (
    <div style={{ fontFamily: t.ff, color: t.text, maxWidth: 1000 }}>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>FIGHTER · STOK & BIL</div>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0.15rem 0 0' }}>💵 Stok & Bil</h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: t.text2 }}>Setiap order yang HQ pack dicaj pada harga stok anda. Parcel return dikreditkan semula. HQ jana bil secara berkala.</p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {stat('Belum dibil', data.unbilled, t.accent, 'Caj terkumpul — masuk bil seterusnya')}
        {stat('Bil tertunggak', data.outstanding, data.outstanding > 0 ? t.warn : t.ok, data.outstanding > 0 ? 'Sila bayar & upload resit' : 'Tiada bil tertunggak')}
      </div>

      <Card t={t} title="🧾 Bil">
        {!data.bills.length ? <div style={{ fontSize: '0.82rem', color: t.muted }}>Belum ada bil.</div> : data.bills.map(b => (
          <div key={b.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', padding: '0.65rem 0', borderTop: t.border }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{b.bill_no} <Badge ok={b.status === 'paid'}>{b.status === 'paid' ? 'Dibayar' : 'Belum bayar'}</Badge></div>
              <div style={{ fontSize: '0.74rem', color: t.muted }}>{fmtTime(b.period_from)} – {fmtTime(b.period_to)}{b.paid_at ? ` · disahkan ${fmtTime(b.paid_at)}` : ''}</div>
            </div>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>{rm(b.total)}</div>
            {b.receipt_url && <a href={b.receipt_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.78rem', color: '#0EA5E9' }}>Resit</a>}
            {b.status === 'unpaid' && (
              <label style={{ ...btnStyle(t.accent, false), padding: '0.35rem 0.7rem', fontSize: '0.76rem' }}>
                {busy === b.id ? 'Memuat naik...' : b.receipt_path ? 'Tukar resit' : '📎 Upload resit'}
                <input type="file" accept="application/pdf,image/*" style={{ display: 'none' }} onChange={e => upload(b.id, e.target.files?.[0])} />
              </label>
            )}
          </div>
        ))}
      </Card>

      <Card t={t} title="📒 Lejar caj stok" sub="300 rekod terkini.">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead><tr>{['Tarikh', 'Butiran', 'Unit', 'Harga seunit', 'Jumlah', 'Bil'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '0.45rem', color: t.muted, fontSize: '0.7rem', textTransform: 'uppercase' }}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {data.ledger.map(r => (
                <tr key={r.id} style={{ borderTop: t.border }}>
                  <td style={{ padding: '0.45rem', whiteSpace: 'nowrap' }}>{fmtTime(r.created_at)}</td>
                  <td style={{ padding: '0.45rem' }}>{r.kind === 'credit' ? '↩️ ' : ''}{r.notes}</td>
                  <td style={{ padding: '0.45rem' }}>{r.qty}</td>
                  <td style={{ padding: '0.45rem' }}>{rm(r.unit_price)}</td>
                  <td style={{ padding: '0.45rem', fontWeight: 700, color: r.amount < 0 ? t.ok : t.text }}>{r.amount < 0 ? `−${rm(-r.amount)}` : rm(r.amount)}</td>
                  <td style={{ padding: '0.45rem', color: t.muted }}>{r.bill_id ? '✓' : '—'}</td>
                </tr>
              ))}
              {!data.ledger.length && <tr><td colSpan={6} style={{ padding: '1rem', color: t.muted }}>Belum ada caj.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFighterTheme, Card, Badge, rm, btnStyle, fmtTime } from '@/components/fighter/ui';

// HQ — Bil & Override Fighter (super_admin)
// Override HQ = markup × unit yang dipack (bersih selepas return). Bil dijana dari caj belum dibil.

const monthLabel = k => new Date(`${k}-01T00:00:00`).toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' });

export default function FighterBillsPage() {
  const t = useFighterTheme();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    try {
      const j = await (await fetch('/api/admin/fighter-billing')).json();
      if (!j.success) throw new Error(j.error);
      setData(j); setError('');
    } catch (e) { setError(e.message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const call = async (key, method, body, note) => {
    setBusy(key); setMsg(null);
    try {
      const j = await (await fetch('/api/admin/fighter-billing', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).json();
      if (!j.success) throw new Error(j.error);
      setMsg({ ok: true, text: note(j) });
      await load();
    } catch (e) { setMsg({ ok: false, text: e.message }); }
    finally { setBusy(''); }
  };

  if (error) return <div style={{ padding: '1.5rem', color: t.bad, fontFamily: t.ff }}>{error}</div>;
  if (!data) return <div style={{ padding: '1.5rem', color: t.muted, fontFamily: t.ff }}>Memuatkan...</div>;

  const months = Object.keys(data.months).sort().reverse();
  const th = { textAlign: 'left', padding: '0.45rem', color: t.muted, fontSize: '0.7rem', textTransform: 'uppercase' };
  const td = { padding: '0.5rem 0.45rem', fontSize: '0.82rem', borderTop: t.border };
  const genNote = j => (j.created.length ? `${j.created.length} bil dijana (${j.created.map(b => `${b.bill_no} ${rm(b.total)}`).join(', ')}).` : 'Tiada caj belum dibil.');

  return (
    <div style={{ fontFamily: t.ff, color: t.text, maxWidth: 1100 }}>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>ADMIN · PENJUAL BEBAS</div>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0.15rem 0 0' }}>💵 Bil & Override Fighter</h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: t.text2 }}>Override HQ = markup × unit dipack (bersih selepas return). Jana bil mingguan / bulanan dari caj belum dibil.</p>
      </div>
      {msg && <div style={{ fontSize: '0.82rem', marginBottom: '0.75rem', color: msg.ok ? t.ok : t.bad }}>{msg.ok ? '✅' : '⚠️'} {msg.text}</div>}

      <Card t={t} title="📈 Override HQ ikut bulan (semua fighter)">
        {!months.length ? <div style={{ fontSize: '0.82rem', color: t.muted }}>Belum ada caj stok.</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={th}>Bulan</th><th style={th}>Unit</th><th style={th}>Caj stok (bersih)</th><th style={th}>Override HQ</th></tr></thead>
            <tbody>{months.map(k => (
              <tr key={k}><td style={td}>{monthLabel(k)}</td><td style={td}>{data.months[k].units}</td><td style={td}>{rm(data.months[k].net)}</td>
                <td style={{ ...td, fontWeight: 800, color: t.ok }}>{rm(data.months[k].markup)}</td></tr>
            ))}</tbody>
          </table>
        )}
      </Card>

      <Card t={t} title="🥊 Setiap fighter">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
          <button style={btnStyle()} disabled={!!busy} onClick={() => confirm('Jana bil untuk SEMUA fighter yang ada caj belum dibil?') && call('all', 'POST', { action: 'generate' }, genNote)}>
            {busy === 'all' ? 'Menjana...' : '🧾 Jana bil semua'}
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={th}>Fighter</th><th style={th}>Bulan ini (unit / override)</th><th style={th}>Belum dibil</th><th style={th}>Tertunggak</th><th style={th}></th></tr></thead>
            <tbody>{data.summary.map(f => {
              const cur = f.months[new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 7)];
              return (
                <tr key={f.id}>
                  <td style={td}>{f.name}</td>
                  <td style={td}>{cur ? `${cur.units} unit · ${rm(cur.markup)}` : '—'}</td>
                  <td style={{ ...td, color: f.unbilled < 0 ? t.ok : t.text }}>{f.unbilled < 0 ? `HQ bayar ${rm(-f.unbilled)}` : rm(f.unbilled)}</td>
                  <td style={{ ...td, color: f.outstanding > 0 ? t.warn : f.outstanding < 0 ? t.ok : t.text, fontWeight: f.outstanding !== 0 ? 700 : 400 }}>{f.outstanding < 0 ? `HQ bayar ${rm(-f.outstanding)}` : rm(f.outstanding)}</td>
                  <td style={td}>
                    <button style={{ ...btnStyle(t.accent, false), padding: '0.3rem 0.6rem', fontSize: '0.74rem' }} disabled={!!busy || Math.abs(f.unbilled) < 0.005}
                      onClick={() => call(f.id, 'POST', { action: 'generate', fighter_id: f.id }, genNote)}>{busy === f.id ? '...' : 'Jana bil'}</button>
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
          {!data.summary.length && <div style={{ fontSize: '0.82rem', color: t.muted, padding: '0.5rem' }}>Belum ada fighter.</div>}
        </div>
      </Card>

      <Card t={t} title="🧾 Bil">
        {!data.bills.length ? <div style={{ fontSize: '0.82rem', color: t.muted }}>Belum ada bil.</div> : data.bills.map(b => (
          <div key={b.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', padding: '0.6rem 0', borderTop: t.border }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>{b.bill_no} <Badge ok={b.status === 'paid'}>{b.total < 0 ? (b.status === 'paid' ? 'HQ dah bayar fighter' : 'HQ perlu bayar fighter') : (b.status === 'paid' ? 'Dibayar' : 'Belum bayar')}</Badge></div>
              <div style={{ fontSize: '0.74rem', color: t.muted }}>{b.fighter_name} · {fmtTime(b.period_from)} – {fmtTime(b.period_to)} · override {rm(b.markup_total)}{b.paid_ref ? ` · ref ${b.paid_ref}` : ''}</div>
            </div>
            <div style={{ fontWeight: 800, color: b.total < 0 ? t.ok : t.text }}>{b.total < 0 ? `−${rm(-b.total)}` : rm(b.total)}</div>
            {b.receipt_url ? <a href={b.receipt_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.78rem', color: '#0EA5E9' }}>📎 Resit</a> : <span style={{ fontSize: '0.74rem', color: t.muted }}>tiada resit</span>}
            {b.status === 'unpaid'
              ? <button style={{ ...btnStyle(t.ok), padding: '0.3rem 0.65rem', fontSize: '0.74rem' }} disabled={!!busy}
                  onClick={() => { const ref = prompt(b.total < 0 ? `Sahkan HQ DAH BAYAR ${rm(-b.total)} kepada fighter (bil ${b.bill_no})?\nNo. rujukan pindahan (pilihan):` : `Sahkan bil ${b.bill_no} (${rm(b.total)}) DIBAYAR?\nNo. rujukan bayaran (pilihan):`, ''); if (ref !== null) call(b.id, 'PATCH', { bill_id: b.id, status: 'paid', ref }, () => 'Bil disahkan dibayar.'); }}>✅ Sahkan bayar</button>
              : <button style={{ ...btnStyle(t.muted, false), padding: '0.3rem 0.65rem', fontSize: '0.74rem' }} disabled={!!busy}
                  onClick={() => confirm('Batalkan pengesahan bayaran?') && call(b.id, 'PATCH', { bill_id: b.id, status: 'unpaid' }, () => 'Status bil dikembalikan ke belum bayar.')}>Batal sah</button>}
          </div>
        ))}
      </Card>
    </div>
  );
}

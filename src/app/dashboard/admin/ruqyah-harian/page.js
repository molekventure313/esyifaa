'use client';

import { useState, useEffect, useCallback } from 'react';

// Pelanggan Ruqyah Harian — senarai nama untuk dibacakan, tempoh langganan & peringatan sambung

const STATUS = {
  aktif:    { label: '● Aktif',         color: '#10B981' },
  hampir:   { label: '⏳ Hampir tamat',  color: '#F59E0B' },
  menunggu: { label: '🕒 Belum mula',    color: '#60A5FA' },
  tamat:    { label: '○ Tamat',          color: '#EF4444' },
};

function useLightMode() {
  const [lm, setLm] = useState(false);
  useEffect(() => {
    const check = () => setLm(document.body.classList.contains('light-mode') || document.documentElement.getAttribute('data-theme') === 'light');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return lm;
}

const fmt = d => new Date(d).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' });
const waLink = (phone, msg) => `https://wa.me/${String(phone).replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;

export default function RuqyahHarianAdminPage() {
  const lm = useLightMode();
  const cardBg = lm ? '#FFFFFF' : '#10131A';
  const subBg = lm ? '#F8FAFC' : '#090A0F';
  const border = lm ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.08)';
  const tp = lm ? '#0F172A' : '#F9FAFB';
  const ts = lm ? '#475569' : '#9CA3AF';
  const tm = lm ? '#64748B' : '#6B7280';
  const ff = 'var(--font-inter), -apple-system, sans-serif';

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('semasa');   // semasa (aktif+hampir+menunggu) | hampir | tamat | semua
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    try {
      const json = await (await fetch('/api/admin/ruqyah-harian')).json();
      if (!json.success) throw new Error(json.error);
      setData(json); setError('');
    } catch (e) { setError(e.message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const rows = (data?.rows || []).filter(r => {
    if (filter === 'semasa' && r.status === 'tamat') return false;
    if (filter === 'hampir' && r.status !== 'hampir') return false;
    if (filter === 'tamat' && r.status !== 'tamat') return false;
    const s = q.trim().toLowerCase();
    return !s || (r.full_name || '').toLowerCase().includes(s) || (r.phone || '').includes(s);
  });

  const copyNames = () => {
    const names = (data?.rows || []).filter(r => r.status === 'aktif' || r.status === 'hampir').map((r, i) => `${i + 1}. ${r.full_name}`).join('\n');
    navigator.clipboard?.writeText(names);
    alert(`${names.split('\n').filter(Boolean).length} nama aktif disalin.`);
  };

  const c = data?.counts || {};
  const sl = data?.slots;

  return (
    <div style={{ fontFamily: ff, color: tp, padding: '0.25rem 0' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderRadius: '8px', marginBottom: '1.25rem', background: cardBg, border, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>🌙 Ruqyah Harian E-Syifa</h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: ts }}>Pelanggan langganan — dibacakan 2x sehari. Sambungan langganan bermula selepas tempoh lama tamat.</p>
        </div>
        <button onClick={copyNames} style={{ padding: '0.5rem 0.9rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', fontFamily: ff, background: '#10B981', color: '#fff' }}>📋 Salin senarai nama aktif</button>
      </div>

      {error ? (
        <div style={{ padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: '0.85rem' }}>⚠️ {error}</div>
      ) : !data ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: tm }}>Memuatkan...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {[
              ['🔥 Slot baru bulan ini', `${sl.used} / ${sl.max}`, sl.remaining <= 10 ? '#EF4444' : '#10B981'],
              ['● Aktif', c.aktif || 0, '#10B981'],
              ['⏳ Hampir tamat (≤7 hari)', c.hampir || 0, '#F59E0B'],
              ['🕒 Belum mula (sambungan)', c.menunggu || 0, '#60A5FA'],
              ['○ Tamat', c.tamat || 0, '#EF4444'],
            ].map(([l, v, col]) => (
              <div key={l} style={{ background: cardBg, border, borderRadius: '10px', padding: '0.9rem 1rem' }}>
                <div style={{ fontSize: '0.72rem', color: ts, fontWeight: 700 }}>{l}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: col, marginTop: '0.25rem' }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
            {[['semasa', 'Semasa'], ['hampir', 'Hampir tamat'], ['tamat', 'Tamat'], ['semua', 'Semua']].map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} style={{ padding: '0.4rem 0.8rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: ff, border: filter === k ? '1px solid #10B981' : border, background: filter === k ? 'rgba(16,185,129,0.12)' : 'transparent', color: filter === k ? '#10B981' : ts }}>{l}</button>
            ))}
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cari nama / phone..." style={{ flex: '1 1 200px', padding: '0.5rem 0.7rem', borderRadius: '6px', fontSize: '0.85rem', fontFamily: ff, border, background: lm ? '#fff' : '#0B0D13', color: tp }} />
          </div>

          <div style={{ background: cardBg, border, borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                <thead>
                  <tr style={{ background: subBg }}>
                    {['Pesakit', 'Pakej', 'Mula', 'Tamat', 'Baki', 'Status', 'Tindakan'].map(h => (
                      <th key={h} style={{ padding: '0.7rem 0.9rem', textAlign: 'left', fontSize: '0.7rem', textTransform: 'uppercase', color: ts, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => {
                    const st = STATUS[r.status];
                    return (
                      <tr key={r.id} style={{ borderTop: border, verticalAlign: 'top' }}>
                        <td style={{ padding: '0.7rem 0.9rem', minWidth: '180px' }}>
                          <div style={{ fontWeight: 700 }}>{r.full_name}</div>
                          <div style={{ fontSize: '0.75rem', color: tm }}>{r.phone}</div>
                          {r.problem && <div style={{ fontSize: '0.74rem', color: ts, marginTop: '0.2rem', maxWidth: '260px' }}>{r.problem}</div>}
                        </td>
                        <td style={{ padding: '0.7rem 0.9rem', whiteSpace: 'nowrap' }}>
                          {r.months} Bulan · RM{r.amount}
                          {r.renewal && <div style={{ fontSize: '0.7rem', color: '#A78BFA' }}>↻ sambungan</div>}
                        </td>
                        <td style={{ padding: '0.7rem 0.9rem', whiteSpace: 'nowrap', color: ts }}>{fmt(r.start)}</td>
                        <td style={{ padding: '0.7rem 0.9rem', whiteSpace: 'nowrap', color: ts }}>{fmt(r.end)}</td>
                        <td style={{ padding: '0.7rem 0.9rem', whiteSpace: 'nowrap', fontWeight: 700 }}>{r.days_left > 0 ? `${r.days_left} hari` : '—'}</td>
                        <td style={{ padding: '0.7rem 0.9rem', whiteSpace: 'nowrap', color: st.color, fontWeight: 700 }}>{st.label}</td>
                        <td style={{ padding: '0.7rem 0.9rem', whiteSpace: 'nowrap' }}>
                          <a href={waLink(r.phone, r.status === 'hampir' || r.status === 'tamat'
                            ? `Assalamualaikum ${r.full_name}, langganan Ruqyah Harian E-Syifa anda ${r.status === 'tamat' ? 'telah tamat' : `akan tamat pada ${fmt(r.end)}`}. Nak sambung supaya bacaan ruqyah harian berterusan?`
                            : `Assalamualaikum ${r.full_name}, terima kasih kerana melanggan Ruqyah Harian E-Syifa. Boleh hantar nama penuh & gambar diri untuk bacaan?`)}
                            target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: '0.75rem', fontWeight: 700, color: '#25D366', textDecoration: 'none' }}>
                            💬 {r.status === 'hampir' || r.status === 'tamat' ? 'Ingatkan sambung' : 'WhatsApp'}
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                  {!rows.length && <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: tm }}>Tiada pelanggan.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

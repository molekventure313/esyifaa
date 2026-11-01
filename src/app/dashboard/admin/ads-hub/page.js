'use client';
import { useState, useEffect } from 'react';
import { AdsHubDashboard, useLightMode, theme } from '@/components/dashboard/AdsHub';
import { AlertsPanel, LatestReport, ReportsTab, LogTab, RulesTab } from '@/components/dashboard/AdsHubExtras';

const TABS = [
  { id: 'dashboard', label: '📈 Dashboard' },
  { id: 'reports', label: '☀️ Laporan' },
  { id: 'rules', label: '🤖 Peraturan & Jadual' },
  { id: 'log', label: '📜 Log' },
];

// super_admin: lihat Ads Hub mana-mana marketer (baca sahaja — sambungan diurus marketer sendiri)
export default function AdminAdsHubPage() {
  const t = theme(useLightMode());
  const [marketers, setMarketers] = useState(null);
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState('dashboard');

  useEffect(() => {
    fetch('/api/ads-hub/marketers').then(r => r.json()).then(j => {
      if (!j.success) return setError(j.error || 'Gagal muatkan senarai marketer.');
      setMarketers(j.marketers);
      const first = j.marketers.find(m => m.connection);
      if (first) setSelected(first.id);
    }).catch(() => setError('Gagal muatkan senarai marketer.'));
  }, []);

  const connected = (marketers || []).filter(m => m.connection);
  const notConnected = (marketers || []).filter(m => !m.connection);

  return (
    <div style={{ fontFamily: t.ff, color: t.text }}>
      <div style={{ padding: '1.2rem 1.5rem', borderRadius: 8, marginBottom: '1.25rem', background: t.cardBg, border: t.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.15rem' }}>ADMIN · IKLAN META</div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>📈 Ads Hub Marketer</h1>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: t.text2 }}>
            {marketers ? `${connected.length} daripada ${marketers.length} marketer dah sambung akaun Meta` : 'Prestasi iklan setiap marketer, ROAS dari order sebenar'}
          </p>
        </div>
        {marketers && (
          <select id="ads-hub-marketer" value={selected} onChange={e => setSelected(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: t.border, background: t.cardBg, color: t.text, fontSize: '0.85rem', fontFamily: t.ff, minWidth: 240 }}>
            <option value="" disabled>Pilih marketer…</option>
            {connected.length > 0 && (
              <optgroup label="Dah sambung">
                {connected.map(m => <option key={m.id} value={m.id}>{m.name}{m.connection.status === 'error' ? ' ⚠️' : ''} · {m.connection.ad_account_name}</option>)}
              </optgroup>
            )}
            {notConnected.length > 0 && (
              <optgroup label="Belum sambung">
                {notConnected.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </optgroup>
            )}
          </select>
        )}
      </div>

      {error && <div style={{ padding: '1rem', color: t.bad }}>{error}</div>}
      {selected && (
        <div style={{ display: 'inline-flex', background: t.lm ? '#F1F5F9' : '#090A0F', padding: 3, borderRadius: 8, border: t.border, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {TABS.map(x => (
            <button key={x.id} onClick={() => setTab(x.id)} style={{
              padding: '0.42rem 0.85rem', borderRadius: 5, fontSize: '0.8rem', fontWeight: tab === x.id ? 700 : 500, border: 'none', cursor: 'pointer', fontFamily: t.ff,
              background: tab === x.id ? (t.lm ? '#FFFFFF' : '#064E3B') : 'transparent', color: tab === x.id ? t.accent : t.text2,
            }}>{x.label}</button>
          ))}
        </div>
      )}
      {selected
        ? (
          <div key={`${selected}-${tab}`}>
            {tab === 'dashboard' && (
              <>
                <LatestReport marketerId={selected} canEdit={false} />
                <AlertsPanel marketerId={selected} canEdit={false} />
                <AdsHubDashboard marketerId={selected} canEdit={false} />
              </>
            )}
            {tab === 'reports' && <ReportsTab marketerId={selected} />}
            {tab === 'rules' && <RulesTab marketerId={selected} canEdit={false} />}
            {tab === 'log' && <LogTab marketerId={selected} />}
          </div>
        )
        : marketers && <div style={{ padding: '2.5rem', textAlign: 'center', color: t.muted }}>Belum ada marketer yang sambung akaun Meta. Marketer sambung melalui menu Ads Hub → Tetapan.</div>}
    </div>
  );
}

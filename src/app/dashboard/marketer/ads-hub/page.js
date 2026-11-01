'use client';
import { useState, useEffect } from 'react';
import { AdsHubDashboard, AdsHubSettings, useLightMode, theme } from '@/components/dashboard/AdsHub';
import { AlertsPanel, LatestReport, ReportsTab, LogTab, RulesTab, LimitsCard, ChatPanel } from '@/components/dashboard/AdsHubExtras';

const TABS = [
  { id: 'dashboard', label: '📈 Dashboard' },
  { id: 'reports', label: '☀️ Laporan' },
  { id: 'rules', label: '🤖 Peraturan & Jadual' },
  { id: 'log', label: '📜 Log' },
  { id: 'settings', label: '⚙️ Tetapan' },
];

export default function MarketerAdsHubPage() {
  const t = theme(useLightMode());
  const [tab, setTab] = useState('dashboard');
  const [version, setVersion] = useState(0);
  const [connected, setConnected] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const bump = () => setVersion(v => v + 1);

  // Belum sambung → terus ke Tetapan
  useEffect(() => {
    fetch('/api/ads-hub/connection').then(r => r.json()).then(j => {
      if (j.success && !j.connection) setTab('settings');
      setConnected(!!j.connection);
    }).catch(() => {});
  }, [version]);

  return (
    <div style={{ fontFamily: t.ff, color: t.text }}>
      <div style={{ padding: '1.2rem 1.5rem', borderRadius: 8, marginBottom: '1.25rem', background: t.cardBg, border: t.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.15rem' }}>MARKETER · IKLAN META</div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>📈 Ads Hub</h1>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: t.text2 }}>Prestasi setiap ad dengan ROAS dari order sebenar, bukan pixel</p>
        </div>
        <div style={{ display: 'inline-flex', background: t.lm ? '#F1F5F9' : '#090A0F', padding: 3, borderRadius: 8, border: t.border, flexWrap: 'wrap' }}>
          {TABS.map(x => (
            <button key={x.id} onClick={() => setTab(x.id)} style={{
              padding: '0.42rem 0.85rem', borderRadius: 5, fontSize: '0.8rem', fontWeight: tab === x.id ? 700 : 500, border: 'none', cursor: 'pointer', fontFamily: t.ff,
              background: tab === x.id ? (t.lm ? '#FFFFFF' : '#064E3B') : 'transparent', color: tab === x.id ? t.accent : t.text2,
            }}>{x.label}</button>
          ))}
        </div>
      </div>

      {tab === 'dashboard' && (
        <div key={version}>
          {connected && <LatestReport canEdit />}
          {connected && <AlertsPanel canEdit onChanged={bump} />}
          <AdsHubDashboard canEdit onOpenSettings={() => setTab('settings')} />
        </div>
      )}
      {tab === 'reports' && <ReportsTab />}
      {tab === 'rules' && <RulesTab canEdit />}
      {tab === 'log' && <LogTab key={version} />}
      {tab === 'settings' && (
        <>
          <AdsHubSettings onChanged={bump} />
          {connected && <div style={{ maxWidth: 820, marginTop: '1.5rem' }}><LimitsCard /></div>}
        </>
      )}

      {connected && !chatOpen && (
        <button onClick={() => setChatOpen(true)} style={{
          position: 'fixed', right: 'max(20px, env(safe-area-inset-right, 0px))', bottom: 'max(20px, env(safe-area-inset-bottom, 0px))', zIndex: 50,
          padding: '0.8rem 1.1rem', borderRadius: 999, border: 'none', background: '#10B981', color: '#fff', fontWeight: 800, fontSize: '0.9rem',
          boxShadow: '0 6px 20px rgba(16,185,129,0.4)', cursor: 'pointer', fontFamily: t.ff,
        }}>💬 Chat Ads</button>
      )}
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} onChanged={bump} />
    </div>
  );
}

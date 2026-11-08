'use client';
import { useState, useEffect } from 'react';
import { AdsHubDashboard, AdsHubSettings, useLightMode, theme, btn } from '@/components/dashboard/AdsHub';
import { AlertsPanel, LatestReport, ReportsTab, LogTab, RulesTab, LimitsCard, SpendCard, AgentCard, ChatPanel, ClaudeKeyCard, AutopilotCard, StrategiesPanel } from '@/components/dashboard/AdsHubExtras';

const TABS = [
  { id: 'dashboard', label: '📈 Dashboard' },
  { id: 'reports', label: '☀️ Laporan' },
  { id: 'rules', label: '🤖 Peraturan & Jadual' },
  { id: 'log', label: '📜 Log' },
  { id: 'settings', label: '⚙️ Tetapan' },
];
const HQ = 'hq';

// Borang ringkas cipta ejen AI marketer (profil marketer tanpa login, gaji/komisen 0)
function NewAgentForm({ t, onCreated, onCancel }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const field = { padding: '0.45rem 0.6rem', borderRadius: 6, border: t.border, background: t.headBg, color: t.text, fontSize: '0.85rem', fontFamily: t.ff };
  const submit = async () => {
    setBusy(true); setErr('');
    const j = await fetch('/api/ads-hub/agents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, code }) })
      .then(r => r.json()).catch(() => ({ success: false, error: 'Gagal hubungi server.' }));
    setBusy(false);
    if (!j.success) return setErr(j.error);
    onCreated(j.agent);
  };
  return (
    <div style={{ padding: '1rem 1.25rem', borderRadius: 8, marginBottom: '1.25rem', background: t.cardBg, border: t.border }}>
      <div style={{ fontWeight: 800, marginBottom: 4 }}>🤖 Ejen AI baru</div>
      <div style={{ fontSize: '0.78rem', color: t.text2, marginBottom: 10 }}>
        Ejen ialah profil marketer sendiri: kod untuk link SP (<code>?m=kod</code>), ad account, Page dan pixel sendiri. Ejen tidak boleh log masuk, dan gaji serta komisennya 0.
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input id="agent-name" value={name} onChange={e => setName(e.target.value)} placeholder="Nama, cth: Ejen AI 1" maxLength={60} style={{ ...field, minWidth: 200 }} />
        <input id="agent-code" value={code} onChange={e => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="Kod, cth: ai-01" maxLength={20} style={{ ...field, width: 140 }} />
        <button onClick={submit} disabled={busy || !name || code.length < 2} style={btn(t, true)}>{busy ? 'Mencipta...' : 'Cipta ejen'}</button>
        <button onClick={onCancel} style={btn(t)}>Batal</button>
      </div>
      {err && <div style={{ color: t.bad, fontSize: '0.8rem', marginTop: 8 }}>{err}</div>}
    </div>
  );
}

// super_admin: urus Ads Hub akaun HQ sendiri dan mana-mana marketer (tetapan, chat & tindakan penuh).
// Komponen terima marketerId; kosong = akaun HQ (id super_admin sendiri).
export default function AdminAdsHubPage() {
  const t = theme(useLightMode());
  const [marketers, setMarketers] = useState(null);
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');
  const [tab, setTab] = useState('dashboard');
  const [conn, setConn] = useState(undefined);
  const [hqConn, setHqConn] = useState(undefined);
  const [version, setVersion] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [newAgent, setNewAgent] = useState(false);
  const [strategies, setStrategies] = useState(false);
  const bump = () => setVersion(v => v + 1);
  const isHq = selected === HQ;
  const mid = isHq ? undefined : selected || undefined;
  const current = (marketers || []).find(m => m.id === selected);
  const who = isHq ? 'HQ' : current?.name;

  useEffect(() => {
    fetch('/api/ads-hub/marketers').then(r => r.json()).then(j => {
      if (!j.success) return setError(j.error || 'Gagal muatkan senarai marketer.');
      setMarketers(j.marketers);
      const first = j.marketers.find(m => m.connection);
      setSelected(s => s || (first ? first.id : HQ));
    }).catch(() => setError('Gagal muatkan senarai marketer.'));
    fetch('/api/ads-hub/connection').then(r => r.json()).then(j => j.success && setHqConn(j.connection)).catch(() => {});
  }, [version]);

  // Sambungan akaun yang dipilih → belum sambung, terus ke Tetapan
  useEffect(() => {
    if (!selected) return;
    setConn(undefined);
    fetch(`/api/ads-hub/connection${mid ? `?marketer=${mid}` : ''}`).then(r => r.json()).then(j => {
      if (!j.success) return;
      setConn(j.connection);
      if (!j.connection) setTab('settings');
    }).catch(() => {});
  }, [selected, mid, version]);

  const agents = (marketers || []).filter(m => m.is_ai_agent);
  const humans = (marketers || []).filter(m => !m.is_ai_agent);
  const connected = humans.filter(m => m.connection);
  const notConnected = humans.filter(m => !m.connection);
  const optLabel = m => `${m.name}${m.connection ? `${m.connection.status === 'error' ? ' ⚠️' : ''} · ${m.connection.ad_account_name}` : ' · belum sambung'}`;

  return (
    <div style={{ fontFamily: t.ff, color: t.text }}>
      <div style={{ padding: '1.2rem 1.5rem', borderRadius: 8, marginBottom: '1.25rem', background: t.cardBg, border: t.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.15rem' }}>ADMIN · IKLAN META</div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>📈 Ads Hub Marketer</h1>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: t.text2 }}>
            {marketers ? `${agents.length} ejen AI · ${connected.length} daripada ${humans.length} marketer dah sambung akaun Meta` : 'Prestasi iklan setiap marketer, ROAS dari order sebenar'}
          </p>
        </div>
        {marketers && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setStrategies(v => !v)} style={btn(t, strategies)}>🧠 Templat Strategi</button>
          <button onClick={() => setNewAgent(v => !v)} style={btn(t)}>+ Ejen AI</button>
          <select id="ads-hub-marketer" value={selected} onChange={e => { setSelected(e.target.value); setTab('dashboard'); setChatOpen(false); }}
            style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: t.border, background: t.cardBg, color: t.text, fontSize: '0.85rem', fontFamily: t.ff, minWidth: 240 }}>
            <option value="" disabled>Pilih akaun…</option>
            <option value={HQ}>🏢 HQ (akaun saya){hqConn ? ` · ${hqConn.ad_account_name}` : ' · belum sambung'}</option>
            {agents.length > 0 && (
              <optgroup label="🤖 Ejen AI">
                {agents.map(m => <option key={m.id} value={m.id}>{optLabel(m)}</option>)}
              </optgroup>
            )}
            {connected.length > 0 && (
              <optgroup label="👤 Marketer · dah sambung">
                {connected.map(m => <option key={m.id} value={m.id}>{optLabel(m)}</option>)}
              </optgroup>
            )}
            {notConnected.length > 0 && (
              <optgroup label="👤 Marketer · belum sambung">
                {notConnected.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </optgroup>
            )}
          </select>
          </div>
        )}
      </div>

      {error && <div style={{ padding: '1rem', color: t.bad }}>{error}</div>}
      {strategies && <div style={{ marginBottom: '1.25rem' }}><StrategiesPanel onClose={() => setStrategies(false)} /></div>}
      {newAgent && (
        <NewAgentForm t={t} onCancel={() => setNewAgent(false)}
          onCreated={a => { setNewAgent(false); setSelected(a.id); setTab('settings'); bump(); }} />
      )}
      {selected && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <div style={{ display: 'inline-flex', background: t.lm ? '#F1F5F9' : '#090A0F', padding: 3, borderRadius: 8, border: t.border, flexWrap: 'wrap' }}>
              {TABS.map(x => (
                <button key={x.id} onClick={() => setTab(x.id)} style={{
                  padding: '0.42rem 0.85rem', borderRadius: 5, fontSize: '0.8rem', fontWeight: tab === x.id ? 700 : 500, border: 'none', cursor: 'pointer', fontFamily: t.ff,
                  background: tab === x.id ? (t.lm ? '#FFFFFF' : '#064E3B') : 'transparent', color: tab === x.id ? t.accent : t.text2,
                }}>{x.label}</button>
              ))}
            </div>
            {!isHq && who && <span style={{ fontSize: '0.78rem', color: t.text2 }}>Anda mengurus akaun {current?.is_ai_agent ? '🤖 ' : ''}<strong style={{ color: t.text }}>{who}</strong>{current?.code ? ` (kod ${current.code})` : ''}. Perubahan direkod atas nama anda.</span>}
          </div>

          <div key={`${selected}-${tab}-${version}`}>
            {tab === 'dashboard' && (
              <>
                {conn && <LatestReport marketerId={mid} canEdit />}
                {conn && <AlertsPanel marketerId={mid} canEdit onChanged={bump} />}
                <AdsHubDashboard marketerId={mid} canEdit onOpenSettings={() => setTab('settings')} />
              </>
            )}
            {tab === 'reports' && <ReportsTab marketerId={mid} />}
            {tab === 'rules' && <RulesTab marketerId={mid} canEdit autopilot />}
            {tab === 'log' && <LogTab marketerId={mid} />}
            {tab === 'settings' && (
              <>
                {current?.is_ai_agent && <div style={{ maxWidth: 820, marginBottom: '1.5rem' }}><AgentCard marketerId={mid} /></div>}
                <AdsHubSettings marketerId={mid} onChanged={bump} />
                {conn && <div style={{ maxWidth: 820, marginTop: '1.5rem' }}><SpendCard marketerId={mid} isAgent={!!current?.is_ai_agent} /></div>}
                {conn && <div style={{ maxWidth: 820, marginTop: '1.5rem' }}><LimitsCard marketerId={mid} /></div>}
                {conn && <div style={{ maxWidth: 820, marginTop: '1.5rem' }}><AutopilotCard key={mid || 'hq'} marketerId={mid} /></div>}
                {conn && !current?.is_ai_agent && <div style={{ maxWidth: 820, marginTop: '1.5rem' }}><ClaudeKeyCard marketerId={mid} /></div>}
              </>
            )}
          </div>

          {conn && !chatOpen && (
            <button onClick={() => setChatOpen(true)} style={{
              position: 'fixed', right: 'max(20px, env(safe-area-inset-right, 0px))', bottom: 'max(20px, env(safe-area-inset-bottom, 0px))', zIndex: 50,
              padding: '0.8rem 1.1rem', borderRadius: 999, border: 'none', background: '#10B981', color: '#fff', fontWeight: 800, fontSize: '0.9rem',
              boxShadow: '0 6px 20px rgba(16,185,129,0.4)', cursor: 'pointer', fontFamily: t.ff,
            }}>💬 Chat Ads{isHq ? '' : ` · ${who || ''}`}</button>
          )}
          <ChatPanel key={selected} marketerId={mid} open={chatOpen} onClose={() => setChatOpen(false)} onChanged={bump} />
        </>
      )}
    </div>
  );
}

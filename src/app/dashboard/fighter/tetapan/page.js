'use client';

import { useState, useEffect } from 'react';
import { useFighterTheme, Card, Badge, inputStyle, btnStyle, fmtTime } from '@/components/fighter/ui';

// Fighter — Tetapan akaun: CHIP (FPX) sendiri, Claude API (SP Generator), Pixel, WhatsApp, pengirim NinjaVan.
// Key rahsia disimpan bersulit di server — selepas disimpan hanya 4 aksara akhir dipaparkan.

function Field({ t, label, hint, children }) {
  return (
    <label style={{ display: 'block', marginBottom: '0.85rem' }}>
      <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.3rem', color: t.text }}>{label}</div>
      {children}
      {hint && <div style={{ fontSize: '0.72rem', color: t.muted, marginTop: '0.25rem', lineHeight: 1.45 }}>{hint}</div>}
    </label>
  );
}

function StatusLine({ t, status, message, at }) {
  if (!status) return <div style={{ fontSize: '0.75rem', color: t.muted }}>Belum disambung.</div>;
  return (
    <div style={{ fontSize: '0.75rem', color: status === 'ok' ? t.ok : t.bad, display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <Badge ok={status === 'ok'}>{status === 'ok' ? '✅ Bersambung' : '⚠️ Ralat'}</Badge>
      <span>{message}</span>
      <span style={{ color: t.muted }}>· disemak {fmtTime(at)}</span>
    </div>
  );
}

export default function FighterSettingsPage() {
  const t = useFighterTheme();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null);   // { section, ok, text }
  const [f, setF] = useState({});

  const apply = s => setF({
    chip_brand_id: s.chip_brand_id, chip_api_key: '', claude_api_key: '',
    meta_pixel_id: s.meta_pixel_id, whatsapp: s.whatsapp, sender_name: s.sender_name, sender_phone: s.sender_phone,
  });

  useEffect(() => {
    fetch('/api/fighter/settings').then(r => r.json()).then(j => {
      if (!j.success) return setError(j.error);
      setData(j); apply(j.settings);
    }).catch(() => setError('Gagal muatkan tetapan.'));
  }, []);

  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const call = async (section, method, body) => {
    setBusy(section); setMsg(null);
    try {
      const j = await (await fetch('/api/fighter/settings', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).json();
      if (!j.success) throw new Error(j.error);
      setData(d => ({ ...d, settings: j.settings })); apply(j.settings);
      setMsg({ section, ok: true, text: 'Disimpan.' });
    } catch (e) {
      setMsg({ section, ok: false, text: e.message });
    } finally { setBusy(''); }
  };

  const Msg = ({ section }) => (msg?.section === section
    ? <div style={{ fontSize: '0.8rem', marginTop: '0.6rem', color: msg.ok ? t.ok : t.bad }}>{msg.ok ? '✅' : '⚠️'} {msg.text}</div>
    : null);

  if (error) return <div style={{ padding: '1.5rem', color: t.bad, fontFamily: t.ff }}>{error}</div>;
  if (!data) return <div style={{ padding: '1.5rem', color: t.muted, fontFamily: t.ff }}>Memuatkan...</div>;
  const s = data.settings;
  const inp = inputStyle(t);

  return (
    <div style={{ fontFamily: t.ff, color: t.text, maxWidth: 760 }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>FIGHTER · TETAPAN</div>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0.15rem 0 0' }}>⚙️ Tetapan Akaun</h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: t.text2 }}>
          Semua bayaran FPX masuk terus ke akaun CHIP anda. Key disimpan bersulit — tidak dipaparkan semula selepas disimpan.
        </p>
      </div>

      {/* CHIP */}
      <Card t={t} title="💳 CHIP (FPX)" sub="Dapatkan Brand ID & API Key (Secret Key) di portal CHIP → Developers. Kami akan uji sambungan sebelum simpan.">
        <Field t={t} label="Brand ID">
          <input style={inp} value={f.chip_brand_id || ''} onChange={set('chip_brand_id')} placeholder="cth: 1a2b3c4d-...." autoComplete="off" />
        </Field>
        <Field t={t} label="API Key (Secret Key)" hint={s.chip_key_last4 ? `Tersimpan: ••••${s.chip_key_last4}. Biar kosong untuk kekal key sedia ada.` : null}>
          <input style={inp} type="password" value={f.chip_api_key || ''} onChange={set('chip_api_key')} placeholder={s.chip_key_last4 ? '•••••••• (tukar key)' : 'Tampal API Key CHIP'} autoComplete="new-password" />
        </Field>
        <StatusLine t={t} status={s.chip_status} message={s.chip_message} at={s.chip_checked_at} />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
          <button style={btnStyle()} disabled={!!busy} onClick={() => call('chip', 'PUT', { chip_brand_id: f.chip_brand_id, chip_api_key: f.chip_api_key })}>
            {busy === 'chip' ? 'Menguji...' : 'Simpan & Uji'}
          </button>
          {s.chip_key_last4 && (
            <button style={btnStyle(t.accent, false)} disabled={!!busy} onClick={() => call('chip', 'POST', { action: 'test_chip' })}>Uji semula</button>
          )}
        </div>
        <Msg section="chip" />
      </Card>

      {/* Claude */}
      <Card t={t} title="✨ Claude API (SP Generator)" sub="SP Generator guna API key anda sendiri — kos AI ditanggung akaun Anthropic anda. Dapatkan key di console.anthropic.com → API Keys.">
        <Field t={t} label="Claude API Key" hint={s.ai_key_last4 ? `Tersimpan: ••••${s.ai_key_last4}. Biar kosong untuk kekal key sedia ada.` : null}>
          <input style={inp} type="password" value={f.claude_api_key || ''} onChange={set('claude_api_key')} placeholder={s.ai_key_last4 ? '•••••••• (tukar key)' : 'sk-ant-...'} autoComplete="new-password" />
        </Field>
        <StatusLine t={t} status={s.ai_status} message={s.ai_message} at={s.ai_checked_at} />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
          <button style={btnStyle()} disabled={!!busy || !f.claude_api_key} onClick={() => call('ai', 'PUT', { claude_api_key: f.claude_api_key })}>
            {busy === 'ai' ? 'Menguji...' : 'Simpan & Uji'}
          </button>
          {s.ai_key_last4 && (
            <>
              <button style={btnStyle(t.accent, false)} disabled={!!busy} onClick={() => call('ai', 'POST', { action: 'test_ai' })}>Uji semula</button>
              <button style={btnStyle(t.bad, false)} disabled={!!busy} onClick={() => confirm('Buang Claude API Key?') && call('ai', 'POST', { action: 'remove_ai' })}>Buang key</button>
            </>
          )}
        </div>
        <Msg section="ai" />
      </Card>

      {/* Lain-lain */}
      <Card t={t} title="📱 Sales Page & Penghantaran">
        <Field t={t} label="No. WhatsApp" hint="Untuk butang WhatsApp & TQ page sales page anda. Format 60123456789.">
          <input style={inp} value={f.whatsapp || ''} onChange={set('whatsapp')} placeholder="60123456789" />
        </Field>
        <Field t={t} label="Meta Pixel ID" hint="Pixel anda sendiri — event Lead / Purchase dihantar ke pixel ini.">
          <input style={inp} value={f.meta_pixel_id || ''} onChange={set('meta_pixel_id')} placeholder="cth: 123456789012345" />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0 0.85rem' }}>
          <Field t={t} label="Nama pengirim (NinjaVan)" hint="Dipaparkan pada waybill & CSV NinjaVan anda.">
            <input style={inp} value={f.sender_name || ''} onChange={set('sender_name')} placeholder="cth: Kedai Ali" />
          </Field>
          <Field t={t} label="No. telefon pengirim">
            <input style={inp} value={f.sender_phone || ''} onChange={set('sender_phone')} placeholder="0123456789" />
          </Field>
        </div>
        <button style={btnStyle()} disabled={!!busy} onClick={() => call('misc', 'PUT', {
          whatsapp: f.whatsapp, meta_pixel_id: f.meta_pixel_id, sender_name: f.sender_name, sender_phone: f.sender_phone,
        })}>{busy === 'misc' ? 'Menyimpan...' : 'Simpan'}</button>
        <Msg section="misc" />
      </Card>
    </div>
  );
}

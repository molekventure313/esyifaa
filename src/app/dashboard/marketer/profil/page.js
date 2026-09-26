'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';

export default function MarketerProfilPage() {
  const [profile, setProfile] = useState(null);
  const [whatsapp, setWhatsapp] = useState('');
  const [saved, setSaved] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const cardBg = '#131C2E';
  const inputBg = '#1A2332';
  const border = '1px solid rgba(255,255,255,0.08)';
  const textPrimary = '#F1F5F9';
  const textMuted = '#94A3B8';
  const accent = '#22C55E';

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/marketer/profile');
        const json = await res.json();
        if (json.success) {
          setProfile(json.data);
          setWhatsapp(json.data.marketer_whatsapp || '');
          setSaved(json.data.marketer_whatsapp || '');
        }
      } catch (_) {
        showToast('Gagal memuatkan profil', 'error');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/marketer/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketer_whatsapp: whatsapp.trim() }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Gagal menyimpan');
      const value = json.data.marketer_whatsapp || '';
      setWhatsapp(value);
      setSaved(value);
      showToast(value ? 'No. WhatsApp disimpan!' : 'No. WhatsApp dibuang', 'success');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: textMuted }}>Memuatkan...</div>;
  }

  const readOnly = [
    ['Nama', profile?.full_name],
    ['Kod Marketer', profile?.marketer_code],
    ['Email', profile?.email],
  ];
  const changed = whatsapp.trim() !== saved;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: textPrimary, marginBottom: '0.5rem' }}>
        👤 Profil & WhatsApp
      </h1>
      <p style={{ fontSize: '0.85rem', color: textMuted, marginBottom: '1.5rem' }}>
        No. WhatsApp ini dipapar di <strong>semua salespage</strong> anda — section &quot;Nak order melalui WhatsApp?&quot; & butang WhatsApp terapung.
      </p>

      {/* Amaran — belum isi no. WhatsApp */}
      {!saved && (
        <div style={{
          marginBottom: '1.25rem', padding: '1rem', borderRadius: '10px',
          background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.4)',
        }}>
          <p style={{ fontSize: '0.85rem', color: '#F59E0B', fontWeight: 700, margin: '0 0 0.4rem' }}>
            ⚠️ No. WhatsApp belum diisi
          </p>
          <p style={{ fontSize: '0.78rem', color: textPrimary, lineHeight: 1.55, margin: 0 }}>
            Section &quot;Nak order melalui WhatsApp?&quot; dan butang WhatsApp <strong>TIDAK dipapar</strong> di salespage anda sehingga anda isi no. WhatsApp.
          </p>
        </div>
      )}

      <div style={{ background: cardBg, border, borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        {/* Maklumat akaun (baca sahaja) */}
        <div style={{ display: 'grid', gap: '0.55rem' }}>
          {readOnly.map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '0.85rem' }}>
              <span style={{ color: textMuted }}>{label}</span>
              <span style={{ color: textPrimary, fontWeight: 600, textAlign: 'right', wordBreak: 'break-all' }}>{val || '—'}</span>
            </div>
          ))}
        </div>

        <hr style={{ border: 'none', borderTop: border, margin: 0 }} />

        {/* No. WhatsApp */}
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: textPrimary, marginBottom: '0.4rem', display: 'block' }}>
            No. WhatsApp untuk Salespage
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="tel"
              inputMode="tel"
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
              placeholder="Cth: 0123456789"
              style={{
                flex: 1, minWidth: 0, padding: '0.7rem 0.9rem', borderRadius: '8px',
                background: inputBg, border, color: textPrimary, fontSize: '0.9rem',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
            {saved && !changed && (
              <a
                href={`https://wa.me/${saved}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Buka WhatsApp untuk uji nombor"
                style={{
                  padding: '0.7rem 0.9rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700,
                  background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.35)',
                  color: '#25D366', textDecoration: 'none', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center',
                }}
              >
                Uji ↗
              </a>
            )}
          </div>
          <p style={{ fontSize: '0.7rem', color: textMuted, marginTop: '0.3rem' }}>
            Disimpan dalam format 60XXXXXXXXX. Kosongkan &amp; simpan untuk sembunyikan section WhatsApp di salespage anda.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !changed}
          style={{
            padding: '0.7rem 1.5rem', borderRadius: '8px', border: 'none',
            background: !changed ? '#374151' : accent,
            color: !changed ? textMuted : '#fff',
            fontWeight: 700, fontSize: '0.9rem', cursor: saving || !changed ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Menyimpan...' : '💾 Simpan'}
        </button>
      </div>
    </div>
  );
}

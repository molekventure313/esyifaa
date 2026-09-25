'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';

export default function MarketerPixelsPage() {
  const [pixelId, setPixelId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Nilai yang dah disimpan dalam DB — amaran ikut ini, bukan apa yang sedang ditaip
  const [saved, setSaved] = useState({ pixelId: '', token: '' });
  const { showToast } = useToast();

  const bg = '#0B1120';
  const cardBg = '#131C2E';
  const inputBg = '#1A2332';
  const border = '1px solid rgba(255,255,255,0.08)';
  const textPrimary = '#F1F5F9';
  const textMuted = '#94A3B8';
  const accent = '#22C55E';

  useEffect(() => {
    fetchPixelConfig();
  }, []);

  const fetchPixelConfig = async () => {
    try {
      const res = await fetch('/api/marketer/pixels');
      if (res.ok) {
        const json = await res.json();
        setPixelId(json.data?.meta_pixel_id || '');
        setAccessToken(json.data?.meta_access_token || '');
        setSaved({ pixelId: json.data?.meta_pixel_id || '', token: json.data?.meta_access_token || '' });
      }
    } catch (e) {
      showToast('Gagal memuatkan data pixel', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/marketer/pixels', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meta_pixel_id: pixelId.trim(), meta_access_token: accessToken.trim() })
      });
      if (!res.ok) throw new Error('Gagal menyimpan');
      setSaved({ pixelId: pixelId.trim(), token: accessToken.trim() });
      showToast('Pixel berjaya dikemas kini!', 'success');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: textMuted }}>
        Memuatkan...
      </div>
    );
  }

  const missingToken = !!saved.pixelId && !saved.token;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: textPrimary, marginBottom: '0.5rem' }}>
        🎯 Pixel Meta Saya
      </h1>
      <p style={{ fontSize: '0.85rem', color: textMuted, marginBottom: '1.5rem' }}>
        Masukkan Meta Pixel ID anda. Pixel ini akan digunakan untuk <strong>semua salespage</strong> yang anda promosikan.
      </p>

      {/* Amaran — pixel ada tapi CAPI token belum diisi */}
      {missingToken && (
        <div style={{
          marginBottom: '1.25rem', padding: '1rem', borderRadius: '10px',
          background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.4)',
        }}>
          <p style={{ fontSize: '0.85rem', color: '#F59E0B', fontWeight: 700, marginBottom: '0.4rem' }}>
            ⚠️ Access Token belum diisi
          </p>
          <p style={{ fontSize: '0.78rem', color: textPrimary, lineHeight: 1.55, margin: 0 }}>
            Tanpa Access Token, event <strong>Purchase dan Lead dari server (CAPI) TIDAK akan dihantar</strong> ke pixel anda.
            Kebanyakan order COD hanya direkod melalui CAPI — jadi Ads Manager anda akan tunjuk purchase jauh lebih rendah dari order sebenar
            dan algoritma Meta sukar optimize.
          </p>
          <p style={{ fontSize: '0.72rem', color: textMuted, lineHeight: 1.5, margin: '0.5rem 0 0' }}>
            Cara dapatkan: Meta Events Manager → pilih pixel anda → <strong>Settings</strong> → Conversions API → <strong>Generate access token</strong>.
          </p>
        </div>
      )}

      <div style={{
        background: cardBg, border, borderRadius: '12px', padding: '1.5rem',
        display: 'flex', flexDirection: 'column', gap: '1.2rem'
      }}>
        {/* Pixel ID */}
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: textPrimary, marginBottom: '0.4rem', display: 'block' }}>
            Meta Pixel ID <span style={{ color: '#E11D48' }}>*</span>
          </label>
          <input
            type="text"
            value={pixelId}
            onChange={e => setPixelId(e.target.value)}
            placeholder="Cth: 123456789012345"
            style={{
              width: '100%', padding: '0.7rem 0.9rem', borderRadius: '8px',
              background: inputBg, border, color: textPrimary, fontSize: '0.9rem',
              outline: 'none', boxSizing: 'border-box'
            }}
          />
          <p style={{ fontSize: '0.7rem', color: textMuted, marginTop: '0.3rem' }}>
            Dapatkan dari Meta Events Manager → Data Sources → Pixel ID
          </p>
        </div>

        {/* Access Token */}
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: textPrimary, marginBottom: '0.4rem', display: 'block' }}>
            Conversions API Access Token <span style={{ fontSize: '0.7rem', color: '#F59E0B' }}>(Sangat digalakkan)</span>
          </label>
          <input
            type="text"
            value={accessToken}
            onChange={e => setAccessToken(e.target.value)}
            placeholder="EAAxxxxxxx..."
            style={{
              width: '100%', padding: '0.7rem 0.9rem', borderRadius: '8px',
              background: inputBg, border, color: textPrimary, fontSize: '0.9rem',
              outline: 'none', boxSizing: 'border-box'
            }}
          />
          <p style={{ fontSize: '0.7rem', color: textMuted, marginTop: '0.3rem' }}>
            Untuk server-side event tracking (CAPI) — Purchase & Lead dihantar dari server. Tanpa token, event ini tidak sampai ke pixel anda.
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving || !pixelId.trim()}
          style={{
            padding: '0.7rem 1.5rem', borderRadius: '8px', border: 'none',
            background: !pixelId.trim() ? '#374151' : accent,
            color: !pixelId.trim() ? textMuted : '#fff',
            fontWeight: 700, fontSize: '0.9rem', cursor: saving || !pixelId.trim() ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1, marginTop: '0.5rem'
          }}
        >
          {saving ? 'Menyimpan...' : '💾 Simpan Pixel'}
        </button>
      </div>

      {/* Info Box */}
      <div style={{
        marginTop: '1.5rem', padding: '1rem', borderRadius: '10px',
        background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)'
      }}>
        <p style={{ fontSize: '0.8rem', color: accent, fontWeight: 600, marginBottom: '0.4rem' }}>
          ℹ️ Bagaimana ia berfungsi?
        </p>
        <p style={{ fontSize: '0.75rem', color: textMuted, lineHeight: 1.5 }}>
          Apabila pelanggan melawat salespage melalui link anda (cth: e-syifa.com/m/sihir?m=kod_anda),
          <strong> hanya pixel anda</strong> yang fire (pixel HQ tidak fire). Event PageView, Lead dan Purchase
          akan direkodkan ke akaun Meta Ads anda — Purchase/Lead server-side (CAPI) memerlukan Access Token.
        </p>
      </div>
    </div>
  );
}

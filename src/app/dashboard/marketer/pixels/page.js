'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';

const SALES_PAGES = [
  { slug: 'sihir', name: 'Pakej Rawatan Sihir' },
  { slug: 'saka', name: 'Pakej Rawatan Saka' },
  { slug: 'penyakit-misteri', name: 'Pakej Penyakit Misteri' },
  { slug: 'gangguan-berulang', name: 'Pakej Gangguan Berulang' },
  { slug: 'belum-zuriat', name: 'Pakej Belum Zuriat' },
  { slug: 'kedai-tutup', name: 'Pakej Kedai Kena Tutup' },
  { slug: 'tasbih-esyifa', name: 'Tasbih eSyifa' },
  { slug: 'sabun-garam-1', name: 'Sabun Garam (1 Botol)' },
  { slug: 'sabun-garam-2', name: 'Sabun Garam (2 Botol)' },
  { slug: 'sabun-garam-3', name: 'Sabun Garam (3 Botol)' },
  { slug: 'sabun-garam-4', name: 'Sabun Garam (4 Botol)' },
  { slug: 'sabun-garam-5', name: 'Sabun Garam (5 Botol)' },
  { slug: 'pengisian-esyifa', name: 'Pengisian eSyifa' },
  { slug: 'e-video', name: 'E-Video Amalan' }
];

export default function MarketerPixelsPage() {
  const [pixels, setPixels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSlugs, setSavingSlugs] = useState({});
  const { showToast } = useToast();

  useEffect(() => {
    fetchPixels();
  }, []);

  const fetchPixels = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/marketer/pixels');
      if (res.ok) {
        const json = await res.json();
        setPixels(json.data || []);
      } else {
        throw new Error('Gagal memuatkan data pixel');
      }
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getPixelData = (slug) => {
    const existing = pixels.find(p => p.salespage_slug === slug);
    return existing || {
      salespage_slug: slug,
      meta_pixel_id: '',
      meta_access_token: '',
      meta_test_event_code: '',
      is_active: true
    };
  };

  const handleSave = async (slug, data) => {
    setSavingSlugs(prev => ({ ...prev, [slug]: true }));
    try {
      const existing = pixels.find(p => p.salespage_slug === slug);
      let res, json;

      if (existing) {
        // Update
        res = await fetch('/api/marketer/pixels', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: existing.id,
            meta_pixel_id: data.meta_pixel_id,
            meta_access_token: data.meta_access_token,
            meta_test_event_code: data.meta_test_event_code,
            is_active: data.is_active
          })
        });
      } else {
        // Create
        res = await fetch('/api/marketer/pixels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            salespage_slug: slug,
            pixel_type: 'lead',
            meta_pixel_id: data.meta_pixel_id,
            meta_access_token: data.meta_access_token,
            meta_test_event_code: data.meta_test_event_code
          })
        });
      }

      json = await res.json();
      
      if (res.ok && json.success) {
        showToast('Tetapan pixel berjaya disimpan!', 'success');
        // Refresh data
        await fetchPixels();
      } else {
        throw new Error(json.error || 'Gagal menyimpan tetapan');
      }
    } catch (err) {
      showToast(err.message || 'Ralat semasa menyimpan tetapan', 'error');
    } finally {
      setSavingSlugs(prev => ({ ...prev, [slug]: false }));
    }
  };

  const handleDelete = async (slug) => {
    if (!confirm('Adakah anda pasti mahu memadam pixel untuk salespage ini?')) return;
    
    setSavingSlugs(prev => ({ ...prev, [slug]: true }));
    try {
      const existing = pixels.find(p => p.salespage_slug === slug);
      if (!existing) return;

      const res = await fetch(`/api/marketer/pixels?id=${existing.id}`, {
        method: 'DELETE'
      });
      
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Pixel berjaya dipadam!', 'success');
        await fetchPixels();
      } else {
        throw new Error(json.error || 'Gagal memadam tetapan');
      }
    } catch (err) {
      showToast(err.message || 'Ralat semasa memadam tetapan', 'error');
    } finally {
      setSavingSlugs(prev => ({ ...prev, [slug]: false }));
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="spinner" style={{ width: '32px', height: '32px', border: '3px solid rgba(16,185,129,0.2)', borderTopColor: '#10B981', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <span style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Memuatkan tetapan pixel...</span>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'var(--font-inter), -apple-system, sans-serif', color: '#F9FAFB', padding: '0.25rem 0', maxWidth: '880px', margin: '0 auto' }}>
      
      {/* Header */}
      <div 
        style={{ 
          padding: '1.25rem 1.5rem', 
          borderRadius: '8px', 
          marginBottom: '1.75rem',
          background: '#10131A',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '0.725rem', fontWeight: 600, color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              MARKETER
            </span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#F9FAFB', letterSpacing: '-0.02em' }}>
            Tetapan Pixel Sendiri
          </h1>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#9CA3AF' }}>
            Uruskan tetapan Meta Pixel dan CAPI untuk setiap salespage di bawah kod anda.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {SALES_PAGES.map(page => (
          <PixelCard 
            key={page.slug} 
            page={page} 
            pixelData={getPixelData(page.slug)} 
            onSave={(data) => handleSave(page.slug, data)}
            onDelete={() => handleDelete(page.slug)}
            isSaving={savingSlugs[page.slug]}
            hasExisting={!!pixels.find(p => p.salespage_slug === page.slug)}
          />
        ))}
      </div>
    </div>
  );
}

function PixelCard({ page, pixelData, onSave, onDelete, isSaving, hasExisting }) {
  const [formData, setFormData] = useState({
    meta_pixel_id: pixelData.meta_pixel_id || '',
    meta_access_token: pixelData.meta_access_token || '',
    meta_test_event_code: pixelData.meta_test_event_code || '',
    is_active: pixelData.is_active !== undefined ? pixelData.is_active : true
  });

  // Sync state if pixelData changes (e.g. after fetch)
  useEffect(() => {
    setFormData({
      meta_pixel_id: pixelData.meta_pixel_id || '',
      meta_access_token: pixelData.meta_access_token || '',
      meta_test_event_code: pixelData.meta_test_event_code || '',
      is_active: pixelData.is_active !== undefined ? pixelData.is_active : true
    });
  }, [pixelData]);

  return (
    <div 
      style={{ 
        background: '#10131A', 
        borderRadius: '8px', 
        border: '1px solid rgba(255, 255, 255, 0.08)', 
        padding: '1.5rem' 
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F9FAFB', margin: '0 0 0.2rem 0' }}>
            {page.name}
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#9CA3AF', margin: 0 }}>
            Slug: <code style={{ background: 'rgba(255,255,255,0.08)', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>{page.slug}</code>
          </p>
        </div>

        {hasExisting && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: formData.is_active ? '#34D399' : '#9CA3AF' }}>
              {formData.is_active ? 'Aktif' : 'Nyahaktif'}
            </span>
            <input 
              type="checkbox" 
              checked={formData.is_active}
              disabled={isSaving}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              style={{ display: 'none' }}
            />
            <div 
              style={{ 
                width: '42px', 
                height: '24px', 
                background: formData.is_active ? '#064E3B' : '#090A0F', 
                borderRadius: '999px', 
                padding: '2px',
                border: formData.is_active ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255,255,255,0.15)',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div 
                style={{ 
                  width: '18px', 
                  height: '18px', 
                  background: formData.is_active ? '#34D399' : '#9CA3AF', 
                  borderRadius: '50%',
                  transform: formData.is_active ? 'translateX(18px)' : 'translateX(0)',
                  transition: 'transform 0.2s ease'
                }} 
              />
            </div>
          </label>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#D1D5DB', marginBottom: '0.4rem' }}>
            Meta Pixel ID
          </label>
          <input 
            type="text" 
            value={formData.meta_pixel_id}
            onChange={(e) => setFormData({ ...formData, meta_pixel_id: e.target.value })}
            placeholder="Contoh: 123456789012345"
            style={{
              width: '100%',
              padding: '0.75rem 0.85rem',
              background: '#090A0F',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '6px',
              color: '#F9FAFB',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              outline: 'none'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#D1D5DB', marginBottom: '0.4rem' }}>
            Conversions API Access Token
          </label>
          <input 
            type="password"
            value={formData.meta_access_token}
            onChange={(e) => setFormData({ ...formData, meta_access_token: e.target.value })}
            placeholder="EAAB..."
            style={{
              width: '100%',
              padding: '0.75rem 0.85rem',
              background: '#090A0F',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '6px',
              color: '#F9FAFB',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              outline: 'none'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#D1D5DB', marginBottom: '0.4rem' }}>
            Test Event Code (Pilihan)
          </label>
          <input 
            type="text" 
            value={formData.meta_test_event_code}
            onChange={(e) => setFormData({ ...formData, meta_test_event_code: e.target.value })}
            placeholder="Contoh: TEST12345"
            style={{
              width: '100%',
              padding: '0.75rem 0.85rem',
              background: '#090A0F',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '6px',
              color: '#F9FAFB',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
          {hasExisting && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isSaving}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '6px',
                background: 'transparent',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#EF4444',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer'
              }}
            >
              Padam
            </button>
          )}
          
          <button
            type="button"
            onClick={() => onSave(formData)}
            disabled={isSaving || !formData.meta_pixel_id}
            style={{
              padding: '0.65rem 1.5rem',
              borderRadius: '6px',
              background: formData.meta_pixel_id ? '#064E3B' : 'rgba(255,255,255,0.05)',
              border: formData.meta_pixel_id ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.1)',
              color: formData.meta_pixel_id ? '#34D399' : '#6B7280',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: isSaving || !formData.meta_pixel_id ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1
            }}
          >
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

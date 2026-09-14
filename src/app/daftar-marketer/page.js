'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';

export default function DaftarMarketerPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [marketerCode, setMarketerCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const { showToast } = useToast();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (password !== confirmPassword) {
      setError('Kata laluan dan pengesahan kata laluan tidak sepadan.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Kata laluan mestilah sekurang-kurangnya 6 aksara.');
      setLoading(false);
      return;
    }

    const marketerCodeRegex = /^[a-z0-9-]{2,20}$/;
    if (!marketerCodeRegex.test(marketerCode)) {
      setError('Kod Marketer hanya boleh mengandungi huruf kecil, nombor, dan sengkang (-). Panjang antara 2-20 aksara.');
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch('/api/register-marketer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, phone, marketerCode })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Pendaftaran akaun marketer gagal');
      }

      showToast('Pendaftaran berjaya! Sila tunggu kelulusan admin sebelum login.', 'success');
      setSuccess(true);
      
    } catch (err) {
      setError(err.message || 'Ralat berlaku semasa pendaftaran.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main 
      style={{ 
        minHeight: '100vh',
        background: '#08090C',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        fontFamily: 'var(--font-inter), -apple-system, sans-serif',
        color: '#F9FAFB'
      }}
    >
      <div 
        style={{ 
          maxWidth: '440px',
          width: '100%',
          background: '#10131A',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '2.25rem 2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          textAlign: 'left'
        }}
      >
        {/* Brand Header */}
        <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>🌿</span>
            <span 
              style={{ 
                fontSize: '1.25rem', 
                fontWeight: 700, 
                color: '#F9FAFB', 
                letterSpacing: '-0.02em'
              }}
            >
              E-SYIFAA'
            </span>
          </div>
          <p style={{ fontSize: '0.675rem', fontWeight: 600, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
            PENDAFTARAN AKAUN MARKETER
          </p>
        </div>

        <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', marginBottom: '1.5rem' }} />

        {success ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', fontSize: '1.5rem', fontWeight: 700, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              ⏳
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F9FAFB', marginBottom: '0.6rem' }}>
              Pendaftaran Berjaya!
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#D1D5DB', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
              Pendaftaran berjaya! Sila tunggu kelulusan admin sebelum login.
            </p>
            <Link
              href="/login"
              style={{
                display: 'inline-block',
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                background: '#1E3A8A',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#93C5FD',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Kembali ke Halaman Log Masuk →
            </Link>
          </div>
        ) : (
          <>
            {/* Title */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F9FAFB', margin: '0 0 0.25rem 0', letterSpacing: '-0.01em' }}>
                Daftar Sebagai Marketer ESyifaa
              </h1>
              <p style={{ fontSize: '0.825rem', color: '#9CA3AF', margin: 0 }}>
                Isi maklumat anda untuk mendaftar. Akaun memerlukan kelulusan Admin sebelum log masuk.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div 
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '6px',
                  padding: '0.75rem 0.85rem',
                  color: '#EF4444',
                  fontSize: '0.8rem',
                  marginBottom: '1.25rem',
                  fontWeight: 500
                }}
              >
                {error}
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500, fontSize: '0.8rem', color: '#D1D5DB' }}>
                  Nama Penuh
                </label>
                <input
                  type="text"
                  placeholder="Nama Penuh..."
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem',
                    background: '#090A0F',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    color: '#F9FAFB',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500, fontSize: '0.8rem', color: '#D1D5DB' }}>
                  Alamat E-mel
                </label>
                <input
                  type="email"
                  placeholder="marketer@esyifaa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem',
                    background: '#090A0F',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    color: '#F9FAFB',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500, fontSize: '0.8rem', color: '#D1D5DB' }}>
                  Nombor Telefon / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="01XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem',
                    background: '#090A0F',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    color: '#F9FAFB',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500, fontSize: '0.8rem', color: '#D1D5DB' }}>
                  Kod Marketer
                </label>
                <input
                  type="text"
                  placeholder="contoh: ali"
                  value={marketerCode}
                  onChange={(e) => setMarketerCode(e.target.value.toLowerCase())}
                  required
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem',
                    background: '#090A0F',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    color: '#F9FAFB',
                    fontSize: '0.875rem',
                    outline: 'none',
                    marginBottom: '0.35rem'
                  }}
                />
                <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0 }}>
                  Kod unik anda. Contoh: ali, ahmad. Akan digunakan dalam link marketing.
                </p>
              </div>

              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500, fontSize: '0.8rem', color: '#D1D5DB' }}>
                  Kata Laluan
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem',
                    background: '#090A0F',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    color: '#F9FAFB',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500, fontSize: '0.8rem', color: '#D1D5DB' }}>
                  Pengesahan Kata Laluan
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem',
                    background: '#090A0F',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    color: '#F9FAFB',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#1E3A8A',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '6px',
                  color: '#93C5FD',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.15s ease'
                }}
              >
                {loading ? 'Hantar Pendaftaran...' : 'Daftar Akaun Marketer'}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.8rem', color: '#6B7280', textAlign: 'center' }}>
              Dah ada akaun?{' '}
              <Link href="/login" style={{ color: '#3B82F6', fontWeight: 600, textDecoration: 'none' }}>
                Log masuk di sini
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

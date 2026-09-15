'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const router = useRouter();
  const { showToast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) throw signInError;
      
      if (data.session && data.user) {
        // Verify practitioner active approval status & role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, is_active')
          .eq('id', data.user.id)
          .single();

        if (profile && ['practitioner', 'perawat'].includes(profile.role) && !profile.is_active) {
          await supabase.auth.signOut();
          setError('Akaun perawat anda sedang MENUNGGU KELULUSAN / DITOLAK oleh Admin E-SYIFAA\'. Sila hubungi pihak pentadbir.');
          setLoading(false);
          return;
        }

        if (profile && profile.role === 'marketer' && !profile.is_active) {
          await supabase.auth.signOut();
          setError('Akaun marketer anda sedang MENUNGGU KELULUSAN oleh Admin. Sila hubungi pihak pentadbir.');
          setLoading(false);
          return;
        }

        const role = profile?.role || 'practitioner';
        const isAdmin = role === 'admin' || role === 'super_admin';
        const isMarketer = role === 'marketer';

        showToast(`Berjaya log masuk sebagai ${isAdmin ? 'Admin' : isMarketer ? 'Marketer' : 'Perawat'}!`, 'success');
        
        if (isAdmin) {
          router.push('/dashboard/admin');
        } else if (isMarketer) {
          router.push('/dashboard/marketer');
        } else {
          router.push('/dashboard/perawat');
        }
      }
    } catch (err) {
      setError(err.message || 'Log masuk gagal. Sila semak e-mel dan kata laluan anda.');
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
          maxWidth: '400px',
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
            <img
              src="/images/logo-esyifa.png"
              alt="E-Syifa Logo"
              style={{ width: '44px', height: '44px', objectFit: 'contain' }}
            />
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
          <p style={{ fontSize: '0.675rem', fontWeight: 600, color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
            RAWATAN JARAK JAUH ISLAM
          </p>
        </div>

        <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', marginBottom: '1.5rem' }} />

        {/* Title */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F9FAFB', margin: '0 0 0.25rem 0', letterSpacing: '-0.01em' }}>
            Log Masuk Sistem
          </h1>
          <p style={{ fontSize: '0.825rem', color: '#9CA3AF', margin: 0 }}>
            Sila masukkan e-mel dan kata laluan anda.
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
              fontWeight: 500,
              lineHeight: 1.4
            }}
          >
            {error}
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1.15rem' }}>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 500, fontSize: '0.8rem', color: '#D1D5DB' }}>
              Alamat E-mel
            </label>
            <input
              type="email"
              placeholder="nama@contoh.com"
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
                outline: 'none',
                transition: 'border-color 0.15s ease'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
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
                outline: 'none',
                transition: 'border-color 0.15s ease'
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#064E3B',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '6px',
              color: '#34D399',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.15s ease'
            }}
          >
            {loading ? 'Menyemak kelulusan...' : 'Log Masuk'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '0.8rem', color: '#6B7280', display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'center' }}>
          <div>
            Perawat Baharu?{' '}
            <Link href="/daftar-perawat" style={{ color: '#34D399', fontWeight: 600, textDecoration: 'none' }}>
              Daftar Akaun Perawat
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}


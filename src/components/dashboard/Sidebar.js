'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  
  const role = profile?.role || user?.role || 'practitioner';
  const isSuperAdmin = role === 'super_admin';
  const isAdmin = role === 'admin' || isSuperAdmin;
  
  const isAdminPath = pathname.startsWith('/dashboard/admin');
  const isPerawatPath = pathname.startsWith('/dashboard/perawat');

  // Theme observer state
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      const isLight = document.body.classList.contains('light-mode') || document.documentElement.getAttribute('data-theme') === 'light';
      setIsLightMode(isLight);
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  // Practitioner Availability Toggle State (Default to Active)
  const [isReceivingCases, setIsReceivingCases] = useState(true);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  useEffect(() => {
    if (profile) {
      // Load persisted status from DB.
      // If is_receiving_cases is null/undefined, default to true (active)
      const savedStatus = profile.is_receiving_cases;
      setIsReceivingCases(savedStatus !== false);
    }
  }, [profile]);

  const handleToggleAvailability = async (newStatus) => {
    if (isReceivingCases === newStatus || updatingAvailability) return;
    // Optimistic update
    setIsReceivingCases(newStatus);
    setUpdatingAvailability(true);
    try {
      // Use dedicated perawat status endpoint — uses session user's own ID
      const res = await fetch('/api/perawat/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_receiving_cases: newStatus })
      });

      const json = await res.json();

      if (res.ok && json.success) {
        showToast(
          newStatus
            ? 'Status: Aktif — Sedia menerima kes baru.'
            : 'Status: Tidak Aktif — Tidak akan menerima kes baru.',
          newStatus ? 'success' : 'info'
        );
      } else {
        throw new Error(json.error || 'Gagal');
      }
    } catch (e) {
      // Revert on failure
      showToast('Gagal mengemaskini status. Cuba lagi.', 'error');
      setIsReceivingCases(!newStatus);
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const practitionerNav = [
    { section: 'UTAMA' },
    { label: 'Dashboard', href: '/dashboard/perawat' },
    { label: 'Kes Saya', href: '/dashboard/perawat/kes-saya' },
    { label: 'Follow-up', href: '/dashboard/perawat/follow-up' }
  ];
  
  const adminNav = [
    { section: 'UTAMA' },
    { label: 'Dashboard', href: '/dashboard/admin' },
    { label: 'Semua Kes', href: '/dashboard/admin/kes' },
    { section: 'PEMBAYARAN FPX' },
    { label: '💳 Pesakit Berbayar', href: '/dashboard/admin/pesakit-berbayar' },
    { section: 'PENGURUSAN' },
    { label: 'Perawat', href: '/dashboard/admin/perawat' },
    { label: 'Pelanggan', href: '/dashboard/admin/pelanggan' },
    { section: 'TETAPAN' },
    { label: 'Kos Ads & Komisen', href: '/dashboard/admin/ads' },
    { label: 'Salespage', href: '/dashboard/admin/salespage' },
    { label: 'Conversion Rate', href: '/dashboard/admin/salespage/conversion-rate' },
    { label: 'Tracking & Pixel', href: '/dashboard/admin/tracking' },
    { label: '💬 WA Perawat', href: '/dashboard/admin/wasap' },
    { label: 'Log Aktiviti', href: '/dashboard/admin/log' }
  ];
  
  let navItems = adminNav;
  if (isPerawatPath) {
    navItems = practitionerNav;
  } else if (isAdminPath) {
    navItems = adminNav;
  } else {
    navItems = isAdmin ? adminNav : practitionerNav;
  }

  const initials = profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'U';

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`dashboard-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      
      {/* Enterprise Sidebar */}
      <aside 
        className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}
        style={{
          background: isLightMode ? '#FFFFFF' : '#090A0F',
          borderRight: isLightMode ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
          fontFamily: 'var(--font-inter), sans-serif',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh'
        }}
      >
        {/* Brand Header */}
        <div style={{ padding: '1.25rem 1.25rem 1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <img
              src="/images/logo-esyifa.png"
              alt="E-Syifa"
              style={{
                width: '36px', height: '36px',
                objectFit: 'contain',
                borderRadius: '6px',
                background: isLightMode ? 'transparent' : 'rgba(255,255,255,0.05)',
                flexShrink: 0,
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 700, fontSize: '1.05rem', color: isLightMode ? '#0F172A' : '#F9FAFB', letterSpacing: '-0.02em' }}>
                E-SYIFAA'
              </span>
              <small style={{ fontSize: '0.65rem', fontWeight: 600, color: isLightMode ? '#059669' : '#34D399', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {isAdminPath ? 'ADMIN CONTROL CENTER' : 'PORTAL PERAWAT'}
              </small>
            </div>
          </div>
        </div>
        
        <div style={{ height: '1px', background: isLightMode ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)', margin: '0.5rem 1rem' }} />
        
        {/* Navigation Items */}
        <nav style={{ padding: '0.5rem 0.5rem', flex: 1, overflowY: 'auto' }}>
          {navItems.map((item, index) => {
            if (item.section) {
              return (
                <div 
                  key={index} 
                  style={{ 
                    fontSize: '0.65rem', 
                    fontWeight: 600, 
                    color: isLightMode ? '#64748B' : '#6B7280', 
                    letterSpacing: '0.1em', 
                    padding: '1rem 0.75rem 0.35rem 0.75rem', 
                    textTransform: 'uppercase'
                  }}
                >
                  {item.section}
                </div>
              );
            }
            
            const isActive = pathname === item.href;
            return (
              <Link 
                key={index} 
                href={item.href}
                onClick={() => onClose()}
                style={{
                  display: 'block',
                  padding: '0.55rem 0.75rem',
                  margin: '0.1rem 0',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? (isLightMode ? '#047857' : '#34D399') : (isLightMode ? '#475569' : '#9CA3AF'),
                  background: isActive ? (isLightMode ? '#ECFDF5' : '#064E3B') : 'transparent',
                  border: isActive ? (isLightMode ? '1px solid #A7F3D0' : '1px solid rgba(16, 185, 129, 0.2)') : '1px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Portal Switcher for Admins */}
        {isAdmin && (
          <div style={{ padding: '0.5rem 0.75rem' }}>
            {isAdminPath ? (
              <Link 
                href="/dashboard/perawat"
                style={{
                  display: 'block',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  background: isLightMode ? '#F1F5F9' : 'rgba(255, 255, 255, 0.04)',
                  border: isLightMode ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isLightMode ? '#334155' : '#9CA3AF',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  textAlign: 'center'
                }}
              >
                Ke Portal Perawat →
              </Link>
            ) : (
              <Link 
                href="/dashboard/admin"
                style={{
                  display: 'block',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '6px',
                  background: isLightMode ? '#ECFDF5' : 'rgba(255, 255, 255, 0.04)',
                  border: isLightMode ? '1px solid #A7F3D0' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isLightMode ? '#047857' : '#34D399',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  textAlign: 'center'
                }}
              >
                Ke Admin Control →
              </Link>
            )}
          </div>
        )}

        {/* PRACTITIONER AVAILABILITY TOGGLE BUTTON (Placed Directly Above Profile Card) */}
        {!isAdminPath && (
          <div style={{ padding: '0.5rem 0.75rem 0.25rem 0.75rem' }}>
            <div 
              style={{ 
                background: isLightMode ? '#E2E8F0' : '#12151E', 
                border: isLightMode ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.1)', 
                borderRadius: '8px', 
                padding: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '2px'
              }}
            >
              <button
                type="button"
                onClick={() => handleToggleAvailability(false)}
                style={{
                  flex: 1,
                  padding: '0.45rem 0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: !isReceivingCases 
                    ? (isLightMode ? '#FFFFFF' : '#1A1E2B') 
                    : 'transparent',
                  color: !isReceivingCases 
                    ? '#EF4444' 
                    : (isLightMode ? '#64748B' : '#6B7280'),
                  boxShadow: !isReceivingCases ? (isLightMode ? '0 1px 4px rgba(0,0,0,0.1)' : '0 2px 6px rgba(0,0,0,0.3)') : 'none'
                }}
              >
                Tak Aktif
              </button>

              <button
                type="button"
                onClick={() => handleToggleAvailability(true)}
                style={{
                  flex: 1,
                  padding: '0.45rem 0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: isReceivingCases 
                    ? (isLightMode ? '#FFFFFF' : '#1F2432') 
                    : 'transparent',
                  color: isReceivingCases 
                    ? (isLightMode ? '#059669' : '#34D399') 
                    : (isLightMode ? '#64748B' : '#6B7280'),
                  boxShadow: isReceivingCases ? (isLightMode ? '0 1px 4px rgba(0,0,0,0.1)' : '0 2px 6px rgba(0,0,0,0.3)') : 'none'
                }}
              >
                Aktif
              </button>
            </div>
          </div>
        )}
        
        {/* User Profile Footer Card */}
        <div 
          style={{ 
            padding: '0.85rem', 
            margin: '0.5rem 0.75rem 0.75rem 0.75rem', 
            borderRadius: '6px', 
            background: isLightMode ? '#F8FAFC' : '#10131A', 
            border: isLightMode ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isLightMode ? '#ECFDF5' : '#064E3B', color: isLightMode ? '#047857' : '#34D399', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0, border: isLightMode ? '1px solid #A7F3D0' : '1px solid rgba(52, 211, 153, 0.3)' }}>
              {initials}
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '0.8rem', color: isLightMode ? '#0F172A' : '#F9FAFB', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profile?.full_name || 'Pengguna'}
              </div>
              <div style={{ fontSize: '0.625rem', fontWeight: 600, color: isLightMode ? '#64748B' : '#6B7280', textTransform: 'uppercase' }}>
                {role.replace('_', ' ')}
              </div>
            </div>
          </div>

          <button 
            onClick={handleSignOut}
            style={{ 
              background: 'transparent', 
              border: isLightMode ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.12)', 
              color: isLightMode ? '#475569' : '#9CA3AF', 
              padding: '0.3rem 0.55rem', 
              borderRadius: '4px', 
              fontSize: '0.7rem', 
              fontWeight: 600, 
              cursor: 'pointer'
            }}
          >
            Keluar
          </button>
        </div>

      </aside>
    </>
  );
}


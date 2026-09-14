'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { ToastProvider } from '@/components/ui/Toast';
import { useAuth } from '@/lib/hooks/useAuth';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }
      
      const role = profile?.role || user?.role || 'practitioner';
      const isAdmin = role === 'admin' || role === 'super_admin';
      const isMarketer = role === 'marketer';

      // Role Access Guard
      if (pathname.startsWith('/dashboard/admin') && !isAdmin) {
        router.replace(isMarketer ? '/dashboard/marketer' : '/dashboard/perawat');
      }
      if (pathname.startsWith('/dashboard/marketer') && !isMarketer && !isAdmin) {
        router.replace('/dashboard/perawat');
      }
      if (pathname.startsWith('/dashboard/perawat') && isMarketer) {
        router.replace('/dashboard/marketer');
      }
    }
  }, [user, profile, loading, pathname, router]);
  
  if (loading || (!loading && !user)) {
    return (
      <div className="dashboard-wrapper justify-center items-center" style={{ minHeight: '100vh', background: '#08090C', display: 'flex' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderColor: 'rgba(16,185,129,0.2)', borderTopColor: '#10B981' }}></div>
      </div>
    );
  }
  
  return (
    <ToastProvider>
      <div className="dashboard-wrapper">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="dashboard-main">
          {/* Universal Header Bar with Theme Toggle at Top Right */}
          <div 
            style={{ 
              padding: '0.65rem 1.25rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'var(--bg-secondary, #090A0F)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button 
                className="hamburger-btn hidden-desktop" 
                onClick={() => setSidebarOpen(true)} 
                style={{ color: 'inherit', fontSize: '1.2rem', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                ☰
              </button>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '-0.01em', opacity: 0.85 }}>
                E-SYIFAA' PORTAL
              </div>
            </div>

            {/* Top Right Corner Theme Toggle Switch */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ThemeToggle />
            </div>
          </div>
          
          <div className="dashboard-content">
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}


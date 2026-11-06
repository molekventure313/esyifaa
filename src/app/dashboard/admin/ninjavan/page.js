'use client';

import { useState, useCallback } from 'react';
import PosCodDashboard from '@/components/ninjavan/PosCodDashboard';

// Dashboard Pos & COD HQ (super_admin). Tab HQ = parcel order HQ · tab Fighter = parcel fighter yang guna akaun NinjaVan HQ
// (tanda COD diterima → kredit COD ke bil fighter).
export default function NinjaVanDashboardPage() {
  const [scope, setScope] = useState('hq');
  const urlFor = useCallback(period => `/api/admin/ninjavan/summary?period=${period}&scope=${scope}`, [scope]);
  const tab = (value, text) => (
    <button key={value} onClick={() => setScope(value)} style={{
      padding: '0.35rem 0.85rem', borderRadius: 6, fontSize: '0.78rem', cursor: 'pointer', border: 'none', marginRight: '0.35rem',
      fontWeight: scope === value ? 700 : 500, background: scope === value ? '#DC2626' : 'rgba(148,163,184,0.15)', color: scope === value ? '#fff' : 'inherit',
    }}>{text}</button>
  );
  return (
    <PosCodDashboard
      key={scope}
      urlFor={urlFor}
      canRemit
      showFighter={scope === 'fighter'}
      headerExtra={<>{tab('hq', '🏢 HQ')}{tab('fighter', '🥊 Fighter')}</>}
      subtitle={scope === 'fighter'
        ? 'Parcel fighter dalam akaun NinjaVan HQ · COD yang ditanda diterima dikreditkan ke bil fighter'
        : undefined}
      remitNote={scope === 'fighter' ? 'COD ini akan dikreditkan ke bil fighter.' : undefined}
    />
  );
}

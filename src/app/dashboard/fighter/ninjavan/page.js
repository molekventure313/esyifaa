'use client';

import PosCodDashboard from '@/components/ninjavan/PosCodDashboard';

// Fighter — Pos & COD: parcel sendiri dalam akaun NinjaVan HQ (baca sahaja). COD diterima HQ → dikreditkan ke bil fighter.
const urlFor = (period, product = 'all') => `/api/fighter/ninjavan?period=${period}&product=${product}`;

export default function FighterNinjaVanPage() {
  return (
    <PosCodDashboard
      urlFor={urlFor}
      waFrom={null}
      label="🥊 FIGHTER · NINJAVAN"
      subtitle="Parcel anda (akaun NinjaVan HQ) · status dikemaskini automatik · COD diterima HQ dikreditkan ke bil anda (Stok & Bil)"
    />
  );
}

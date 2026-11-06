'use client';

import PosCodDashboard from '@/components/ninjavan/PosCodDashboard';

// Fighter — Pos & COD: parcel sendiri dalam akaun NinjaVan HQ (baca sahaja). COD diterima HQ → dikreditkan ke bil fighter.
const urlFor = period => `/api/fighter/ninjavan?period=${period}`;

export default function FighterNinjaVanPage() {
  return (
    <PosCodDashboard
      urlFor={urlFor}
      label="🥊 FIGHTER · NINJAVAN"
      subtitle="Parcel anda (akaun NinjaVan HQ) · status dikemaskini automatik · COD diterima HQ dikreditkan ke bil anda (Stok & Bil)"
    />
  );
}

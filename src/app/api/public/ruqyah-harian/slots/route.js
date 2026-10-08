import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { RH_MAX_SLOTS } from '@/lib/ruqyah-harian';
import { countRhSlotsUsed } from '@/lib/ruqyah-harian-server';

// GET /api/public/ruqyah-harian/slots — baki slot pendaftaran baru bulan ini (awam)
// Dikira dari order Ruqyah Harian yang DAH DIBAYAR sejak 1hb bulan semasa (MYT).
const CACHE = {
  'Cache-Control': 'public, max-age=0, must-revalidate',
  'Netlify-CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
};

export async function GET() {
  try {
    const used = await countRhSlotsUsed(createAdminClient());
    return NextResponse.json({ max: RH_MAX_SLOTS, used, remaining: Math.max(0, RH_MAX_SLOTS - used) }, { headers: CACHE });
  } catch (e) {
    // Ralat → jangan sekat jualan; papar tanpa kaunter
    return NextResponse.json({ max: RH_MAX_SLOTS, used: null, remaining: null }, { status: 200 });
  }
}

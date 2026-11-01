import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { evaluateAll } from '@/lib/ads-hub/automation';

// Tugas berjadual (netlify/functions/ads-rules-cron.mjs): nilai peraturan auto Ads Hub + amaran sistem (guna order sebenar).
// Dilindungi header x-cron-secret = env CRON_SECRET.
export const maxDuration = 26;
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('x-cron-secret') !== secret) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    return NextResponse.json({ success: true, ...(await evaluateAll(createAdminClient(), { budgetMs: 20000 })) });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

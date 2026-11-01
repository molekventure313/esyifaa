import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { syncDue } from '@/lib/ads-hub/sync';

// Tugas berjadual (netlify/functions/ads-sync-cron.mjs, setiap jam):
// sync data Meta (ads + prestasi 3 hari terakhir) untuk semua marketer yang sambung Ads Hub.
// Dilindungi header x-cron-secret = env CRON_SECRET.
export const maxDuration = 26;
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('x-cron-secret') !== secret) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    return NextResponse.json({ success: true, ...(await syncDue(createAdminClient(), { budgetMs: 20000 })) });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { runMorningReports } from '@/lib/ads-hub/morning';

// Tugas berjadual (netlify/functions/ads-report-cron.mjs): jana laporan pagi Ads Hub (dari 9 pagi MYT) bagi marketer yang belum ada laporan hari ini.
// Dilindungi header x-cron-secret = env CRON_SECRET.
export const maxDuration = 26;
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('x-cron-secret') !== secret) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    return NextResponse.json({ success: true, ...(await runMorningReports(createAdminClient(), { budgetMs: 18000 })) });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

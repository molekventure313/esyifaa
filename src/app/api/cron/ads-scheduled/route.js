import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { runDueSchedules } from '@/lib/ads-hub/automation';

// Tugas berjadual (netlify/functions/ads-scheduled-cron.mjs): laksana tindakan Ads Hub berjadual yang dah sampai masa.
// Dilindungi header x-cron-secret = env CRON_SECRET.
export const maxDuration = 26;
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('x-cron-secret') !== secret) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    return NextResponse.json({ success: true, ...(await runDueSchedules(createAdminClient(), { budgetMs: 20000 })) });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

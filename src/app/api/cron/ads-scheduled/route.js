import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { runDueSchedules, runTimeRules } from '@/lib/ads-hub/automation';

// Tugas berjadual (netlify/functions/ads-scheduled-cron.mjs): laksana tindakan Ads Hub berjadual yang dah sampai masa
// + peraturan auto ikut jam (contoh reset budget 11:30 malam, pause 12 malam, hidupkan 6 pagi).
// Dilindungi header x-cron-secret = env CRON_SECRET.
export const maxDuration = 26;
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('x-cron-secret') !== secret) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const admin = createAdminClient();
    const schedules = await runDueSchedules(admin, { budgetMs: 8000 });
    const timeRules = await runTimeRules(admin, { budgetMs: 12000 });
    return NextResponse.json({ success: true, ...schedules, time_rules: timeRules });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

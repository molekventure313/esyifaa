import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { runMaintenance } from '@/lib/return-waybills';

// Tugas berjadual (netlify/functions/return-waybills-cron.mjs, setiap 10 minit):
// proses gambar waybill yang tertinggal + padam gambar 'processed' lebih 7 hari.
// Dilindungi header x-cron-secret = env CRON_SECRET.
export const maxDuration = 26;
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('x-cron-secret') !== secret) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const out = await runMaintenance(createAdminClient(), { maxProcess: 1 });
    return NextResponse.json({ success: true, ...out });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

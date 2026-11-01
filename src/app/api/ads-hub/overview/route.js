import { NextResponse } from 'next/server';
import { adsHubGuard, targetMarketer, tableMissing, MIGRATION_MSG } from '@/lib/ads-hub/guard';
import { buildOverview, PERIODS } from '@/lib/ads-hub/report';

// Laporan Ads Hub: ringkasan, trend harian, angle & jadual ads — ROAS dari order sebenar.
// ?period=today|yesterday|7d|30d|month · super_admin: ?marketer=<id>
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const g = await adsHubGuard();
  if (g.error) return g.error;
  const sp = new URL(req.url).searchParams;
  const t = targetMarketer(g, sp.get('marketer'));
  if (t.error) return t.error;
  const period = PERIODS[sp.get('period')] ? sp.get('period') : '7d';
  try {
    return NextResponse.json({ success: true, ...(await buildOverview(g.admin, t.id, period)) });
  } catch (e) {
    return NextResponse.json({ success: false, error: tableMissing(e) ? MIGRATION_MSG : e.message }, { status: 500 });
  }
}

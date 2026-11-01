import { NextResponse } from 'next/server';
import { adsHubGuard, targetMarketer, marketerConn, fail } from '@/lib/ads-hub/guard';
import { generateMorningReport } from '@/lib/ads-hub/morning';

// Laporan pagi. GET → 30 laporan terkini (super_admin: ?marketer=<id>) · POST → jana laporan hari ini sekarang
export const maxDuration = 26;
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const g = await adsHubGuard();
  if (g.error) return g.error;
  const t = targetMarketer(g, new URL(req.url).searchParams.get('marketer'));
  if (t.error) return t.error;
  const { data, error } = await g.admin.from('meta_reports').select('report_date, body, summary, created_at')
    .eq('marketer_id', t.id).order('report_date', { ascending: false }).limit(30);
  if (error) return fail(error);
  return NextResponse.json({ success: true, reports: data || [] });
}

export async function POST() {
  const g = await marketerConn();
  if (g.error) return g.error;
  try {
    const r = await generateMorningReport(g.admin, g.conn, { force: true });
    return NextResponse.json({ success: r.ok, ...r }, { status: r.ok ? 200 : 502 });
  } catch (e) { return fail(e); }
}

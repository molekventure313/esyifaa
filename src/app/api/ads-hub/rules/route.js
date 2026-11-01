import { NextResponse } from 'next/server';
import { adsHubGuard, targetMarketer, marketerConn, fail } from '@/lib/ads-hub/guard';
import { createRule, describeRule } from '@/lib/ads-hub/automation';

// Peraturan auto. GET (super_admin: ?marketer=<id>) · POST → cipta peraturan (marketer)
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const g = await adsHubGuard();
  if (g.error) return g.error;
  const t = targetMarketer(g, new URL(req.url).searchParams.get('marketer'));
  if (t.error) return t.error;
  const { data, error } = await g.admin.from('meta_rules').select('*').eq('marketer_id', t.id).order('id');
  if (error) return fail(error);
  return NextResponse.json({ success: true, rules: (data || []).map(r => ({ ...r, summary: describeRule(r) })) });
}

export async function POST(req) {
  const g = await marketerConn();
  if (g.error) return g.error;
  const body = await req.json().catch(() => ({}));
  const r = await createRule(g.admin, g.user.id, body);
  return NextResponse.json({ success: r.ok, ...r }, { status: r.ok ? 200 : 400 });
}

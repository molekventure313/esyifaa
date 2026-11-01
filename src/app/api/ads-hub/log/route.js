import { NextResponse } from 'next/server';
import { adsHubGuard, targetMarketer, fail } from '@/lib/ads-hub/guard';

// Log tindakan pada akaun Meta (100 terkini). super_admin: ?marketer=<id>
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const g = await adsHubGuard();
  if (g.error) return g.error;
  const t = targetMarketer(g, new URL(req.url).searchParams.get('marketer'));
  if (t.error) return t.error;
  const { data, error } = await g.admin.from('meta_actions_log')
    .select('id, created_at, source, action, object_type, object_name, before, after, status, message')
    .eq('marketer_id', t.id).order('created_at', { ascending: false }).limit(100);
  if (error) return fail(error);
  return NextResponse.json({ success: true, log: data || [] });
}

import { NextResponse } from 'next/server';
import { adsHubGuard, targetMarketer, fail } from '@/lib/ads-hub/guard';
import { describeAction } from '@/lib/ads-hub/actions';

// Tindakan berjadual: yang belum jalan + 20 terkini yang dah selesai. super_admin: ?marketer=<id>
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const g = await adsHubGuard();
  if (g.error) return g.error;
  const t = targetMarketer(g, new URL(req.url).searchParams.get('marketer'));
  if (t.error) return t.error;
  const [pending, done] = await Promise.all([
    g.admin.from('meta_scheduled_actions').select('*').eq('marketer_id', t.id).in('status', ['pending', 'running']).order('run_at'),
    g.admin.from('meta_scheduled_actions').select('*').eq('marketer_id', t.id).in('status', ['done', 'failed', 'cancelled']).order('run_at', { ascending: false }).limit(20),
  ]);
  if (pending.error) return fail(pending.error);
  const fmt = s => ({ ...s, label: describeAction(s) });
  return NextResponse.json({ success: true, pending: (pending.data || []).map(fmt), done: (done.data || []).map(fmt) });
}

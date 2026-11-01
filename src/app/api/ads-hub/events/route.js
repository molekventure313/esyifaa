import { NextResponse } from 'next/server';
import { adsHubGuard, targetMarketer, fail } from '@/lib/ads-hub/guard';

// Amaran & cadangan peraturan. Terbuka dahulu, kemudian 20 yang dah selesai. super_admin: ?marketer=<id>
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const g = await adsHubGuard();
  if (g.error) return g.error;
  const t = targetMarketer(g, new URL(req.url).searchParams.get('marketer'));
  if (t.error) return t.error;
  const cols = 'id, created_at, kind, severity, object_name, title, detail, action, status, resolved_at';
  const [open, recent] = await Promise.all([
    g.admin.from('meta_events').select(cols).eq('marketer_id', t.id).eq('status', 'open').order('created_at', { ascending: false }).limit(50),
    g.admin.from('meta_events').select(cols).eq('marketer_id', t.id).neq('status', 'open').order('created_at', { ascending: false }).limit(20),
  ]);
  if (open.error) return fail(open.error);
  return NextResponse.json({ success: true, open: open.data || [], recent: recent.data || [] });
}

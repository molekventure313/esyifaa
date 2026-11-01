import { NextResponse } from 'next/server';
import { adsHubGuard, tableMissing, MIGRATION_MSG } from '@/lib/ads-hub/guard';

// super_admin: senarai marketer + status sambungan Meta (untuk pilih dalam Ads Hub admin)
export const dynamic = 'force-dynamic';

export async function GET() {
  const g = await adsHubGuard();
  if (g.error) return g.error;
  if (!g.isOwner) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

  const [{ data: marketers }, { data: conns, error }] = await Promise.all([
    g.admin.from('profiles').select('id, full_name, marketer_code')
      .eq('role', 'marketer').is('team_leader_id', null).order('full_name'),
    g.admin.from('meta_connections').select('marketer_id, ad_account_name, status, last_synced_at'),
  ]);
  if (error) return NextResponse.json({ success: false, error: tableMissing(error) ? MIGRATION_MSG : error.message }, { status: 500 });

  const byId = new Map((conns || []).map(c => [c.marketer_id, c]));
  const list = (marketers || []).map(m => ({
    id: m.id, name: m.full_name || m.marketer_code || 'Marketer', code: m.marketer_code,
    connection: byId.get(m.id) || null,
  })).sort((a, b) => (!!b.connection - !!a.connection) || a.name.localeCompare(b.name));
  return NextResponse.json({ success: true, marketers: list });
}

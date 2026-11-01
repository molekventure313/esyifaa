import { NextResponse } from 'next/server';
import { adsHubGuard, targetMarketer } from '@/lib/ads-hub/guard';
import { syncConnection } from '@/lib/ads-hub/sync';

// Butang "Sync sekarang" — tarik data Meta 3 hari terakhir. Had: sekali setiap 2 minit.
export const maxDuration = 26;
export const dynamic = 'force-dynamic';

const COOLDOWN_MS = 2 * 60 * 1000;

export async function POST(req) {
  const g = await adsHubGuard();
  if (g.error) return g.error;
  const t = targetMarketer(g, new URL(req.url).searchParams.get('marketer'));
  if (t.error) return t.error;

  const { data: conn, error } = await g.admin.from('meta_connections').select('*').eq('marketer_id', t.id).maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  if (!conn) return NextResponse.json({ success: false, error: 'Belum sambung akaun Meta.' }, { status: 400 });

  const last = conn.last_synced_at ? new Date(conn.last_synced_at).getTime() : 0;
  if (Date.now() - last < COOLDOWN_MS) {
    return NextResponse.json({ success: true, skipped: true, last_synced_at: conn.last_synced_at });
  }
  const sync = await syncConnection(g.admin, conn, { days: 3 });
  return NextResponse.json({ success: sync.ok, ...sync }, { status: sync.ok ? 200 : 502 });
}

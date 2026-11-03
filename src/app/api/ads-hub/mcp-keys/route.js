import { NextResponse } from 'next/server';
import { adsHubGuard, writeTarget, fail } from '@/lib/ads-hub/guard';
import { newApiKey } from '@/lib/ads-hub/mcp';

// API key MCP E-Syifa (Claude Code baca data Ads Hub). super_admin: ?marketer=<id> (tanpa = akaun HQ).
// GET senarai · POST jana (key penuh dipulangkan SEKALI sahaja) · DELETE ?id=<key id> batalkan.
export const dynamic = 'force-dynamic';

const MAX_KEYS = 5;
const MISSING = 'Jadual API key belum wujud — run migration 031 dalam Supabase.';
const missing = e => /mcp_api_keys/.test(e?.message || '');

async function target(req) {
  const g = await adsHubGuard();
  if (g.error) return g;
  const t = await writeTarget(g, req);
  if (t.error) return t;
  return { ...g, mid: t.id };
}

const list = (admin, mid) => admin.from('mcp_api_keys')
  .select('id, name, key_last4, created_at, last_used_at').eq('marketer_id', mid).is('revoked_at', null)
  .order('created_at', { ascending: false });

export async function GET(req) {
  const g = await target(req);
  if (g.error) return g.error;
  const { data, error } = await list(g.admin, g.mid);
  if (error) return NextResponse.json({ success: false, error: missing(error) ? MISSING : error.message }, { status: 500 });
  return NextResponse.json({ success: true, keys: data });
}

export async function POST(req) {
  const g = await target(req);
  if (g.error) return g.error;
  try {
    const body = await req.json().catch(() => ({}));
    const name = String(body.name || 'Claude').trim().slice(0, 40) || 'Claude';
    const { data: existing, error: le } = await list(g.admin, g.mid);
    if (le) throw le;
    if (existing.length >= MAX_KEYS) return NextResponse.json({ success: false, error: `Maksimum ${MAX_KEYS} key aktif. Batalkan key lama dulu.` }, { status: 400 });
    const k = newApiKey();
    const { data, error } = await g.admin.from('mcp_api_keys')
      .insert({ marketer_id: g.mid, created_by: g.user.id, name, key_hash: k.key_hash, key_last4: k.key_last4 })
      .select('id, name, key_last4, created_at, last_used_at').single();
    if (error) throw error;
    return NextResponse.json({ success: true, key: k.key, record: data });
  } catch (e) {
    return missing(e) ? NextResponse.json({ success: false, error: MISSING }, { status: 500 }) : fail(e);
  }
}

export async function DELETE(req) {
  const g = await target(req);
  if (g.error) return g.error;
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'id diperlukan.' }, { status: 400 });
  const { data, error } = await g.admin.from('mcp_api_keys').update({ revoked_at: new Date().toISOString() })
    .eq('id', id).eq('marketer_id', g.mid).is('revoked_at', null).select('id');
  if (error) return fail(error);
  if (!data?.length) return NextResponse.json({ success: false, error: 'Key tidak dijumpai.' }, { status: 404 });
  return NextResponse.json({ success: true });
}

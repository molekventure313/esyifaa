import { NextResponse } from 'next/server';
import { adsHubGuard, writeTarget, fail } from '@/lib/ads-hub/guard';
import { decryptToken } from '@/lib/ads-hub/crypto';
import { metaGet } from '@/lib/ads-hub/meta';

// Tetapan Autopilot setiap akaun (marketer: akaun sendiri; super_admin: HQ atau ?marketer=<id>).
// GET: tetapan + pilihan Page / Instagram / adset contoh · PATCH: simpan tetapan (termasuk suis kecemasan).
export const dynamic = 'force-dynamic';

const COLS = 'autopilot_enabled, autopilot_campaign_id, autopilot_adset_budget, autopilot_max_adsets, autopilot_daily_cap, autopilot_page_id, autopilot_ig_id, autopilot_template_adset_id, limit_max_budget';
const MISSING = 'Run migration 032 dalam Supabase dulu.';
const missing = e => /autopilot_/.test(e?.message || '');

async function hq(req) {
  const g = await adsHubGuard();
  if (g.error) return g;
  const t = await writeTarget(g, req);
  if (t.error) return t;
  return { ...g, mid: t.id };
}

export async function GET(req) {
  const g = await hq(req);
  if (g.error) return g.error;
  const { data: conn, error } = await g.admin.from('meta_connections').select(`${COLS}, token_encrypted, ad_account_id`).eq('marketer_id', g.mid).maybeSingle();
  if (error) return NextResponse.json({ success: false, error: missing(error) ? MISSING : error.message }, { status: 500 });
  if (!conn) return NextResponse.json({ success: false, error: 'Sambung akaun Meta dulu.' }, { status: 400 });
  const { token_encrypted, ad_account_id, ...settings } = conn;
  if (!token_encrypted) return NextResponse.json({ success: false, error: 'Akaun ini disambung melalui MCP Meta Ads (tanpa token). Launch ads terus melalui MCP Meta Ads dalam Claude — tetapan autopilot E-Syifa tidak digunakan.' });

  // Pilihan: Page & Instagram yang boleh dipromosi oleh ad account; adset contoh dari cache
  const opts = { pages: [], instagram: [], adsets: [], warning: null };
  try {
    const token = decryptToken(token_encrypted);
    const [pages, ig] = await Promise.all([
      metaGet(`${ad_account_id}/promote_pages`, { fields: 'id,name', limit: 100 }, token).catch(() => ({ data: [] })),
      metaGet(`${ad_account_id}/instagram_accounts`, { fields: 'id,username', limit: 100 }, token).catch(() => ({ data: [] })),
    ]);
    opts.pages = (pages.data || []).map(p => ({ id: p.id, name: p.name }));
    opts.instagram = (ig.data || []).map(a => ({ id: a.id, name: a.username }));
  } catch (e) { opts.warning = e.message; }
  const { data: ads } = await g.admin.from('meta_ads').select('adset_id, adset_name, adset_status, campaign_name')
    .eq('marketer_id', g.mid).not('adset_id', 'is', null).neq('status', 'ARCHIVED');
  const seen = new Map();
  for (const a of ads || []) if (!seen.has(a.adset_id)) seen.set(a.adset_id, { id: a.adset_id, name: a.adset_name, status: a.adset_status, campaign: a.campaign_name });
  opts.adsets = [...seen.values()].sort((x, y) => (x.status === 'ACTIVE' ? -1 : 1) - (y.status === 'ACTIVE' ? -1 : 1));
  return NextResponse.json({ success: true, settings, options: opts });
}

export async function PATCH(req) {
  const g = await hq(req);
  if (g.error) return g.error;
  try {
    const b = await req.json();
    const upd = {};
    if ('autopilot_enabled' in b) upd.autopilot_enabled = !!b.autopilot_enabled;
    for (const [k, min, max] of [['autopilot_adset_budget', 1, 1000], ['autopilot_daily_cap', 1, 10000], ['autopilot_max_adsets', 1, 50]]) {
      if (k in b) {
        const v = Number(b[k]);
        if (!(v >= min && v <= max)) return NextResponse.json({ success: false, error: `${k} mesti antara ${min} dan ${max}.` }, { status: 400 });
        upd[k] = k === 'autopilot_max_adsets' ? Math.round(v) : v;
      }
    }
    for (const k of ['autopilot_page_id', 'autopilot_ig_id', 'autopilot_template_adset_id']) {
      if (k in b) {
        const v = b[k] ? String(b[k]).trim() : null;
        if (v && !/^\d{5,25}$/.test(v)) return NextResponse.json({ success: false, error: `${k} tidak sah.` }, { status: 400 });
        upd[k] = v;
      }
    }
    if (!Object.keys(upd).length) return NextResponse.json({ success: false, error: 'Tiada perubahan.' }, { status: 400 });
    const { data, error } = await g.admin.from('meta_connections').update(upd).eq('marketer_id', g.mid).select(COLS).single();
    if (error) throw error;
    if ('autopilot_enabled' in upd) {
      await g.admin.from('meta_actions_log').insert({
        marketer_id: g.mid, actor_id: g.user.id, source: 'autopilot', action: 'autopilot_switch',
        after: { enabled: upd.autopilot_enabled }, status: 'ok', message: `Autopilot ${upd.autopilot_enabled ? 'dihidupkan' : 'dimatikan'}.`,
      }).then(() => {}, () => {});
    }
    return NextResponse.json({ success: true, settings: data });
  } catch (e) {
    return missing(e) ? NextResponse.json({ success: false, error: MISSING }, { status: 500 }) : fail(e);
  }
}

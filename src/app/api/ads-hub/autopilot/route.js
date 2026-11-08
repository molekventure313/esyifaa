import { NextResponse } from 'next/server';
import { adsHubGuard, writeTarget, fail } from '@/lib/ads-hub/guard';
import { decryptToken } from '@/lib/ads-hub/crypto';
import { metaGet } from '@/lib/ads-hub/meta';

// Tetapan Autopilot setiap akaun (marketer: akaun sendiri; super_admin: HQ atau ?marketer=<id>).
// GET: tetapan + pilihan Page / Instagram / adset contoh · PATCH: simpan tetapan (termasuk suis kecemasan).
export const dynamic = 'force-dynamic';

const COLS = 'autopilot_enabled, autopilot_campaign_id, autopilot_adset_budget, autopilot_max_adsets, autopilot_daily_cap, autopilot_page_id, autopilot_ig_id, autopilot_template_adset_id, limit_max_budget';
const COLS2 = `${COLS}, autopilot_mode, autopilot_strategy_id, autopilot_max_launches_day, autopilot_notes`;   // migration 039
const MISSING = 'Run migration 032 & 039 dalam Supabase dulu.';
const missing = e => /autopilot_/.test(e?.message || '');
const MODES = ['manual', 'shadow', 'veto', 'auto'];
// Pilih lajur: cuba dengan kolum 039, jika belum di-run guna set asal (mod = manual)
async function readConn(admin, mid, extra = '') {
  let r = await admin.from('meta_connections').select(`${COLS2}${extra}`).eq('marketer_id', mid).maybeSingle();
  if (r.error && /autopilot_(mode|strategy|max_launches|notes)/.test(r.error.message)) {
    r = await admin.from('meta_connections').select(`${COLS}${extra}`).eq('marketer_id', mid).maybeSingle();
    if (r.data) r.data.mode_unavailable = true;
  }
  return r;
}

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
  const { data: conn, error } = await readConn(g.admin, g.mid, ', token_encrypted, ad_account_id');
  if (error) return NextResponse.json({ success: false, error: missing(error) ? MISSING : error.message }, { status: 500 });
  if (!conn) return NextResponse.json({ success: false, error: 'Sambung akaun Meta dulu.' }, { status: 400 });
  const { token_encrypted, ad_account_id, ...settings } = conn;
  if (!token_encrypted) return NextResponse.json({ success: false, error: 'Akaun ini disambung melalui MCP Meta Ads (tanpa token). Launch ads terus melalui MCP Meta Ads dalam Claude — tetapan autopilot E-Syifa tidak digunakan.' });

  // Pilihan: Page & Instagram yang boleh dipromosi oleh ad account; adset contoh dari cache
  const opts = { pages: [], instagram: [], adsets: [], warning: null };
  try {
    const token = decryptToken(token_encrypted);
    // Page: yang pernah dipromosi oleh ad account + semua Page yang token (System User) ada akses
    const [pages, own, ig] = await Promise.all([
      metaGet(`${ad_account_id}/promote_pages`, { fields: 'id,name', limit: 100 }, token).catch(() => ({ data: [] })),
      metaGet('me/accounts', { fields: 'id,name', limit: 100 }, token).catch(() => ({ data: [] })),
      metaGet(`${ad_account_id}/instagram_accounts`, { fields: 'id,username', limit: 100 }, token).catch(() => ({ data: [] })),
    ]);
    const pageMap = new Map();
    for (const p of [...(pages.data || []), ...(own.data || [])]) if (!pageMap.has(p.id)) pageMap.set(p.id, { id: p.id, name: p.name });
    opts.pages = [...pageMap.values()];
    opts.instagram = (ig.data || []).map(a => ({ id: a.id, name: a.username }));
  } catch (e) { opts.warning = e.message; }
  const { data: ads } = await g.admin.from('meta_ads').select('adset_id, adset_name, adset_status, campaign_name')
    .eq('marketer_id', g.mid).not('adset_id', 'is', null).neq('status', 'ARCHIVED');
  const seen = new Map();
  for (const a of ads || []) if (!seen.has(a.adset_id)) seen.set(a.adset_id, { id: a.adset_id, name: a.adset_name, status: a.adset_status, campaign: a.campaign_name });
  opts.adsets = [...seen.values()].sort((x, y) => (x.status === 'ACTIVE' ? -1 : 1) - (y.status === 'ACTIVE' ? -1 : 1));
  if (g.isOwner && !settings.mode_unavailable) {
    const { data: st } = await g.admin.from('autopilot_strategies').select('id, name, description, params').order('name');
    opts.strategies = st || [];
  }
  return NextResponse.json({ success: true, settings, options: opts, canManage: !!g.isOwner });
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
    // Mod, strategi, nota & had launch sehari: HQ (super_admin) sahaja
    const hqOnly = ['autopilot_mode', 'autopilot_strategy_id', 'autopilot_notes', 'autopilot_max_launches_day', 'apply_strategy'].filter(k => k in b);
    if (hqOnly.length && !g.isOwner) return NextResponse.json({ success: false, error: 'Mod & strategi autopilot ditetapkan oleh HQ.' }, { status: 403 });
    if ('autopilot_mode' in b) {
      if (!MODES.includes(b.autopilot_mode)) return NextResponse.json({ success: false, error: 'Mod tidak sah.' }, { status: 400 });
      upd.autopilot_mode = b.autopilot_mode;
    }
    if ('autopilot_max_launches_day' in b) {
      const v = Math.round(Number(b.autopilot_max_launches_day));
      if (!(v >= 1 && v <= 20)) return NextResponse.json({ success: false, error: 'Launch sehari mesti antara 1 dan 20.' }, { status: 400 });
      upd.autopilot_max_launches_day = v;
    }
    if ('autopilot_notes' in b) upd.autopilot_notes = b.autopilot_notes ? String(b.autopilot_notes).slice(0, 4000) : null;
    if ('autopilot_strategy_id' in b || b.apply_strategy) {
      const id = b.autopilot_strategy_id ? Number(b.autopilot_strategy_id) : null;
      upd.autopilot_strategy_id = id;
      if (id) {
        const { data: st } = await g.admin.from('autopilot_strategies').select('params').eq('id', id).maybeSingle();
        if (!st) return NextResponse.json({ success: false, error: 'Templat strategi tidak dijumpai.' }, { status: 400 });
        // apply_strategy: salin had dari templat ke akaun ini (had kekal boleh diubah selepas itu)
        if (b.apply_strategy) {
          const pr = st.params || {};
          for (const [k, col] of [['adset_budget', 'autopilot_adset_budget'], ['max_adsets', 'autopilot_max_adsets'], ['daily_cap', 'autopilot_daily_cap'], ['max_launches_day', 'autopilot_max_launches_day']]) {
            if (Number(pr[k]) > 0) upd[col] = col.endsWith('adsets') || col.endsWith('day') ? Math.round(Number(pr[k])) : Number(pr[k]);
          }
        }
      }
    }
    if (!Object.keys(upd).length) return NextResponse.json({ success: false, error: 'Tiada perubahan.' }, { status: 400 });
    let { data, error } = await g.admin.from('meta_connections').update(upd).eq('marketer_id', g.mid).select(COLS2).single();
    // Belum run 039: simpan tetapan asal sahaja
    if (error && /autopilot_(mode|strategy|max_launches|notes)/.test(error.message) && !hqOnly.length) {
      ({ data, error } = await g.admin.from('meta_connections').update(upd).eq('marketer_id', g.mid).select(COLS).single());
      if (data) data.mode_unavailable = true;
    }
    if (error) throw error;
    if ('autopilot_mode' in upd) {
      await g.admin.from('meta_actions_log').insert({
        marketer_id: g.mid, actor_id: g.user.id, source: 'autopilot', action: 'autopilot_mode',
        after: { mode: upd.autopilot_mode }, status: 'ok', message: `Mod autopilot ditukar ke ${upd.autopilot_mode.toUpperCase()}.`,
      }).then(() => {}, () => {});
    }
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

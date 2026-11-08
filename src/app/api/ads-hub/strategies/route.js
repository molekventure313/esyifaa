import { NextResponse } from 'next/server';
import { adsHubGuard, fail } from '@/lib/ads-hub/guard';

// Templat strategi autopilot (HQ sahaja): SOP + had siap yang boleh dipakai pada mana-mana akaun Ads Hub.
// GET senarai (dengan bilangan akaun yang guna) · POST cipta · PATCH ?id= ubah · DELETE ?id= padam.
export const dynamic = 'force-dynamic';

const MISSING = 'Run migration 039 dalam Supabase dulu.';
const missing = e => /autopilot_strateg/.test(e?.message || '');
const NUM = { adset_budget: [1, 1000], max_adsets: [1, 50], daily_cap: [1, 10000], max_launches_day: [1, 20], kpi_roas: [0.1, 20] };
const LIST = ['products', 'creative'];

async function owner() {
  const g = await adsHubGuard();
  if (g.error) return g;
  if (!g.isOwner) return { error: NextResponse.json({ success: false, error: 'HQ sahaja.' }, { status: 403 }) };
  return g;
}

const bad = msg => NextResponse.json({ success: false, error: msg }, { status: 400 });

function clean(b, partial) {
  const row = {};
  if (!partial || 'name' in b) {
    const name = String(b.name || '').trim().slice(0, 80);
    if (!name) throw Object.assign(new Error('Nama templat diperlukan.'), { status: 400 });
    row.name = name;
  }
  if ('description' in b) row.description = b.description ? String(b.description).trim().slice(0, 300) : null;
  if ('sop' in b) row.sop = String(b.sop || '').slice(0, 20000);
  if ('params' in b) {
    const p = b.params || {};
    const out = {};
    for (const [k, [min, max]] of Object.entries(NUM)) {
      if (p[k] === '' || p[k] == null) continue;
      const v = Number(p[k]);
      if (!(v >= min && v <= max)) throw Object.assign(new Error(`${k} mesti antara ${min} dan ${max}.`), { status: 400 });
      out[k] = v;
    }
    for (const k of LIST) {
      const arr = Array.isArray(p[k]) ? p[k] : String(p[k] || '').split(',');
      const v = arr.map(x => String(x).trim()).filter(Boolean).slice(0, 20);
      if (v.length) out[k] = v;
    }
    if (p.structure) out.structure = ['autopilot', '1-1-1'].includes(p.structure) ? p.structure : 'autopilot';
    row.params = out;
  }
  return row;
}

export async function GET() {
  const g = await owner();
  if (g.error) return g.error;
  const { data, error } = await g.admin.from('autopilot_strategies').select('*').order('name');
  if (error) return NextResponse.json({ success: false, error: missing(error) ? MISSING : error.message }, { status: 500 });
  const { data: used } = await g.admin.from('meta_connections').select('autopilot_strategy_id').not('autopilot_strategy_id', 'is', null);
  const count = {};
  for (const r of used || []) count[r.autopilot_strategy_id] = (count[r.autopilot_strategy_id] || 0) + 1;
  return NextResponse.json({ success: true, strategies: (data || []).map(s => ({ ...s, accounts: count[s.id] || 0 })) });
}

export async function POST(req) {
  const g = await owner();
  if (g.error) return g.error;
  try {
    const row = clean(await req.json(), false);
    const { data, error } = await g.admin.from('autopilot_strategies').insert({ sop: '', params: {}, ...row, created_by: g.user.id }).select('*').single();
    if (error) throw error;
    return NextResponse.json({ success: true, strategy: data });
  } catch (e) {
    if (e.status === 400) return bad(e.message);
    if (/duplicate|unique/i.test(e.message)) return bad('Nama templat dah wujud.');
    return missing(e) ? NextResponse.json({ success: false, error: MISSING }, { status: 500 }) : fail(e);
  }
}

export async function PATCH(req) {
  const g = await owner();
  if (g.error) return g.error;
  const id = Number(new URL(req.url).searchParams.get('id'));
  if (!id) return bad('id diperlukan.');
  try {
    const row = clean(await req.json(), true);
    const { data, error } = await g.admin.from('autopilot_strategies').update({ ...row, updated_at: new Date().toISOString() }).eq('id', id).select('*').single();
    if (error) throw error;
    return NextResponse.json({ success: true, strategy: data });
  } catch (e) {
    if (e.status === 400) return bad(e.message);
    if (/duplicate|unique/i.test(e.message)) return bad('Nama templat dah wujud.');
    return fail(e);
  }
}

export async function DELETE(req) {
  const g = await owner();
  if (g.error) return g.error;
  const id = Number(new URL(req.url).searchParams.get('id'));
  if (!id) return bad('id diperlukan.');
  // Akaun yang guna templat ini kembali tanpa templat (FK ON DELETE SET NULL); had akaun tidak berubah
  const { error } = await g.admin.from('autopilot_strategies').delete().eq('id', id);
  if (error) return fail(error);
  return NextResponse.json({ success: true });
}

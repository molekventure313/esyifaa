import { NextResponse } from 'next/server';
import { adsHubGuard, writeTarget, fail } from '@/lib/ads-hub/guard';
import { cleanStrategy, listForAccount, useTemplate, updateOwn, deleteOwn, missing044 } from '@/lib/ads-hub/strategies';

// Templat strategi autopilot.
// HQ (super_admin): urus templat HQ (SOP + had siap untuk mana-mana akaun Ads Hub).
//   GET senarai (dengan bilangan akaun yang guna) · POST cipta · PATCH ?id= ubah · DELETE ?id= padam.
// Marketer / fighter (macam peraturan): guna templat HQ → disalin jadi versi sendiri yang boleh diedit.
//   GET templat HQ + versi sendiri · POST { template_id, reset? } · PATCH ?id= versi sendiri · DELETE ?id= versi sendiri.
export const dynamic = 'force-dynamic';

const MISSING = 'Run migration 039 dalam Supabase dulu.';
const missing = e => /autopilot_strateg/.test(e?.message || '');

const bad = msg => NextResponse.json({ success: false, error: msg }, { status: 400 });
const clean = (b, partial) => cleanStrategy(b, { partial, hq: true });
// Ralat dari lib strategies (ada status 400/403/404/500) → JSON
const libFail = e => (e.status ? NextResponse.json({ success: false, error: e.message }, { status: e.status }) : fail(e));

// Akaun pemilik (marketer / fighter → diri sendiri)
async function account(g, req) {
  const t = await writeTarget(g, req);
  if (t.error) return t;
  return { ...g, mid: t.id };
}

export async function GET(req) {
  const g = await adsHubGuard();
  if (g.error) return g.error;
  if (!g.isOwner) {
    const a = await account(g, req);
    if (a.error) return a.error;
    try { return NextResponse.json({ success: true, ...(await listForAccount(a.admin, a.mid, { full: true })) }); } catch (e) { return libFail(e); }
  }
  // Panel HQ: templat HQ sahaja (versi sendiri akaun tidak disenaraikan di sini)
  let { data, error } = await g.admin.from('autopilot_strategies').select('*').is('owner_id', null).order('name');
  if (error && missing044(error)) ({ data, error } = await g.admin.from('autopilot_strategies').select('*').order('name'));
  if (error) return NextResponse.json({ success: false, error: missing(error) ? MISSING : error.message }, { status: 500 });
  const { data: used } = await g.admin.from('meta_connections').select('autopilot_strategy_id').not('autopilot_strategy_id', 'is', null);
  const count = {};
  for (const r of used || []) count[r.autopilot_strategy_id] = (count[r.autopilot_strategy_id] || 0) + 1;
  return NextResponse.json({ success: true, strategies: (data || []).map(s => ({ ...s, accounts: count[s.id] || 0 })) });
}

export async function POST(req) {
  const g = await adsHubGuard();
  if (g.error) return g.error;
  if (!g.isOwner) {
    const a = await account(g, req);
    if (a.error) return a.error;
    try { return NextResponse.json({ success: true, ...(await useTemplate(a.admin, a.mid, a.user.id, await req.json())) }); } catch (e) { return libFail(e); }
  }
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
  const g = await adsHubGuard();
  if (g.error) return g.error;
  const id = Number(new URL(req.url).searchParams.get('id'));
  if (!id) return bad('id diperlukan.');
  if (!g.isOwner) {
    const a = await account(g, req);
    if (a.error) return a.error;
    // Fighter (penjual bebas) boleh ubah had launch sehari dalam versi sendiri; marketer tidak
    try { return NextResponse.json({ success: true, ...(await updateOwn(a.admin, a.mid, a.user.id, { ...(await req.json()), strategy_id: id }, { hq: !!g.isFighter })) }); } catch (e) { return libFail(e); }
  }
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
  const g = await adsHubGuard();
  if (g.error) return g.error;
  const id = Number(new URL(req.url).searchParams.get('id'));
  if (!id) return bad('id diperlukan.');
  if (!g.isOwner) {
    const a = await account(g, req);
    if (a.error) return a.error;
    try { return NextResponse.json({ success: true, ...(await deleteOwn(a.admin, a.mid, a.user.id, id)) }); } catch (e) { return libFail(e); }
  }
  // Akaun yang guna templat ini kembali tanpa templat (FK ON DELETE SET NULL); had akaun tidak berubah
  const { error } = await g.admin.from('autopilot_strategies').delete().eq('id', id);
  if (error) return fail(error);
  return NextResponse.json({ success: true });
}

// Ads Hub — kawalan akses (server sahaja).
// Marketer (bukan teamsale) urus sambungan & data sendiri. super_admin urus mana-mana marketer (?marketer=<id>)
// dan akaun Meta HQ sendiri (disimpan di bawah id profil super_admin; order dipadan = order HQ).
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const err = (msg, status) => ({ error: NextResponse.json({ success: false, error: msg }, { status }) });

export async function adsHubGuard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return err('Unauthorized', 401);
  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles')
    .select('id, role, full_name, team_leader_id, is_active').eq('id', user.id).single();
  if (profile?.role === 'super_admin') return { user, profile, admin, isOwner: true };
  // Fighter (penjual bebas) — akaun Meta & data sendiri; laporan dari fighter_orders (lib/ads-hub/fighter.js)
  if (profile?.role === 'independent') {
    if (profile.is_active === false) return err('Akaun tidak aktif.', 403);
    return { user, profile, admin, isOwner: false, isFighter: true };
  }
  if (profile?.role !== 'marketer') return err('Forbidden', 403);
  if (profile.team_leader_id) return err('Ads Hub diurus oleh ketua team.', 403);
  if (profile.is_active === false) return err('Akaun tidak aktif.', 403);
  return { user, profile, admin, isOwner: false };
}

// Marketer sasaran: super_admin beri ?marketer=<id> (tanpa = akaun HQ sendiri); marketer sentiasa diri sendiri
export function targetMarketer(g, requested) {
  if (!g.isOwner) return { id: g.user.id };
  return { id: requested || g.user.id };
}

// Sasaran tulis: marketer → diri sendiri; super_admin → ?marketer=<id> (marketer utama) atau akaun HQ sendiri.
// Pulangkan { id, profile } atau { error }.
export async function writeTarget(g, req) {
  const requested = req ? new URL(req.url).searchParams.get('marketer') : null;
  if (!g.isOwner || !requested || requested === g.user.id) return { id: g.user.id, profile: g.profile };
  const { data: p } = await g.admin.from('profiles').select('id, role, full_name, team_leader_id, is_ai_agent').eq('id', requested).maybeSingle();
  if (p?.role !== 'marketer' || p.team_leader_id) return err('Marketer tidak sah.', 400);
  return { id: p.id, profile: p };
}

// Route tindakan/chat: sambungan sasaran (lihat writeTarget), dengan token + had.
// g.mid = marketer pemilik akaun; g.user.id = pelaku (untuk log).
export async function marketerConn(req) {
  const g = await adsHubGuard();
  if (g.error) return g;
  const t = await writeTarget(g, req);
  if (t.error) return t;
  const { data: conn, error } = await g.admin.from('meta_connections').select('*').eq('marketer_id', t.id).maybeSingle();
  if (error) return err(tableMissing(error) ? MIGRATION_MSG : error.message, 500);
  if (!conn) return err('Sambung akaun Meta dulu di tab Tetapan.', 400);
  return { ...g, conn, mid: t.id, targetProfile: t.profile };
}

// Ralat → respons JSON (status dari ralat jika ada)
export const fail = e => NextResponse.json({ success: false, error: e.message }, { status: e.status || 500 });

// Ralat jadual tiada → mesej jelas untuk run migration
export const tableMissing = e => /(meta_|ads_chat_)\w+|limit_max_budget|report_enabled|auto_ads_spend|default_product|is_ai_agent/.test(e?.message || '') && /exist|schema cache|column/i.test(e.message);
export const MIGRATION_MSG = 'Jadual Ads Hub belum lengkap — run migration 025, 026 & 030 dalam Supabase.';

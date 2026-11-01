// Ads Hub — kawalan akses (server sahaja).
// Marketer (bukan teamsale) urus sambungan & lihat data sendiri. super_admin lihat data mana-mana marketer.
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
  if (profile?.role !== 'marketer') return err('Forbidden', 403);
  if (profile.team_leader_id) return err('Ads Hub diurus oleh ketua team.', 403);
  if (profile.is_active === false) return err('Akaun tidak aktif.', 403);
  return { user, profile, admin, isOwner: false };
}

// Marketer sasaran: super_admin mesti beri ?marketer=<id>; marketer sentiasa diri sendiri
export function targetMarketer(g, requested) {
  if (!g.isOwner) return { id: g.user.id };
  if (!requested) return err('Pilih marketer.', 400);
  return { id: requested };
}

// Route tindakan/chat: marketer sendiri sahaja, dengan sambungan penuh (token disulitkan + had)
export async function marketerConn() {
  const g = await adsHubGuard();
  if (g.error) return g;
  if (g.isOwner) return err('Hanya marketer boleh buat perubahan pada akaun Meta sendiri.', 403);
  const { data: conn, error } = await g.admin.from('meta_connections').select('*').eq('marketer_id', g.user.id).maybeSingle();
  if (error) return err(tableMissing(error) ? MIGRATION_MSG : error.message, 500);
  if (!conn) return err('Sambung akaun Meta dulu di tab Tetapan.', 400);
  return { ...g, conn };
}

// Ralat → respons JSON (status dari ralat jika ada)
export const fail = e => NextResponse.json({ success: false, error: e.message }, { status: e.status || 500 });

// Ralat jadual tiada → mesej jelas untuk run migration
export const tableMissing = e => /(meta_|ads_chat_)\w+|limit_max_budget|report_enabled/.test(e?.message || '') && /exist|schema cache|column/i.test(e.message);
export const MIGRATION_MSG = 'Jadual Ads Hub belum lengkap — run migration 025 & 026 dalam Supabase.';

// SP Generator — server sahaja: akses, kuota AI & panggilan Claude (Anthropic API).
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const AI_MODEL_MAIN = 'claude-sonnet-5-5';     // jana brief & section
export const AI_MODEL_FAST = 'claude-haiku-5-5';      // tulis semula satu section
export const QUOTA_FULL = 10;                         // jana penuh sebulan / marketer
export const QUOTA_CALLS = 300;                       // jumlah panggilan AI (section + tulis semula) sebulan / marketer

const err = (msg, status) => ({ error: NextResponse.json({ success: false, error: msg }, { status }) });

/**
 * Akses SP Generator: marketer (bukan teamsale) & super_admin.
 * Pulangkan { user, profile, admin, isOwner } atau { error }.
 */
export async function spGuard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return err('Unauthorized', 401);
  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles')
    .select('id, role, full_name, marketer_code, team_leader_id, is_active').eq('id', user.id).single();
  if (profile?.role === 'super_admin') return { user, profile, admin, isOwner: true };
  if (profile?.role !== 'marketer') return err('Forbidden', 403);
  if (profile.team_leader_id) return err('Teamsale tidak boleh bina SP sendiri — guna SP ketua.', 403);
  if (profile.is_active === false) return err('Akaun tidak aktif.', 403);
  return { user, profile, admin, isOwner: false };
}

// SP yang boleh diakses: milik sendiri (super_admin: semua)
export async function loadOwnSp(g, id) {
  const { data: sp, error } = await g.admin.from('ai_salespages').select('*').eq('id', id).maybeSingle();
  if (error) return err(`Jadual SP Generator belum wujud — run migration 022. (${error.message})`, 500);
  if (!sp || (!g.isOwner && sp.owner_id !== g.user.id)) return err('SP tidak dijumpai.', 404);
  return { sp };
}

const monthStartISO = () => {
  const myt = new Date(Date.now() + 8 * 3600 * 1000);
  return new Date(`${myt.toISOString().slice(0, 7)}-01T00:00:00+08:00`).toISOString();
};

export async function usageThisMonth(admin, userId) {
  const { data } = await admin.from('ai_generation_logs')
    .select('kind').eq('user_id', userId).gte('created_at', monthStartISO());
  const rows = data || [];
  return { full: rows.filter(r => r.kind === 'brief').length, calls: rows.filter(r => r.kind !== 'brief').length };
}

export async function quotaInfo(g) {
  const used = await usageThisMonth(g.admin, g.user.id);
  return {
    unlimited: g.isOwner,
    full: { used: used.full, max: QUOTA_FULL },
    calls: { used: used.calls, max: QUOTA_CALLS },
    ai_enabled: !!process.env.ANTHROPIC_API_KEY,
  };
}

/**
 * Panggil Claude dengan output berstruktur (tool use dipaksa) → pulangkan { data, usage, model }.
 */
export async function callClaude({ model = AI_MODEL_MAIN, system, prompt, toolName, schema, maxTokens = 2000 }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw Object.assign(new Error('AI belum diaktifkan — tambah ANTHROPIC_API_KEY di Netlify env.'), { status: 503 });

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: prompt }],
      tools: [{ name: toolName, description: 'Hantar hasil copywriting dalam format berstruktur.', input_schema: schema }],
      tool_choice: { type: 'tool', name: toolName },
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.error?.message || `HTTP ${res.status}`;
    throw Object.assign(new Error(`AI gagal: ${msg}`), { status: res.status === 429 || res.status === 529 ? 503 : 502 });
  }
  const block = (json.content || []).find(b => b.type === 'tool_use');
  if (!block?.input) throw Object.assign(new Error('AI tidak pulangkan hasil — cuba lagi.'), { status: 502 });
  return { data: block.input, usage: json.usage || {}, model };
}

export async function logAi(admin, { userId, spId, kind, model, usage }) {
  await admin.from('ai_generation_logs').insert({
    user_id: userId, salespage_id: spId, kind, model,
    input_tokens: usage?.input_tokens ?? null, output_tokens: usage?.output_tokens ?? null,
  });
}

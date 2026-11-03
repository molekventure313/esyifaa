import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { adsHubGuard, tableMissing, MIGRATION_MSG } from '@/lib/ads-hub/guard';

// super_admin: cipta ejen AI marketer — profil marketer biasa (kod SP sendiri) bertanda is_ai_agent.
// Tiada login (akaun auth disekat, kata laluan rawak tidak disimpan), gaji & komisen 0.
// Body: { name, code }
export const dynamic = 'force-dynamic';

const bad = (msg, status = 400) => NextResponse.json({ success: false, error: msg }, { status });

export async function POST(req) {
  const g = await adsHubGuard();
  if (g.error) return g.error;
  if (!g.isOwner) return bad('Forbidden', 403);

  const body = await req.json().catch(() => ({}));
  const name = String(body.name || '').trim().slice(0, 60);
  const code = String(body.code || '').trim().toLowerCase();
  if (!name) return bad('Isi nama ejen.');
  if (!/^[a-z0-9-]{2,20}$/.test(code)) return bad('Kod hanya huruf kecil, nombor dan sengkang (2–20 aksara).');

  const { data: taken, error: takenErr } = await g.admin.from('profiles').select('id').ilike('marketer_code', code).maybeSingle();
  if (takenErr) return bad(takenErr.message, 500);
  if (taken) return bad('Kod itu telah digunakan.');

  const { data: auth, error: authErr } = await g.admin.auth.admin.createUser({
    email: `${code}@ai-agent.invalid`,
    password: randomBytes(24).toString('base64url'),
    email_confirm: true,
    ban_duration: '876000h',
    user_metadata: { full_name: name, role: 'marketer' },
  });
  if (authErr) return bad(`Gagal cipta akaun ejen: ${authErr.message}`, 500);

  const id = auth.user.id;
  const { error } = await g.admin.from('profiles').upsert({
    id, full_name: name, email: auth.user.email, role: 'marketer', is_active: true,
    marketer_code: code, is_ai_agent: true, marketer_basic_salary: 0, marketer_commission_pct: 0,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });
  if (error) {
    await g.admin.auth.admin.deleteUser(id).catch(() => {});
    return bad(tableMissing(error) ? MIGRATION_MSG : error.message, 500);
  }
  return NextResponse.json({ success: true, agent: { id, name, code } });
}

// Maklumat ejen (kod & pixel) — ejen tiada login, jadi super_admin isi pixel di sini. ?marketer=<id ejen>
async function loadAgent(g, req) {
  const id = new URL(req.url).searchParams.get('marketer');
  const { data, error } = await g.admin.from('profiles')
    .select('id, full_name, marketer_code, meta_pixel_id, meta_access_token, is_ai_agent').eq('id', id || '').maybeSingle();
  if (error) return { error: bad(tableMissing(error) ? MIGRATION_MSG : error.message, 500) };
  if (!data?.is_ai_agent) return { error: bad('Ejen tidak dijumpai.', 404) };
  return { agent: data };
}
const view = a => ({
  id: a.id, name: a.full_name, code: a.marketer_code,
  meta_pixel_id: a.meta_pixel_id || '', has_capi_token: !!a.meta_access_token,
});

export async function GET(req) {
  const g = await adsHubGuard();
  if (g.error) return g.error;
  if (!g.isOwner) return bad('Forbidden', 403);
  const r = await loadAgent(g, req);
  if (r.error) return r.error;
  return NextResponse.json({ success: true, agent: view(r.agent) });
}

// Body: { meta_pixel_id?, meta_access_token? } — token kosong = kekalkan; '-' = buang
export async function PATCH(req) {
  const g = await adsHubGuard();
  if (g.error) return g.error;
  if (!g.isOwner) return bad('Forbidden', 403);
  const r = await loadAgent(g, req);
  if (r.error) return r.error;
  const body = await req.json().catch(() => ({}));
  const upd = {};
  if (body.meta_pixel_id !== undefined) {
    const px = String(body.meta_pixel_id || '').trim();
    if (px && !/^\d{6,20}$/.test(px)) return bad('Pixel ID mesti nombor sahaja.');
    upd.meta_pixel_id = px || null;
  }
  const tok = String(body.meta_access_token || '').trim();
  if (tok === '-') upd.meta_access_token = null;
  else if (tok) upd.meta_access_token = tok;
  if (!Object.keys(upd).length) return bad('Tiada perubahan.');
  const { data, error } = await g.admin.from('profiles').update({ ...upd, updated_at: new Date().toISOString() })
    .eq('id', r.agent.id).select('id, full_name, marketer_code, meta_pixel_id, meta_access_token, is_ai_agent').single();
  if (error) return bad(error.message, 500);
  return NextResponse.json({ success: true, agent: view(data) });
}

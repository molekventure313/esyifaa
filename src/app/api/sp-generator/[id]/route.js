import { NextResponse } from 'next/server';
import { spGuard, loadOwnSp, quotaInfo } from '@/lib/sp-generator/server';
import { SLUG_RE, sanitizeContent, cleanAngle } from '@/lib/sp-generator/schema';

// SP Generator — satu SP
// GET    → SP + kuota
// PATCH  { content?, title?, slug?, angle? } → simpan draf
// POST   { action: 'publish' | 'unpublish' | 'revert' }
//          publish  = salin draf → versi awam
//          revert   = buang perubahan draf, kembali ke versi yang dipublish
// DELETE → padam SP

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cvygzimtwhezxulvydrn.supabase.co';  // sama dgn createAdminClient
const ok = body => NextResponse.json({ success: true, ...body });
const bad = (error, status = 400) => NextResponse.json({ success: false, error }, { status });

export async function GET(req, { params }) {
  const g = await spGuard();
  if (g.error) return g.error;
  const { id } = await params;
  const r = await loadOwnSp(g, id);
  if (r.error) return r.error;
  return ok({ data: r.sp, quota: await quotaInfo(g), is_owner: g.isOwner });
}

export async function PATCH(req, { params }) {
  const g = await spGuard();
  if (g.error) return g.error;
  const { id } = await params;
  const r = await loadOwnSp(g, id);
  if (r.error) return r.error;
  try {
    const body = await req.json();
    const patch = { updated_at: new Date().toISOString() };
    if (body.content !== undefined) patch.content = sanitizeContent(body.content, SUPABASE_URL);
    if (body.angle !== undefined) patch.angle = cleanAngle(body.angle);
    if (body.title !== undefined) {
      const t = String(body.title || '').trim().slice(0, 100);
      if (!t) return bad('Nama SP tidak boleh kosong.');
      patch.title = t;
    }
    if (body.slug !== undefined) {
      const s = String(body.slug || '').trim().toLowerCase();
      if (!SLUG_RE.test(s)) return bad('Link tidak sah — guna huruf kecil, nombor & sengkang (3-50 aksara).');
      patch.slug = s;
    }
    const { data, error } = await g.admin.from('ai_salespages').update(patch).eq('id', id).select('*').single();
    if (error) {
      if (error.code === '23505') return bad(`Link /s/${patch.slug} sudah digunakan — pilih link lain.`, 409);
      throw error;
    }
    return ok({ data });
  } catch (e) {
    return bad(e.message, 500);
  }
}

export async function POST(req, { params }) {
  const g = await spGuard();
  if (g.error) return g.error;
  const { id } = await params;
  const r = await loadOwnSp(g, id);
  if (r.error) return r.error;
  try {
    const { action } = await req.json();
    const now = new Date().toISOString();
    let patch;
    if (action === 'publish') {
      patch = { published_content: sanitizeContent(r.sp.content, SUPABASE_URL), status: 'published', published_at: now, updated_at: now };
    } else if (action === 'unpublish') {
      patch = { status: 'unpublished', updated_at: now };
    } else if (action === 'revert') {
      if (!r.sp.published_content) return bad('SP belum pernah dipublish.');
      patch = { content: r.sp.published_content, updated_at: now };
    } else {
      return bad('Tindakan tidak sah.');
    }
    const { data, error } = await g.admin.from('ai_salespages').update(patch).eq('id', id).select('*').single();
    if (error) throw error;
    return ok({ data });
  } catch (e) {
    return bad(e.message, 500);
  }
}

export async function DELETE(req, { params }) {
  const g = await spGuard();
  if (g.error) return g.error;
  const { id } = await params;
  const r = await loadOwnSp(g, id);
  if (r.error) return r.error;
  const { error } = await g.admin.from('ai_salespages').delete().eq('id', id);
  if (error) return bad(error.message, 500);
  return ok({});
}

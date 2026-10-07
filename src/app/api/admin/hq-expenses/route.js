import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
// Akses: super_admin sahaja — role 'admin' ialah staff order (lihat src/lib/auth.js)

// Perbelanjaan HQ — komitmen tetap bulanan ('fixed') & belanja sekali ('one_off') untuk tab Report HQ

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
  if (!['super_admin'].includes(profile?.role)) throw new Error('Forbidden');
  return { admin, user };
}

const fail = err => NextResponse.json(
  { success: false, error: err.message },
  { status: err.message === 'Unauthorized' ? 401 : err.message === 'Forbidden' ? 403 : 400 },
);

const MONTH_RE = /^\d{4}-\d{2}$/;
const CATEGORIES = ['sewa', 'bil', 'langganan', 'gaji', 'lain'];

// Bersihkan input → payload jadual (hanya medan yang dihantar)
function clean(body) {
  const out = {};
  if (body.name !== undefined) {
    out.name = String(body.name || '').trim().slice(0, 120);
    if (!out.name) throw new Error('Nama perbelanjaan diperlukan');
  }
  if (body.amount !== undefined) {
    const amt = parseFloat(body.amount);
    if (!(amt >= 0)) throw new Error('Jumlah tidak sah');
    out.amount = Math.round(amt * 100) / 100;
  }
  if (body.category !== undefined) out.category = CATEGORIES.includes(body.category) ? body.category : 'lain';
  if (body.type !== undefined) {
    if (!['fixed', 'one_off'].includes(body.type)) throw new Error('Jenis tidak sah');
    out.type = body.type;
  }
  for (const k of ['month', 'start_month', 'end_month']) {
    if (body[k] !== undefined) {
      if (body[k] && !MONTH_RE.test(body[k])) throw new Error(`Format bulan tidak sah (${k})`);
      out[k] = body[k] || null;
    }
  }
  if (body.is_active !== undefined) out.is_active = !!body.is_active;
  if (body.notes !== undefined) out.notes = String(body.notes || '').trim().slice(0, 300) || null;
  return out;
}

export async function GET() {
  try {
    const { admin } = await requireAdmin();
    const { data, error } = await admin.from('hq_expenses').select('*').order('type').order('amount', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) { return fail(err); }
}

export async function POST(req) {
  try {
    const { admin, user } = await requireAdmin();
    const body = await req.json();
    const row = clean({ category: 'lain', type: 'fixed', ...body });
    if (!row.name) throw new Error('Nama perbelanjaan diperlukan');
    if (row.amount === undefined) throw new Error('Jumlah diperlukan');
    if (row.type === 'one_off' && !row.month) throw new Error('Bulan diperlukan untuk belanja sekali');
    const { data, error } = await admin.from('hq_expenses').insert({ ...row, created_by: user.id }).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) { return fail(err); }
}

export async function PATCH(req) {
  try {
    const { admin } = await requireAdmin();
    const body = await req.json();
    if (!body.id) throw new Error('ID diperlukan');
    const { data, error } = await admin.from('hq_expenses')
      .update({ ...clean(body), updated_at: new Date().toISOString() })
      .eq('id', body.id).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err) { return fail(err); }
}

export async function DELETE(req) {
  try {
    const { admin } = await requireAdmin();
    const id = new URL(req.url).searchParams.get('id');
    if (!id) throw new Error('ID diperlukan');
    const { error } = await admin.from('hq_expenses').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) { return fail(err); }
}

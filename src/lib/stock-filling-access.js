// Akses Pengisian Stok untuk perawat — server sahaja.
// Senarai id pengguna (perawat) yang dibenarkan membuat bacaan pengisian disimpan dalam jadual `settings`
// (key 'stock_filling_readers', value = JSON array id). Pembaca boleh LIHAT gambar & TANDA SELESAI sahaja.
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { STAFF, OWNER } from '@/lib/roles';

const KEY = 'stock_filling_readers';

export async function getReaders(admin) {
  const { data } = await admin.from('settings').select('value').eq('key', KEY).maybeSingle();
  const v = data?.value;
  try {
    const arr = Array.isArray(v) ? v : JSON.parse(v || '[]');
    return Array.isArray(arr) ? arr.filter(x => typeof x === 'string') : [];
  } catch { return []; }
}

export async function setReader(admin, userId, on) {
  const cur = new Set(await getReaders(admin));
  if (on) cur.add(userId); else cur.delete(userId);
  const { error } = await admin.from('settings').upsert({ key: KEY, value: JSON.stringify([...cur]) }, { onConflict: 'key' });
  if (error) throw error;
  return [...cur];
}

/**
 * Semak pemanggil API Pengisian Stok. Pulangkan { user, role, admin, isStaff, isOwner, isReader } atau { error }.
 *   staff (admin/super_admin) → upload, lihat, padam (ikut peraturan)
 *   super_admin & pembaca     → tanda selesai
 */
export async function guardStockFilling({ needMark = false, needStaff = false } = {}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('id, role, is_active').eq('id', user.id).single();
  const role = profile?.role;
  const isStaff = STAFF.includes(role);
  const isOwner = OWNER.includes(role);
  const isReader = !isStaff && profile?.is_active !== false && (await getReaders(admin)).includes(user.id);

  const forbidden = { error: NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 }) };
  if (!isStaff && !isReader) return forbidden;
  if (needStaff && !isStaff) return forbidden;
  if (needMark && !isOwner && !isReader) return forbidden;
  return { user, role, admin, isStaff, isOwner, isReader };
}

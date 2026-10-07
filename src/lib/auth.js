// Semakan role untuk API (server sahaja). Senarai role & laluan: src/lib/roles.js
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export { OWNER, STAFF, STAFF_PATHS, STAFF_HOME } from '@/lib/roles';

/**
 * Semak pemanggil API. Pulangkan { user, role, profile, admin } atau { error: NextResponse }.
 * @param roles  senarai role dibenarkan (OWNER / STAFF)
 */
export async function guard(roles) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('id, role, full_name').eq('id', user.id).single();
  if (!roles.includes(profile?.role)) return { error: NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 }) };
  return { user, role: profile.role, profile, admin };
}

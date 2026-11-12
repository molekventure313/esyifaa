import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { APP_ROLES, signDeviceToken } from '@/lib/app-device';

// App Android memanggil ini (dalam WebView, guna sesi login) untuk dapat token peranti
// yang dipakai servis latar belakang untuk semak order baru.
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('role, full_name').eq('id', user.id).single();
  if (!APP_ROLES.includes(profile?.role)) {
    return NextResponse.json({ success: false, error: 'Role ini tiada notifikasi order' }, { status: 403 });
  }
  return NextResponse.json({
    success: true,
    token: signDeviceToken(user.id),
    role: profile.role,
    name: profile.full_name || '',
  });
}

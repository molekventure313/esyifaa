import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
// Akses: super_admin sahaja — role 'admin' ialah staff order (lihat src/lib/auth.js)

export async function GET(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (!['super_admin'].includes(profile.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;

    let query = supabase.from('customers').select('*', { count: 'exact' });

    const search = searchParams.get('search');
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const is_repeat = searchParams.get('is_repeat');
    if (is_repeat !== null) query = query.eq('is_repeat', is_repeat === 'true');

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: customers, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data: customers, meta: { total: count, page, limit } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

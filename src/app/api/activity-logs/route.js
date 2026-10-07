import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
// Akses: super_admin sahaja — role 'admin' ialah staff order (lihat src/lib/auth.js)

export async function GET(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!['super_admin'].includes(profile.role)) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');
    const action_type = searchParams.get('action_type');
    const entity_type = searchParams.get('entity_type');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const offset = (page - 1) * limit;

    let query = supabase.from('activity_logs').select(`
      *,
      profiles:user_id(full_name)
    `, { count: 'exact' });

    if (user_id) query = query.eq('user_id', user_id);
    if (action_type) query = query.eq('action_type', action_type);
    if (entity_type) query = query.eq('entity_type', entity_type);

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;
    
    return NextResponse.json({ success: true, data, meta: { total: count, page, limit } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

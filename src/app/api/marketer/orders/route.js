import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'marketer') {
       return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'all';
    const status = searchParams.get('status') || 'all';

    const nowUTC = new Date();
    const myNow = new Date(nowUTC.getTime() + 8 * 60 * 60 * 1000);
    const todayStr = myNow.toISOString().split('T')[0];

    let dateFrom = null;
    let dateTo = null;
    if (period === 'today') {
      dateFrom = `${todayStr}T00:00:00+08:00`;
    } else if (period === 'yesterday') {
      const yest = new Date(myNow);
      yest.setUTCDate(myNow.getUTCDate() - 1);
      const yStr = yest.toISOString().split('T')[0];
      dateFrom = `${yStr}T00:00:00+08:00`;
      dateTo = `${yStr}T23:59:59+08:00`;
    } else if (period === 'week') {
      const dow = myNow.getUTCDay();
      const startOfWeek = new Date(myNow);
      startOfWeek.setUTCDate(myNow.getUTCDate() - dow);
      dateFrom = `${startOfWeek.toISOString().split('T')[0]}T00:00:00+08:00`;
    } else if (period === 'month') {
      dateFrom = `${myNow.getUTCFullYear()}-${String(myNow.getUTCMonth() + 1).padStart(2, '0')}-01T00:00:00+08:00`;
    }

    let query = adminClient.from('submissions').select('*').eq('marketer_id', user.id).order('created_at', { ascending: false });

    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo) query = query.lte('created_at', dateTo);
    if (status !== 'all') query = query.eq('payment_status', status);

    const { data: orders, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

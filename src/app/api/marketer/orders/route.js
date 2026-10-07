import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseAmount } from '@/lib/marketer-calc';
import { formatOrder } from '@/lib/orders';
import { ownerScope } from '@/lib/team';

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
    const owner  = searchParams.get('owner') || 'all';   // ketua: all | self | team

    const nowUTC = new Date();
    const myNow = new Date(nowUTC.getTime() + 8 * 60 * 60 * 1000);
    const todayStr = myNow.toISOString().split('T')[0];

    let dateFrom = null;
    let dateTo = null;
    if (period === 'today') {
      dateFrom = `${todayStr}T00:00:00+08:00`;
      dateTo = `${todayStr}T23:59:59+08:00`;
    } else if (period === 'yesterday') {
      const yest = new Date(myNow);
      yest.setUTCDate(myNow.getUTCDate() - 1);
      const yStr = yest.toISOString().split('T')[0];
      dateFrom = `${yStr}T00:00:00+08:00`;
      dateTo = `${yStr}T23:59:59+08:00`;
    } else if (period === 'week') {
      // Last 7 days — konsisten dgn dashboard stats
      const wStr = new Date(myNow.getTime() - 6 * 86400000).toISOString().split('T')[0];
      dateFrom = `${wStr}T00:00:00+08:00`;
      dateTo = `${todayStr}T23:59:59+08:00`;
    } else if (period === 'month') {
      dateFrom = `${myNow.getUTCFullYear()}-${String(myNow.getUTCMonth() + 1).padStart(2, '0')}-01T00:00:00+08:00`;
    }

    // Ketua: order sendiri + teamsale (lihat sahaja — padam / tanda bayar hanya order sendiri)
    const scope = await ownerScope(adminClient, user.id);
    const ownerIds = owner === 'self' ? [user.id]
      : owner === 'team' ? scope.ids.filter(id => id !== user.id)
      : scope.ids;
    if (!ownerIds.length) return NextResponse.json({ success: true, data: [], stats: {}, has_team: scope.team.length > 0 });

    // Order FPX/COD marketer sendiri (sama skop dgn Pengurusan Order admin)
    let query = adminClient
      .from('submissions')
      .select('id, full_name, phone, address, problem, notes, source, qty, payment_type, payment_status, chip_bill_id, amount_paid, ninjavan_exported_at, returned_at, marketer_id, order_channel, order_origin, created_at')
      .in('marketer_id', ownerIds)
      .in('payment_type', ['fpx_payment', 'cod'])
      .order('created_at', { ascending: false });

    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo) query = query.lte('created_at', dateTo);

    const { data: orders, error } = await query;
    if (error) throw error;

    // Format sama dgn admin: label produk (pakej + add-on), alamat, amaun
    const all = (orders || []).map(o => ({
      ...formatOrder(o), amount: parseAmount(o),
      is_team: o.marketer_id !== user.id,
      owner_name: o.marketer_id !== user.id ? scope.names[o.marketer_id] : null,
    }));

    // Ringkasan untuk tempoh dipilih (tanpa tapis status)
    const completed = all.filter(o => o.payment_status === 'completed');
    const stats = {
      total_completed: completed.length,
      total_pending:   all.filter(o => o.payment_status === 'pending').length,
      total_failed:    all.filter(o => o.payment_status === 'failed').length,
      total_cod:       all.filter(o => o.payment_type === 'cod').length,
      total_fpx:       all.filter(o => o.payment_type === 'fpx_payment').length,
      total_revenue_rm: parseFloat(completed.filter(o => !o.returned_at).reduce((t, o) => t + o.amount, 0).toFixed(2)),   // order return tiada revenue
    };

    const data = status === 'all' ? all : all.filter(o => o.payment_status === status);
    return NextResponse.json({ success: true, data, stats, has_team: scope.team.length > 0 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

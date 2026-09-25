import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { upsertDailyAds } from '@/lib/products';

// Helper: get date range based on period
function getDateRange(period) {
  const now = new Date();
  // Malaysia timezone offset (UTC+8)
  const myNow = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const today = myNow.toISOString().split('T')[0];

  if (period === 'today') {
    return { from: today, to: today };
  }
  if (period === 'yesterday') {
    const yesterday = new Date(myNow);
    yesterday.setUTCDate(myNow.getUTCDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];
    return { from: yStr, to: yStr };
  }
  if (period === 'week') {
    const dayOfWeek = myNow.getUTCDay(); // 0=Sun
    const startOfWeek = new Date(myNow);
    startOfWeek.setUTCDate(myNow.getUTCDate() - dayOfWeek);
    return { from: startOfWeek.toISOString().split('T')[0], to: today };
  }
  if (period === 'month') {
    const startOfMonth = `${myNow.getUTCFullYear()}-${String(myNow.getUTCMonth() + 1).padStart(2, '0')}-01`;
    return { from: startOfMonth, to: today };
  }
  // 'all' — no date filter
  return { from: null, to: null };
}

export async function GET(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const adminClient = createAdminClient();

    // Only admin/super_admin
    const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
    if (!['admin', 'super_admin'].includes(profile?.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'month';
    const marketer_id = searchParams.get('marketer_id');
    const { from, to } = getDateRange(period);

    // Fetch ads_spend records
    let spendQuery = adminClient
      .from('ads_spend')
      .select('*')
      .order('spend_date', { ascending: false });

    if (from) spendQuery = spendQuery.gte('spend_date', from);
    if (to) spendQuery = spendQuery.lte('spend_date', to);
    if (marketer_id === 'hq') spendQuery = spendQuery.is('marketer_id', null);
    else if (marketer_id) spendQuery = spendQuery.eq('marketer_id', marketer_id);

    const { data: spendRecords, error: spendErr } = await spendQuery;
    if (spendErr) throw spendErr;

    // Fetch all practitioners for name lookup
    const { data: practitioners } = await adminClient
      .from('profiles')
      .select('id, full_name')
      .in('role', ['practitioner', 'perawat']);

    const practMap = {};
    (practitioners || []).forEach(p => { practMap[p.id] = p.full_name; });

    // Fetch treatment price for commission calculation
    const { data: config } = await adminClient.from('tracking_config').select('treatment_price').limit(1).maybeSingle();
    const treatmentPrice = parseFloat(config?.treatment_price || 0);

    // For each spend record, count new leads (non-repeat) and breakdown per practitioner
    const records = await Promise.all((spendRecords || []).map(async (spend) => {
      const dateStart = `${spend.spend_date}T00:00:00+08:00`;
      const dateEnd = `${spend.spend_date}T23:59:59+08:00`;

      // Count new leads for that day — cases joined with customers where is_repeat = false
      const { data: leads } = await adminClient
        .from('cases')
        .select('id, assigned_to, customers!cases_customer_id_fkey(is_repeat)')
        .gte('created_at', dateStart)
        .lte('created_at', dateEnd);

      // Filter only new leads (not repeat)
      const newLeads = (leads || []).filter(c => !c.customers?.is_repeat);
      const totalLeads = newLeads.length;
      const costPerLead = totalLeads > 0 ? spend.amount / totalLeads : 0;

      // Breakdown per practitioner — proportional cost
      const breakdownMap = {};
      newLeads.forEach(c => {
        const pid = c.assigned_to || 'unassigned';
        if (!breakdownMap[pid]) {
          breakdownMap[pid] = {
            practitioner_id: pid,
            practitioner_name: practMap[pid] || (pid === 'unassigned' ? 'Belum Diagih' : 'Tidak Dikenali'),
            leads_count: 0,
            cost: 0,
          };
        }
        breakdownMap[pid].leads_count += 1;
      });

      // Calculate proportional cost + commission after all leads counted
      const completedOnDay = await adminClient
        .from('cases')
        .select('id, assigned_to')
        .in('status', ['Rawatan Selesai', 'Telah Dibayar'])
        .gte('updated_at', dateStart)
        .lte('updated_at', dateEnd);
      const selesaiList = completedOnDay.data || [];

      Object.values(breakdownMap).forEach(b => {
        b.cost = totalLeads > 0
          ? parseFloat(((b.leads_count / totalLeads) * spend.amount).toFixed(2))
          : 0;
        b.rawatan_selesai = selesaiList.filter(c => c.assigned_to === b.practitioner_id).length;
        b.sales = parseFloat((b.rawatan_selesai * treatmentPrice).toFixed(2));
        b.komisen = parseFloat((b.sales - b.cost).toFixed(2));
        b.perawat_dapat = parseFloat((Math.max(0, b.komisen) * 0.6).toFixed(2));
        b.esyifaa_dapat = parseFloat((Math.max(0, b.komisen) * 0.4).toFixed(2));
      });

      const breakdownList = Object.values(breakdownMap).sort((a, b) => b.leads_count - a.leads_count);
      const dayTotalSelesai = selesaiList.length;
      const daySales = parseFloat((dayTotalSelesai * treatmentPrice).toFixed(2));
      const dayKomisen = parseFloat((daySales - spend.amount).toFixed(2));

      return {
        ...spend,
        total_leads: totalLeads,
        cost_per_lead: parseFloat(costPerLead.toFixed(4)),
        total_selesai: dayTotalSelesai,
        total_sales: daySales,
        total_komisen: dayKomisen,
        treatment_price: treatmentPrice,
        breakdown: breakdownList,
      };
    }));

    // Summary totals
    const totalSpent = records.reduce((s, r) => s + parseFloat(r.amount || 0), 0);
    const totalLeads = records.reduce((s, r) => s + r.total_leads, 0);
    const avgCostPerLead = totalLeads > 0 ? totalSpent / totalLeads : 0;
    const totalSales = records.reduce((s, r) => s + (r.total_sales || 0), 0);
    const totalKomisen = records.reduce((s, r) => s + (r.total_komisen || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        records,
        summary: {
          total_spent: parseFloat(totalSpent.toFixed(2)),
          total_leads: totalLeads,
          avg_cost_per_lead: parseFloat(avgCostPerLead.toFixed(4)),
          total_sales: parseFloat(totalSales.toFixed(2)),
          total_komisen: parseFloat(totalKomisen.toFixed(2)),
        }
      }
    });

  } catch (error) {
    console.error('GET ads-spend error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
    if (!['admin', 'super_admin'].includes(profile?.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { spend_date, amount, notes } = body;

    if (!spend_date || amount === undefined || amount === null) {
      return NextResponse.json({ success: false, error: 'Tarikh dan jumlah diperlukan' }, { status: 400 });
    }

    const { data, error } = await adminClient
      .from('ads_spend')
      .insert({ spend_date, amount: parseFloat(amount), notes: notes || null, created_by: user.id })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: false, error: 'Rekod untuk tarikh ini sudah wujud. Gunakan kemaskini.' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('POST ads-spend error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
    if (!['admin', 'super_admin'].includes(profile?.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { id, amount, notes } = body;

    if (!id || amount === undefined) {
      return NextResponse.json({ success: false, error: 'ID dan jumlah diperlukan' }, { status: 400 });
    }

    const { data, error } = await adminClient
      .from('ads_spend')
      .update({ amount: parseFloat(amount), notes: notes || null, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('PATCH ads-spend error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT — ads HQ SATU hari untuk SATU produk (jadual harian di page Laporan Marketer)
// Body: { spend_date, product, amount }. amount kosong/0 → padam.
export async function PUT(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
    if (!['admin', 'super_admin'].includes(profile?.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { spend_date, product, amount } = await req.json();
    try {
      const data = await upsertDailyAds(adminClient, { marketerId: null, spendDate: spend_date, product, amount, userId: user.id });
      return NextResponse.json({ success: true, data });
    } catch (e) {
      return NextResponse.json({ success: false, error: e.message }, { status: 400 });
    }
  } catch (error) {
    console.error('PUT ads-spend error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

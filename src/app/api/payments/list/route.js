import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isPhysicalOrder, applyProductFilter } from '@/lib/products';
import { applyOwnerFilter } from '@/lib/team';
import { formatOrder } from '@/lib/orders';

export async function GET(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
    const isAdmin = ['admin', 'super_admin'].includes(profile?.role);
    if (!isAdmin) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const paymentStatus = searchParams.get('payment_status') || 'all'; // all | pending | completed | failed
    const paymentType   = searchParams.get('payment_type') || 'all';   // all | fpx_payment | cod | physical
    const physical      = searchParams.get('physical') === 'true';     // COD + FPX produk fizikal (sabun/garam/kasturi)
    const notExported   = searchParams.get('not_exported') === 'true'; // belum export NinjaVan — tapis di SERVER
    const product       = searchParams.get('product') || 'all';         // sabun-garam | garam-pengasihan | kasturi-kijang | digital
    const owner         = searchParams.get('owner') || 'all';           // hq | <marketer id> (ketua termasuk teamsale)
    const channel       = searchParams.get('channel') || 'all';         // web | whatsapp
    const search = searchParams.get('search') || '';
    const page   = parseInt(searchParams.get('page'))  || 1;
    // Belum export: had lebih besar supaya order lama yang belum dihantar tak tercicir
    const limit  = parseInt(searchParams.get('limit')) || (notExported ? 500 : 100);
    const offset = (page - 1) * limit;

    // Query all paid orders (FPX + COD) — exclude appointment (lead form, legacy)
    let query = adminClient
      .from('submissions')
      .select(`
        id, full_name, phone, address, problem, source,
        payment_type, payment_status, chip_bill_id, amount_paid,
        ninjavan_exported_at, returned_at, qty, marketer_id, order_channel, order_origin,
        created_at, notes, customer_id,
        cases:cases!cases_submission_id_fkey (
          id, status, assigned_to, created_at,
          practitioner:profiles!cases_assigned_to_fkey (id, full_name)
        )
      `, { count: 'exact' })
      .in('payment_type', ['fpx_payment', 'cod']);

    if (paymentStatus !== 'all') {
      query = query.eq('payment_status', paymentStatus);
    }

    // physical=true: COD (semua) + FPX sabun sahaja — filter in JS after fetch
    if (!physical && paymentType !== 'all') {
      query = query.eq('payment_type', paymentType);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    if (notExported) {
      query = query.is('ninjavan_exported_at', null);
    }

    // Penapis produk / pemilik / saluran — dikenakan pada senarai DAN statistik
    const scoped = async q => {
      q = applyProductFilter(q, product);
      q = await applyOwnerFilter(adminClient, q, owner);
      if (channel === 'whatsapp') q = q.eq('order_channel', 'whatsapp');
      else if (channel === 'web') q = q.neq('order_channel', 'whatsapp');
      return q;
    };
    query = await scoped(query);

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: submissions, error, count } = await query;
    if (error) throw error;

    // Physical filter: COD (semua) + FPX produk fizikal (sabun / garam / kasturi)
    const filteredSubmissions = physical
      ? (submissions || []).filter(isPhysicalOrder)
      : (submissions || []);

    // Ambil semua baris (Supabase hadkan 1000 baris satu query)
    const fetchAll = async build => {
      const out = [];
      for (let from = 0; ; from += 1000) {
        const { data, error: e } = await (await build()).range(from, from + 999);
        if (e) throw e;
        out.push(...(data || []));
        if (!data || data.length < 1000) return out;
      }
    };

    // Stats: kira semua order (FPX + COD) yang sepadan penapis produk / pemilik / saluran
    let statsCompleted = 0, statsPending = 0, statsFailed = 0;
    let statsCod = 0, statsFpx = 0;
    let totalRevenue = 0;

    try {
      const statsData = await fetchAll(() => scoped(adminClient
        .from('submissions')
        .select('payment_status, payment_type, amount_paid, notes, returned_at')
        .in('payment_type', ['fpx_payment', 'cod'])
        .order('created_at', { ascending: true })));

      (statsData || []).forEach(s => {
        if (s.payment_status === 'completed') {
          statsCompleted++;
          if (s.returned_at) return;   // order return — tiada revenue
          // Revenue: guna amount_paid kalau ada, else parse dari notes, else fallback
          if (s.amount_paid) {
            totalRevenue += parseFloat(s.amount_paid);
          } else if (s.payment_type === 'fpx_payment') {
            // FPX notes: "[AMOUNT: MYR 95.00]" or "[AMOUNT: RM95]"
            const match = (s.notes || '').match(/\[AMOUNT:\s*(?:RM|MYR)\s*([0-9]+(?:\.[0-9]+)?)\]/i);
            totalRevenue += match ? parseFloat(match[1]) : 90;
          } else if (s.payment_type === 'cod') {
            const match = (s.notes || '').match(/\[AMOUNT:\s*(?:RM|MYR)\s*([0-9]+(?:\.[0-9]+)?)\]/i);
            totalRevenue += match ? parseFloat(match[1]) : 0;
          }
        } else if (s.payment_status === 'pending') statsPending++;
        else if (s.payment_status === 'failed') statsFailed++;

        if (s.payment_type === 'cod') statsCod++;
        else if (s.payment_type === 'fpx_payment') statsFpx++;
      });
    } catch (_) {}

    // ─── Export terakhir NinjaVan + bilangan order fizikal yang belum diexport ───
    let lastExport = null;
    let notExportedCount = 0;
    try {
      const [{ data: last }, { data: pendingExport }] = await Promise.all([
        adminClient.from('submissions')
          .select('ninjavan_exported_at')
          .not('ninjavan_exported_at', 'is', null)
          .order('ninjavan_exported_at', { ascending: false })
          .limit(1),
        fetchAll(() => scoped(adminClient.from('submissions')
          .select('payment_type, source')
          .in('payment_type', ['fpx_payment', 'cod'])
          .eq('payment_status', 'completed')
          .is('ninjavan_exported_at', null)
          .order('created_at', { ascending: true }))).then(data => ({ data })),
      ]);
      notExportedCount = (pendingExport || []).filter(isPhysicalOrder).length;

      const at = last?.[0]?.ninjavan_exported_at;
      if (at) {
        // Satu export = satu timestamp yang sama untuk semua order dalam batch
        const { data: batch } = await adminClient.from('submissions')
          .select('created_at')
          .eq('ninjavan_exported_at', at);
        const times = (batch || []).map(b => b.created_at).sort();
        lastExport = { at, count: times.length, latest_order_at: times[times.length - 1] || null };
      }
    } catch (_) {}

    const formatted = filteredSubmissions.map(formatOrder);

    return NextResponse.json({
      success: true,
      data: formatted,
      stats: {
        total_completed: statsCompleted,
        total_pending: statsPending,
        total_failed: statsFailed,
        total_cod: statsCod,
        total_fpx: statsFpx,
        total_revenue_rm: parseFloat(totalRevenue.toFixed(2)),
        not_exported_physical: notExportedCount,
      },
      last_export: lastExport,
      meta: { total: count, page, limit, totalPages: Math.ceil((count || 0) / limit) },
    });

  } catch (error) {
    console.error('Payments List API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

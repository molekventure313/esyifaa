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
    const isAdmin = ['admin', 'super_admin'].includes(profile?.role);
    if (!isAdmin) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const paymentStatus = searchParams.get('payment_status') || 'all'; // all | pending | completed | failed
    const paymentType   = searchParams.get('payment_type') || 'all';   // all | fpx_payment | cod
    const search = searchParams.get('search') || '';
    const page   = parseInt(searchParams.get('page'))  || 1;
    const limit  = parseInt(searchParams.get('limit')) || 100;
    const offset = (page - 1) * limit;

    // Query all paid orders (FPX + COD) — exclude appointment (lead form, legacy)
    let query = adminClient
      .from('submissions')
      .select(`
        id, full_name, phone, address, problem, source,
        payment_type, payment_status, chip_bill_id, amount_paid,
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

    if (paymentType !== 'all') {
      query = query.eq('payment_type', paymentType);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: submissions, error, count } = await query;
    if (error) throw error;

    // Stats: kira semua order (FPX + COD)
    let statsCompleted = 0, statsPending = 0, statsFailed = 0;
    let statsCod = 0, statsFpx = 0;
    let totalRevenue = 0;

    try {
      const { data: statsData } = await adminClient
        .from('submissions')
        .select('payment_status, payment_type, amount_paid, notes')
        .in('payment_type', ['fpx_payment', 'cod']);

      (statsData || []).forEach(s => {
        if (s.payment_status === 'completed') {
          statsCompleted++;
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

    const formatted = (submissions || []).map(s => {
      const caseRecord = Array.isArray(s.cases) ? s.cases[0] : s.cases;

      // Extract address: guna column address (COD), atau parse dari problem field
      let displayAddress = s.address || null;
      if (!displayAddress && s.problem) {
        const m = s.problem.match(/Alamat:\s*(.+?)(?:\s*\||$)/i);
        if (m) displayAddress = m[1].trim();
      }

      // Extract produk label dari notes
      let produkLabel = null;
      if (s.payment_type === 'cod') {
        const m = (s.notes || '').match(/\[PRODUK:\s*([^\]]+)\]/i);
        produkLabel = m ? m[1].trim() : 'Sabun Garam';
      } else if (s.payment_type === 'fpx_payment') {
        produkLabel = s.source?.includes('pengisian') ? 'Pengisian ESyifaa' : 'FPX';
      }

      // Revenue for this record — parse dari notes (handle "RM95" COD & "MYR 95.00" FPX format)
      let amountDisplay = s.amount_paid ? parseFloat(s.amount_paid) : null;
      if (!amountDisplay && s.notes) {
        const m = s.notes.match(/\[AMOUNT:\s*(?:RM|MYR)\s*([0-9]+(?:\.[0-9]+)?)\]/i);
        if (m) amountDisplay = parseFloat(m[1]);
      }

      return {
        id: s.id,
        full_name: s.full_name,
        phone: s.phone,
        address: displayAddress,
        problem: s.problem,
        source: s.source,
        payment_type: s.payment_type,
        payment_status: s.payment_status || 'pending',
        chip_bill_id: s.chip_bill_id,
        amount_paid: amountDisplay,
        produk_label: produkLabel,
        created_at: s.created_at,
        // Case info
        case_id: caseRecord?.id || null,
        case_status: caseRecord?.status || null,
        assigned_to: caseRecord?.assigned_to || null,
        practitioner_name: caseRecord?.practitioner?.full_name || null,
      };
    });

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
      },
      meta: { total: count, page, limit, totalPages: Math.ceil((count || 0) / limit) },
    });

  } catch (error) {
    console.error('Payments List API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const role = profile?.role || 'practitioner';
    const isAdmin = role === 'super_admin';   // admin = staff order, tiada akses kes


    const { searchParams } = new URL(req.url);
    const myCases = searchParams.get('myCases');
    const statusParam = searchParams.get('status');
    const assigned_to = searchParams.get('assigned_to');
    const unassigned = searchParams.get('unassigned');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = (page - 1) * limit;

    let query = adminClient
      .from('cases')
      .select(`
        *,
        customer:customers!cases_customer_id_fkey (id, full_name, phone, state, is_repeat, problem),
        practitioner:profiles!cases_assigned_to_fkey (id, full_name, email),
        submission:submissions!cases_submission_id_fkey (id, source)
      `, { count: 'exact' });

    // ─── STRICT FILTERING LOGIC ───
    if (!isAdmin || myCases === 'true' || assigned_to === 'me') {
      // Practitioner role OR explicit myCases request: ONLY fetch cases assigned to THIS user
      query = query.eq('assigned_to', user.id);
      if (statusParam && statusParam !== 'all') {
        query = query.eq('status', statusParam);
      }
    } else {
      // Admin role: Can view ALL cases in the system or filter by status/assigned_to
      if (unassigned === 'true' || statusParam === 'Baru,Belum Diambil' || statusParam === 'unassigned') {
        query = query.is('assigned_to', null);
      } else if (assigned_to) {
        query = query.eq('assigned_to', assigned_to);
      } else if (statusParam && statusParam !== 'all') {
        query = query.eq('status', statusParam);
      }
    }

    // ─── FPX cases excluded at JS level below (PostgREST cannot filter on joined columns) ───

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: cases, error, count } = await query;
    if (error) throw error;

    const formattedCases = (cases || []).map(c => ({
      id: c.id,
      customer_id: c.customer_id,
      customer_name: c.customer?.full_name || 'Pesakit',
      customer_phone: c.customer?.phone || '',
      state: c.customer?.state || 'N/A',
      problem_description: c.customer?.problem || c.notes || 'Tiada penerangan simptom',
      is_repeat: c.customer?.is_repeat || false,
      assigned_to: c.assigned_to,
      practitioner_name: c.practitioner?.full_name || 'Belum Diagih',
      // FPX detection: use source field (e.g. 'fsp-checkout') — no dependency on migration column
      payment_type: c.submission?.source?.includes('checkout') ? 'fpx_payment' : 'appointment',
      status: c.status || 'Baru',
      created_at: c.created_at,
    })).filter(c => c.payment_type !== 'fpx_payment');

    return NextResponse.json({
      success: true,
      data: formattedCases,
      meta: { total: count, page, limit, totalPages: Math.ceil((count || 0) / limit) }
    });

  } catch (error) {
    console.error('Cases API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

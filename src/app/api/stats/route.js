import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient.from('profiles').select('role, full_name, email, max_active_cases').eq('id', user.id).single();
    if (!profile) return NextResponse.json({ success: false, error: 'User profile not found' }, { status: 404 });
    
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'today';
    const roleParam = searchParams.get('role');

    // Build date range for filtering (Malaysia UTC+8)
    const nowUTC = new Date();
    const myNow = new Date(nowUTC.getTime() + 8 * 60 * 60 * 1000);
    const todayStr = myNow.toISOString().split('T')[0];

    let dateFrom = null;
    if (period === 'today') {
      dateFrom = `${todayStr}T00:00:00+08:00`;
    } else if (period === 'yesterday') {
      const yest = new Date(myNow);
      yest.setUTCDate(myNow.getUTCDate() - 1);
      const yStr = yest.toISOString().split('T')[0];
      dateFrom = `${yStr}T00:00:00+08:00`;
    } else if (period === 'week') {
      const dow = myNow.getUTCDay();
      const startOfWeek = new Date(myNow);
      startOfWeek.setUTCDate(myNow.getUTCDate() - dow);
      dateFrom = `${startOfWeek.toISOString().split('T')[0]}T00:00:00+08:00`;
    } else if (period === 'month') {
      dateFrom = `${myNow.getUTCFullYear()}-${String(myNow.getUTCMonth() + 1).padStart(2, '0')}-01T00:00:00+08:00`;
    }
    // period === 'all': no dateFrom filter

    // Statistik penuh hanya untuk super_admin (dulu ?role=admin dari client pun dapat statistik admin)
    const isAdminRequest = profile.role === 'super_admin';

    let data = {};

    if (isAdminRequest) {
      // Direct live calculations for Admin Dashboard stats
      let customersQuery = adminClient.from('customers').select('id, is_repeat, created_at');
      if (dateFrom) customersQuery = customersQuery.gte('created_at', dateFrom);
      const { data: customers } = await customersQuery;
      const { data: practitionerProfiles } = await adminClient.from('profiles').select('id, full_name, email, is_active, max_active_cases').in('role', ['practitioner', 'perawat']);

      // Filter cases by period if dateFrom is set
      let casesQuery = adminClient.from('cases').select('id, assigned_to, status, created_at');
      if (dateFrom) casesQuery = casesQuery.gte('created_at', dateFrom);
      const { data: allCases } = await casesQuery;

      const totalCustomers = (customers || []).length;
      const totalPractitioners = (practitionerProfiles || []).length;
      const newCases = (allCases || []).filter(c => ['Baru', 'Belum Diambil'].includes(c.status) || !c.assigned_to).length;
      const inProgress = (allCases || []).filter(c => ['Belum Diambil', 'Sedang Diurus', 'Perlu Follow-up'].includes(c.status)).length;
      const completed = (allCases || []).filter(c => c.status === 'Rawatan Selesai').length;
      const unclaimedCases = (allCases || []).filter(c => !c.assigned_to).length;
      const repeatCustomers = (customers || []).filter(c => c.is_repeat).length;
      const unreachable = (allCases || []).filter(c => c.status === 'Tidak Dapat Dihubungi').length;

      const practitionerPerformance = (practitionerProfiles || []).map(p => {
        const pCases = (allCases || []).filter(c => c.assigned_to === p.id);
        const pCompleted = pCases.filter(c => c.status === 'Rawatan Selesai').length;
        const pPending = pCases.filter(c => ['Belum Diambil', 'Sedang Diurus', 'Perlu Follow-up', 'Baru'].includes(c.status)).length;
        return {
          id: p.id,
          name: p.full_name,
          email: p.email,
          is_active: p.is_active,
          max_active_cases: p.max_active_cases || 10,
          claimed: pCases.length,
          completed: pCompleted,
          pending: pPending,
        };
      });

      const { data: recentCasesData } = await adminClient
        .from('cases')
        .select(`
          id, status, created_at,
          customer:customers ( full_name, phone, state, is_repeat ),
          practitioner:profiles!cases_assigned_to_fkey ( full_name )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      const formattedRecentCases = (recentCasesData || []).map(c => ({
        id: c.id,
        customer_name: c.customer?.full_name || 'Pesakit',
        customer_phone: c.customer?.phone || '',
        state: c.customer?.state || 'N/A',
        is_repeat: c.customer?.is_repeat || false,
        practitioner_name: c.practitioner?.full_name || 'Belum Diambil',
        status: c.status,
        created_at: c.created_at,
      }));

      // ─── Salespage Breakdown: count submissions per source ───
      const { data: submissionsBySource } = await adminClient
        .from('submissions')
        .select('source');

      const SALESPAGE_LABELS = {
        'sihir': 'Salespage Sihir',
        'saka': 'Salespage Saka',
        'penyakit-misteri': 'Salespage Penyakit Misteri',
        'gangguan-berulang': 'Salespage Gangguan Berulang',
        'belum-zuriat': 'Salespage Belum Zuriat',
        'kedai-tutup': 'Salespage Kedai Tutup',
      };

      const sourceCounts = {};
      (submissionsBySource || []).forEach(s => {
        const key = (s.source || 'lain-lain').toLowerCase().trim();
        sourceCounts[key] = (sourceCounts[key] || 0) + 1;
      });

      const salespageBreakdown = Object.entries(SALESPAGE_LABELS).map(([slug, label]) => ({
        slug,
        label,
        count: sourceCounts[slug] || 0,
      })).sort((a, b) => b.count - a.count);

      const dashboard = {
        totalCustomers,
        newCases,
        inProgress,
        completed,
        unreachable,
        repeatCustomers,
        unclaimedCases,
        totalPractitioners,
      };

      data = {
        dashboard,
        practitionerPerformance,
        recentCases: formattedRecentCases,
        salespageBreakdown,
      };
    } else {
      // Practitioner Dashboard Live Statistics & Streams
      const { data: myCasesData } = await adminClient
        .from('cases')
        .select(`
          id, status, created_at, assigned_at,
          customer:customers ( full_name, phone, state, problem, is_repeat )
        `)
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false });

      const { data: unclaimedCasesData } = await adminClient
        .from('cases')
        .select(`
          id, status, created_at,
          customer:customers ( full_name, phone, state, problem, is_repeat )
        `)
        .is('assigned_to', null)
        .order('created_at', { ascending: false })
        .limit(8);

      const myCases = (myCasesData || []).map(c => ({
        id: c.id,
        customer_name: c.customer?.full_name || 'Pesakit',
        customer_phone: c.customer?.phone || '',
        state: c.customer?.state || 'N/A',
        problem_description: c.customer?.problem || 'Tiada maklumat',
        is_repeat: c.customer?.is_repeat || false,
        status: c.status,
        created_at: c.created_at,
      }));

      const unclaimedCases = (unclaimedCasesData || []).map(c => ({
        id: c.id,
        customer_name: c.customer?.full_name || 'Pesakit',
        customer_phone: c.customer?.phone || '',
        state: c.customer?.state || 'N/A',
        problem_description: c.customer?.problem || 'Tiada maklumat',
        is_repeat: c.customer?.is_repeat || false,
        status: c.status,
        created_at: c.created_at,
      }));

      const activeCases = myCases.filter(c => ['Belum Diambil', 'Sedang Diurus', 'Perlu Follow-up', 'Baru'].includes(c.status));
      const completedCases = myCases.filter(c => c.status === 'Rawatan Selesai');
      const followUpCases = myCases.filter(c => c.status === 'Perlu Follow-up');

      const dashboard = {
        totalMyCases: myCases.length,
        activeCases: activeCases.length,
        completedCases: completedCases.length,
        followUpCases: followUpCases.length,
        unclaimedPoolCount: unclaimedCases.length,
        maxActiveCases: profile.max_active_cases || 10,
        repeatPatientsCount: myCases.filter(c => c.is_repeat).length,
      };

      data = {
        dashboard,
        myCases,
        activeCases,
        unclaimedCases,
      };
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

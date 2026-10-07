import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
// Akses: super_admin sahaja — role 'admin' ialah staff order (lihat src/lib/auth.js)

const SALESPAGES = [
  { slug: 'sihir',             label: 'Salespage Sihir' },
  { slug: 'saka',              label: 'Salespage Saka' },
  { slug: 'penyakit-misteri',  label: 'Salespage Penyakit Misteri' },
  { slug: 'gangguan-berulang', label: 'Salespage Gangguan Berulang' },
  { slug: 'belum-zuriat',      label: 'Salespage Belum Zuriat' },
  { slug: 'kedai-tutup',       label: 'Salespage Kedai Tutup' },
  { slug: 'tasbih-esyifa',     label: 'Tasbih E-Syifa\'' },
];

export async function GET(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!['super_admin'].includes(profile.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'all';

    // Build date range (Malaysia UTC+8)
    const nowUTC = new Date();
    const myNow = new Date(nowUTC.getTime() + 8 * 60 * 60 * 1000);
    const todayStr = myNow.toISOString().split('T')[0];

    let dateFrom = null;
    if (period === 'today') {
      dateFrom = `${todayStr}T00:00:00+08:00`;
    } else if (period === 'yesterday') {
      const yest = new Date(myNow);
      yest.setUTCDate(myNow.getUTCDate() - 1);
      dateFrom = `${yest.toISOString().split('T')[0]}T00:00:00+08:00`;
    } else if (period === 'week') {
      const dow = myNow.getUTCDay();
      const startOfWeek = new Date(myNow);
      startOfWeek.setUTCDate(myNow.getUTCDate() - dow);
      dateFrom = `${startOfWeek.toISOString().split('T')[0]}T00:00:00+08:00`;
    } else if (period === 'month') {
      dateFrom = `${myNow.getUTCFullYear()}-${String(myNow.getUTCMonth() + 1).padStart(2, '0')}-01T00:00:00+08:00`;
    }

    const adminClient = createAdminClient();

    // ─── Fetch submissions per slug ───
    let subQuery = adminClient.from('submissions').select('source');
    if (dateFrom) subQuery = subQuery.gte('created_at', dateFrom);
    const { data: submissions } = await subQuery;

    const leadCounts = {};
    (submissions || []).forEach(s => {
      const key = (s.source || 'lain-lain').toLowerCase().trim();
      leadCounts[key] = (leadCounts[key] || 0) + 1;
    });

    // ─── Fetch page views per slug ───
    let viewQuery = adminClient.from('page_views').select('salespage_slug');
    if (dateFrom) viewQuery = viewQuery.gte('viewed_at', dateFrom);
    const { data: pageViews, error: viewError } = await viewQuery;

    const viewCounts = {};
    if (!viewError) {
      (pageViews || []).forEach(v => {
        const key = (v.salespage_slug || '').toLowerCase().trim();
        viewCounts[key] = (viewCounts[key] || 0) + 1;
      });
    }

    // ─── Build result ───
    const result = SALESPAGES.map(sp => {
      const leads    = leadCounts[sp.slug] || 0;
      const visitors = viewCounts[sp.slug] || 0;
      const rate     = visitors > 0 ? ((leads / visitors) * 100).toFixed(1) : null;

      return {
        slug:            sp.slug,
        label:           sp.label,
        total_leads:     leads,
        unique_visitors: visitors,
        conversion_rate: rate, // null = tiada data visitor lagi
      };
    }).sort((a, b) => b.total_leads - a.total_leads);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Conversion rate API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

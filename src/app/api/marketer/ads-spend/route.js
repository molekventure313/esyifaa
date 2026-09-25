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
    const period = searchParams.get('period') || 'today';

    const nowUTC = new Date();
    const myNow = new Date(nowUTC.getTime() + 8 * 60 * 60 * 1000);
    const todayStr = myNow.toISOString().split('T')[0];

    let dateFrom = null;
    let dateTo = null;
    if (period === 'today') {
      dateFrom = todayStr;
    } else if (period === 'yesterday') {
      const yest = new Date(myNow);
      yest.setUTCDate(myNow.getUTCDate() - 1);
      dateFrom = yest.toISOString().split('T')[0];
      dateTo = dateFrom;
    } else if (period === 'week') {
      const dow = myNow.getUTCDay();
      const startOfWeek = new Date(myNow);
      startOfWeek.setUTCDate(myNow.getUTCDate() - dow);
      dateFrom = startOfWeek.toISOString().split('T')[0];
    } else if (period === 'month') {
      dateFrom = `${myNow.getUTCFullYear()}-${String(myNow.getUTCMonth() + 1).padStart(2, '0')}-01`;
    }

    let query = adminClient.from('ads_spend').select('*').eq('marketer_id', user.id).order('spend_date', { ascending: false });

    if (dateFrom) query = query.gte('spend_date', dateFrom);
    if (dateTo) query = query.lte('spend_date', dateTo);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
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
    if (!profile || profile.role !== 'marketer') {
       return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { spend_date, amount, notes } = body;

    const { data, error } = await adminClient
      .from('ads_spend')
      .insert({ marketer_id: user.id, spend_date, amount, notes })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
          return NextResponse.json({ success: false, error: 'Rekod untuk tarikh ini sudah wujud.' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
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
    if (!profile || profile.role !== 'marketer') {
       return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { id, amount, notes } = body;

    const { data, error } = await adminClient
      .from('ads_spend')
      .update({ amount, notes })
      .eq('id', id)
      .eq('marketer_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT — simpan ads spend untuk SATU hari (inline edit dari jadual Pecahan Harian page Gaji)
// Body: { spend_date: 'YYYY-MM-DD', amount }. amount kosong/0 → padam rekod hari tu.
export async function PUT(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const adminClient = createAdminClient();
    const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'marketer') {
       return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { spend_date, amount } = await req.json();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(spend_date || '')) {
      return NextResponse.json({ success: false, error: 'Tarikh tidak sah.' }, { status: 400 });
    }
    const todayMY = new Date(Date.now() + 8 * 3600 * 1000).toISOString().split('T')[0];
    if (spend_date > todayMY) {
      return NextResponse.json({ success: false, error: 'Tidak boleh isi ads untuk tarikh akan datang.' }, { status: 400 });
    }

    const value = amount === '' || amount === null || amount === undefined ? 0 : parseFloat(amount);
    if (!Number.isFinite(value) || value < 0) {
      return NextResponse.json({ success: false, error: 'Jumlah tidak sah.' }, { status: 400 });
    }

    const { data: existing } = await adminClient
      .from('ads_spend')
      .select('id')
      .eq('marketer_id', user.id)
      .eq('spend_date', spend_date)
      .maybeSingle();

    // 0 / kosong → padam rekod (tiada baris RM0)
    if (value === 0) {
      if (existing) {
        const { error } = await adminClient.from('ads_spend').delete().eq('id', existing.id);
        if (error) throw error;
      }
      return NextResponse.json({ success: true, data: null });
    }

    const amt = parseFloat(value.toFixed(2));
    // Update jumlah sahaja — notes sedia ada tak diusik
    const { data, error } = existing
      ? await adminClient.from('ads_spend').update({ amount: amt }).eq('id', existing.id).select().single()
      : await adminClient.from('ads_spend').insert({ marketer_id: user.id, spend_date, amount: amt }).select().single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

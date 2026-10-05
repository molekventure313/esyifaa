import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { upsertDailyAds } from '@/lib/products';
import { isMyTeamsale } from '@/lib/team';

// PUT ?member=<teamsale_id> — ketua isi kos ads SATU hari untuk SATU produk bagi teamsale dia
// Body: { spend_date, product, amount }. amount kosong/0 → padam. Rekod disimpan atas nama teamsale.
export async function PUT(req) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminClient();
    const { data: profile } = await admin.from('profiles').select('role, team_leader_id').eq('id', user.id).single();
    if (!profile || profile.role !== 'marketer' || profile.team_leader_id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const memberId = new URL(req.url).searchParams.get('member');
    if (!(await isMyTeamsale(admin, user.id, memberId))) {
      return NextResponse.json({ success: false, error: 'Bukan ahli team anda' }, { status: 403 });
    }

    const { spend_date, product, amount } = await req.json();
    try {
      const data = await upsertDailyAds(admin, { marketerId: memberId, spendDate: spend_date, product, amount, userId: user.id });
      return NextResponse.json({ success: true, data });
    } catch (e) {
      return NextResponse.json({ success: false, error: e.message }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

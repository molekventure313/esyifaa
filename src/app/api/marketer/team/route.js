import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseAmount, calcKomisen, calcLeaderPay, TEAMSALE_PCT, LEADER_OVERRIDE_PCT } from '@/lib/marketer-calc';
import { monthRange, fetchProductCosts, buildMonthlyBreakdown } from '@/lib/products';
import { formatOrder } from '@/lib/orders';
import { getTeam, isMyTeamsale, fetchMembersMonth, memberSummary } from '@/lib/team';
import { logActivity } from '@/lib/utils/logger';

// Team Saya — ketua marketer urus teamsale bawah dia.
// GET  ?month=YYYY-MM            → senarai team + prestasi bulan
// GET  ?id=<teamsale>&month=...  → detail: pecahan harian (isi ads), produk, semua order
// POST { fullName, email, password, phone } → cipta teamsale (terus aktif, tiada basic)
// PATCH { id, is_active }        → aktif / nyahaktif

async function requireLeader() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw Object.assign(new Error('Unauthorized'), { status: 401 });
  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles')
    .select('id, role, full_name, marketer_code, is_active, team_leader_id').eq('id', user.id).single();
  if (!profile || profile.role !== 'marketer' || !profile.is_active) throw Object.assign(new Error('Unauthorized'), { status: 403 });
  if (profile.team_leader_id) throw Object.assign(new Error('Teamsale tidak boleh urus team.'), { status: 403 });
  return { admin, user, profile };
}

const fail = e => NextResponse.json({ success: false, error: e.message }, { status: e.status || 500 });

export async function GET(req) {
  try {
    const { admin, user } = await requireLeader();
    const { searchParams } = new URL(req.url);
    const range = monthRange(searchParams.get('month'));
    const memberId = searchParams.get('id');
    const costs = await fetchProductCosts(admin);

    // ── Detail seorang teamsale ──
    if (memberId) {
      if (!(await isMyTeamsale(admin, user.id, memberId))) throw Object.assign(new Error('Bukan ahli team anda'), { status: 403 });
      const [{ data: member }, { subs, ads }, { data: orders }] = await Promise.all([
        admin.from('profiles').select('id, full_name, email, phone, marketer_code, is_active, created_at').eq('id', memberId).single(),
        fetchMembersMonth(admin, [memberId], range),
        admin.from('submissions')
          .select('id, full_name, phone, address, problem, notes, source, qty, payment_type, payment_status, chip_bill_id, amount_paid, ninjavan_exported_at, returned_at, marketer_id, order_channel, order_origin, created_at')
          .eq('marketer_id', memberId)
          .in('payment_type', ['fpx_payment', 'cod'])
          .gte('created_at', range.from)
          .lte('created_at', range.to)
          .order('created_at', { ascending: false }),
      ]);
      const summary = memberSummary(memberId, subs, ads, costs);
      const { days, productSummary } = buildMonthlyBreakdown({ subs, ads, range, costs, commissionPct: TEAMSALE_PCT });
      return NextResponse.json({
        success: true, month: range.month, member,
        summary: { ...summary, komisen: calcKomisen(summary.profit, TEAMSALE_PCT), komisen_pct: TEAMSALE_PCT },
        days, productSummary,
        orders: (orders || []).map(o => ({ ...formatOrder(o), amount: parseAmount(o) })),
      });
    }

    // ── Senarai team ──
    const members = await getTeam(admin, user.id);
    const { subs, ads } = await fetchMembersMonth(admin, members.map(m => m.id), range);
    const rows = members.map(m => ({ ...m, name: m.full_name || 'Teamsale', ...memberSummary(m.id, subs, ads, costs) }));
    const pay = calcLeaderPay(0, rows);
    const team = rows.map(r => {
      const p = pay.team.find(t => t.id === r.id);
      return { ...r, komisen: p.komisen, override: p.override };
    });
    const sum = k => parseFloat(team.reduce((t, r) => t + (r[k] || 0), 0).toFixed(2));
    return NextResponse.json({
      success: true, month: range.month, teamsale_pct: TEAMSALE_PCT, override_pct: LEADER_OVERRIDE_PCT,
      team,
      totals: { orders: team.reduce((t, r) => t + r.orders, 0), sales: sum('sales'), ads: sum('ads'), cogs: sum('cogs'), profit: sum('profit'), komisen: sum('komisen'), override: sum('override') },
    });
  } catch (e) { return fail(e); }
}

export async function POST(req) {
  try {
    const { admin, user, profile } = await requireLeader();
    const { fullName, email, password, phone } = await req.json();
    const name = String(fullName || '').trim();
    const mail = String(email || '').trim().toLowerCase();
    if (!name || !mail || !password) throw Object.assign(new Error('Sila isi nama, e-mel dan kata laluan.'), { status: 400 });
    if (String(password).length < 6) throw Object.assign(new Error('Kata laluan mestilah sekurang-kurangnya 6 aksara.'), { status: 400 });

    // Kod unik automatik (teamsale tak guna link SP, tapi column perlu unik)
    const base = (profile.marketer_code || 'team').slice(0, 12);
    let code = null;
    for (let i = 0; i < 5 && !code; i++) {
      const c = `${base}-t${Math.random().toString(36).slice(2, 6)}`;
      const { data: exists } = await admin.from('profiles').select('id').eq('marketer_code', c).maybeSingle();
      if (!exists) code = c;
    }
    if (!code) throw new Error('Gagal jana kod teamsale, cuba lagi.');

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: mail, password, email_confirm: true,
      user_metadata: { full_name: name, role: 'marketer' },
    });
    if (authError) throw Object.assign(new Error(authError.message || 'Gagal cipta akaun.'), { status: 400 });

    const userId = authData.user.id;
    const { error: profErr } = await admin.from('profiles').upsert({
      id: userId, full_name: name, email: mail, phone: phone || null,
      role: 'marketer', is_active: true,               // terus aktif — ketua yang tambah
      marketer_code: code, team_leader_id: user.id,
      marketer_basic_salary: 0, marketer_commission_pct: TEAMSALE_PCT,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    if (profErr) {
      await admin.auth.admin.deleteUser(userId).catch(() => {});
      throw new Error(`Gagal simpan profil: ${profErr.message}`);
    }

    await logActivity(admin, {
      userId: user.id, actionType: 'teamsale_created', entityType: 'profile', entityId: userId,
      description: `${profile.full_name} tambah teamsale ${name} (${mail})`,
    });

    return NextResponse.json({ success: true, message: `Teamsale ${name} berjaya ditambah. Dia boleh login sekarang.` });
  } catch (e) { return fail(e); }
}

export async function PATCH(req) {
  try {
    const { admin, user } = await requireLeader();
    const { id, is_active } = await req.json();
    if (!(await isMyTeamsale(admin, user.id, id))) throw Object.assign(new Error('Bukan ahli team anda'), { status: 403 });
    const { error } = await admin.from('profiles').update({ is_active: !!is_active, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) { return fail(e); }
}

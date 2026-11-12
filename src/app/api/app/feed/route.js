import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { APP_ROLES, verifyDeviceToken } from '@/lib/app-device';
import { formatOrder } from '@/lib/orders';
import { parseAmount } from '@/lib/marketer-calc';
import { ownerScope } from '@/lib/team';

// Feed order untuk app Android — dipanggil setiap ~20s oleh servis latar belakang.
// Auth: Authorization: Bearer esd_… (lihat /api/app/device-token).
// Pulang order completed (FPX/COD) 12 jam terakhir; app simpan ID yang dah "cing" supaya tak berulang.
// Skop: super_admin & admin (staff order) = semua order · marketer = order sendiri + teamsale.
export const dynamic = 'force-dynamic';

const COLS = 'id, full_name, phone, address, problem, notes, source, qty, payment_type, payment_status, chip_bill_id, amount_paid, ninjavan_exported_at, returned_at, marketer_id, order_channel, order_origin, created_at';

export async function GET(req) {
  const auth = req.headers.get('authorization') || '';
  const userId = verifyDeviceToken(auth.replace(/^Bearer\s+/i, ''));
  if (!userId) return NextResponse.json({ success: false, error: 'Token tidak sah' }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('role').eq('id', userId).single();
  if (!APP_ROLES.includes(profile?.role)) {
    return NextResponse.json({ success: false, error: 'Akses ditarik' }, { status: 403 });
  }
  const ownerIds = profile.role === 'marketer' ? (await ownerScope(admin, userId)).ids : null;

  const now = new Date();
  const myNow = new Date(now.getTime() + 8 * 3600e3);
  const todayStart = `${myNow.toISOString().slice(0, 10)}T00:00:00+08:00`;
  const since = new Date(now.getTime() - 12 * 3600e3).toISOString();

  const base = () => {
    let q = admin.from('submissions').select(COLS)
      .in('payment_type', ['fpx_payment', 'cod'])
      .eq('payment_status', 'completed');
    if (ownerIds) q = q.in('marketer_id', ownerIds);
    return q;
  };

  const [recent, today] = await Promise.all([
    base().gte('created_at', since).order('created_at', { ascending: false }).limit(50),
    base().gte('created_at', todayStart).limit(2000),
  ]);
  if (recent.error || today.error) {
    return NextResponse.json({ success: false, error: (recent.error || today.error).message }, { status: 500 });
  }

  const orders = (recent.data || []).map(o => {
    const f = formatOrder(o);
    return {
      id: f.id,
      name: f.full_name,
      product: f.produk_label,
      amount: parseAmount(o),
      payment_type: f.payment_type,
      channel: f.order_channel,
      created_at: f.created_at,
    };
  });
  const todayRows = today.data || [];

  return NextResponse.json({
    success: true,
    now: now.toISOString(),
    orders,
    today: {
      count: todayRows.length,
      total: Math.round(todayRows.reduce((sum, o) => sum + parseAmount(o), 0) * 100) / 100,
    },
  });
}

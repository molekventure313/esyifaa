import { NextResponse } from 'next/server';
import { guard, OWNER } from '@/lib/auth';
import { RH_SOURCE, RH_MAX_SLOTS, rhMonthsOf, rhMonthStartISO } from '@/lib/ruqyah-harian';
import { parseAmount } from '@/lib/marketer-calc';

// GET — pelanggan Ruqyah Harian (order dah dibayar) + tempoh langganan & slot bulan ini
// Tempoh: mula = tarikh bayar, tamat = mula + N bulan (dari pakej dalam teks order)
export async function GET() {
  const g = await guard(OWNER);
  if (g.error) return g.error;
  try {
    const { data, error } = await g.admin.from('submissions')
      .select('id, full_name, phone, problem, notes, amount_paid, payment_status, marketer_id, created_at')
      .like('source', `${RH_SOURCE}%`)
      .eq('payment_status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1000);
    if (error) throw error;

    const now = Date.now();
    const DAY = 86400000;
    // Proses ikut kronologi: sambungan bermula selepas tempoh sebelumnya tamat (baki hari tak hilang)
    const lastEnd = {};
    const rows = [...(data || [])].reverse().map(s => {
      const months = rhMonthsOf(s);
      const paid = new Date(s.created_at);
      const renewal = lastEnd[s.phone] !== undefined;
      const start = renewal && lastEnd[s.phone] > paid ? new Date(lastEnd[s.phone]) : paid;
      const end = new Date(start); end.setMonth(end.getMonth() + months);
      lastEnd[s.phone] = end;
      const daysLeft = Math.ceil((end.getTime() - now) / DAY);
      return {
        id: s.id, full_name: s.full_name, phone: s.phone, months, amount: parseAmount(s), renewal,
        paid_at: s.created_at, start: start.toISOString(), end: end.toISOString(), days_left: daysLeft,
        status: start.getTime() > now ? 'menunggu' : daysLeft <= 0 ? 'tamat' : daysLeft <= 7 ? 'hampir' : 'aktif',
        problem: (s.problem || '').match(/Masalah:\s*(.*)$/)?.[1] || null,
        marketer_id: s.marketer_id,
      };
    }).reverse();

    const monthStart = rhMonthStartISO();
    const usedThisMonth = new Set(rows.filter(r => r.paid_at >= monthStart && !r.renewal).map(r => r.phone)).size;
    return NextResponse.json({
      success: true,
      slots: { max: RH_MAX_SLOTS, used: usedThisMonth, remaining: Math.max(0, RH_MAX_SLOTS - usedThisMonth) },
      counts: Object.fromEntries(['aktif', 'hampir', 'menunggu', 'tamat'].map(k => [k, rows.filter(r => r.status === k).length])),
      rows,
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

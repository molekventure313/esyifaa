// Teamsale — helper server (ketua marketer & ahli team).
import { parseAmount, calcCOGS } from '@/lib/marketer-calc';

const r2 = n => parseFloat((n || 0).toFixed(2));

// Ahli team seorang ketua
export async function getTeam(admin, leaderId) {
  const { data } = await admin
    .from('profiles')
    .select('id, full_name, email, phone, marketer_code, is_active, created_at')
    .eq('team_leader_id', leaderId)
    .eq('role', 'marketer')
    .order('created_at');
  return data || [];
}

// Pastikan memberId memang teamsale bawah leaderId
export async function isMyTeamsale(admin, leaderId, memberId) {
  if (!memberId) return false;
  const { data } = await admin.from('profiles').select('id').eq('id', memberId).eq('team_leader_id', leaderId).maybeSingle();
  return !!data;
}

// Order completed (bukan return) + ads beberapa marketer dalam satu julat bulan
export async function fetchMembersMonth(admin, ids, range) {
  if (!ids.length) return { subs: [], ads: [] };
  const [{ data: subs }, { data: ads }] = await Promise.all([
    admin.from('submissions')
      .select('id, marketer_id, amount_paid, notes, problem, source, qty, payment_type, order_channel, created_at')
      .in('marketer_id', ids)
      .eq('payment_status', 'completed')
      .is('returned_at', null)
      .in('payment_type', ['fpx_payment', 'cod'])
      .gte('created_at', range.from)
      .lte('created_at', range.to),
    admin.from('ads_spend')
      .select('marketer_id, amount, spend_date, product')
      .in('marketer_id', ids)
      .gte('spend_date', range.firstDay)
      .lte('spend_date', range.lastDay),
  ]);
  return { subs: subs || [], ads: ads || [] };
}

// Ringkasan satu ahli dari data yang dah diambil
export function memberSummary(id, subs, ads, costs) {
  const s = subs.filter(x => x.marketer_id === id);
  const a = ads.filter(x => x.marketer_id === id);
  const sales = r2(s.reduce((t, x) => t + parseAmount(x), 0));
  const adsTotal = r2(a.reduce((t, x) => t + (parseFloat(x.amount) || 0), 0));
  const cogs = calcCOGS(s, costs);
  return { orders: s.length, sales, ads: adsTotal, cogs, profit: r2(sales - adsTotal - cogs) };
}

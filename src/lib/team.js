// Teamsale — helper server (ketua marketer & ahli team).
import { parseAmount, calcCOGS } from '@/lib/marketer-calc';

const r2 = n => parseFloat((n || 0).toFixed(2));

// Ahli team seorang ketua
export async function getTeam(admin, leaderId) {
  const { data } = await admin
    .from('profiles')
    .select('id, full_name, email, phone, marketer_code, marketer_whatsapp, is_active, created_at')
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

// Teamsale AKTIF seorang ketua (had: 1 teamsale aktif setiap marketer)
export async function activeTeamsale(admin, leaderId) {
  const { data } = await admin.from('profiles')
    .select('id, full_name, marketer_whatsapp')
    .eq('team_leader_id', leaderId)
    .eq('role', 'marketer')
    .eq('is_active', true)
    .order('created_at')
    .limit(1);
  return data?.[0] || null;
}

/**
 * No. WhatsApp yang dipapar di SP marketer (section "Nak order melalui WhatsApp?").
 * Teamsale aktif yang dah isi nombor → nombor teamsale. Selain itu → nombor marketer sendiri (sandaran).
 * @returns { number, source: 'teamsale' | 'self' | null, teamsale }
 */
export function spWhatsapp(marketer, teamsale) {
  if (teamsale?.marketer_whatsapp) return { number: teamsale.marketer_whatsapp, source: 'teamsale', teamsale };
  if (marketer?.marketer_whatsapp) return { number: marketer.marketer_whatsapp, source: 'self', teamsale: teamsale || null };
  return { number: null, source: null, teamsale: teamsale || null };
}

/**
 * Pemilik order yang dikira untuk seorang marketer:
 * ketua → diri sendiri + SEMUA teamsale dia (aktif & tak aktif — order lama kekal dikira);
 * teamsale / marketer tanpa team → diri sendiri sahaja.
 * @returns { ids: [uuid], names: { [id]: nama }, team: [{ id, full_name }], isTeamsale }
 */
export async function ownerScope(admin, userId) {
  const { data: me } = await admin.from('profiles').select('id, full_name, team_leader_id').eq('id', userId).maybeSingle();
  if (!me || me.team_leader_id) {
    return { ids: [userId], names: { [userId]: me?.full_name || '' }, team: [], isTeamsale: !!me?.team_leader_id };
  }
  const { data: team } = await admin.from('profiles').select('id, full_name').eq('team_leader_id', userId).eq('role', 'marketer');
  const t = team || [];
  return {
    ids: [userId, ...t.map(x => x.id)],
    names: Object.fromEntries([[userId, me.full_name || ''], ...t.map(x => [x.id, x.full_name || 'Teamsale'])]),
    team: t,
    isTeamsale: false,
  };
}

/**
 * Tapis query submissions ikut pemilik order:
 * 'hq' → order HQ · <marketer id> → marketer tu (ketua: termasuk teamsale dia) · 'all'/kosong → semua
 */
export async function applyOwnerFilter(admin, q, owner) {
  if (!owner || owner === 'all') return q;
  if (owner === 'hq') return q.is('marketer_id', null);
  return q.in('marketer_id', (await ownerScope(admin, owner)).ids);
}

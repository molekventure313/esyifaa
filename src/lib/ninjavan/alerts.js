// Amaran order NinjaVan yang mungkin terlepas pandang:
//  1. unpushed     — order SELESAI (dibayar / COD sah), fizikal, belum return, belum dihantar ke NinjaVan > UNPUSHED_DAYS hari
//  2. stalePickup  — parcel masih "Menunggu Pickup" > STALE_PICKUP_DAYS hari selepas dihantar ke NinjaVan (HQ & fighter)
import { isPhysicalOrder } from '@/lib/products';
import { NV_ENV } from './api';
import { latestShipmentsBy, statusGroupOf } from './shipments';

export const UNPUSHED_DAYS = 3;
export const STALE_PICKUP_DAYS = 7;
const PENDING_STATUSES = ['Created', 'Pending Pickup', 'Driver dispatched for Pickup', 'Pickup Exception'];
const DAY = 864e5;
const daysSince = d => Math.floor((Date.now() - new Date(d).getTime()) / DAY);

async function fetchAll(build) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await build().range(from, from + 999);
    if (error) throw error;
    out.push(...(data || []));
    if (!data || data.length < 1000) return out;
  }
}

async function unpushedOrders(db) {
  const before = new Date(Date.now() - UNPUSHED_DAYS * DAY).toISOString();
  const rows = await fetchAll(() => db.from('submissions')
    .select('id, full_name, phone, payment_type, source, created_at')
    .eq('payment_status', 'completed').is('returned_at', null).is('ninjavan_exported_at', null)
    .in('payment_type', ['fpx_payment', 'cod']).lt('created_at', before)
    .order('created_at', { ascending: true }));
  const cand = rows.filter(isPhysicalOrder);
  if (!cand.length) return [];
  // Selamat: abaikan order yang sebenarnya dah ada parcel aktif (cth push sandbox / data lama)
  const nv = await latestShipmentsBy(db, 'submission_id', cand.map(o => o.id)).catch(() => ({}));
  const { data: errs } = await db.from('submissions').select('id, nv_error').in('id', cand.map(o => o.id).slice(0, 500))
    .not('nv_error', 'is', null).then(r => r, () => ({ data: [] }));
  const errOf = Object.fromEntries((errs || []).map(r => [r.id, r.nv_error]));
  return cand
    .filter(o => { const g = statusGroupOf(nv[o.id]); return g === 'none' || g === 'cancelled' || g === 'failed'; })
    .map(o => ({
      id: o.id, name: o.full_name, phone: o.phone, payment_type: o.payment_type,
      created_at: o.created_at, days: daysSince(o.created_at), nv_error: errOf[o.id] || null,
    }));
}

async function stalePickups(db) {
  const before = new Date(Date.now() - STALE_PICKUP_DAYS * DAY).toISOString();
  const rows = await fetchAll(() => db.from('ninjavan_shipments')
    .select('id, submission_id, fighter_order_id, fighter_id, tracking_number, status, event, last_event_at, created_at')
    .eq('env', NV_ENV).in('status', PENDING_STATUSES).lt('created_at', before)
    .order('created_at', { ascending: true }));
  const pending = rows.filter(s => statusGroupOf(s) === 'pending_pickup');
  if (!pending.length) return [];

  // Hanya parcel TERKINI bagi setiap order (parcel lama yang dah diganti diabaikan)
  const hqIds = [...new Set(pending.filter(s => s.submission_id).map(s => s.submission_id))];
  const fIds = [...new Set(pending.filter(s => s.fighter_order_id).map(s => s.fighter_order_id))];
  const [latestHq, latestF] = await Promise.all([
    hqIds.length ? latestShipmentsBy(db, 'submission_id', hqIds) : {},
    fIds.length ? latestShipmentsBy(db, 'fighter_order_id', fIds) : {},
  ]);
  const people = {};
  for (let i = 0; i < hqIds.length; i += 200) {
    const { data } = await db.from('submissions').select('id, full_name, phone, payment_type, returned_at').in('id', hqIds.slice(i, i + 200));
    for (const r of data || []) people[r.id] = r;
  }
  for (let i = 0; i < fIds.length; i += 200) {
    const { data } = await db.from('fighter_orders').select('id, full_name, phone, ship_status').in('id', fIds.slice(i, i + 200));
    for (const r of data || []) people[r.id] = r;
  }

  return pending
    .filter(s => s.submission_id ? latestHq[s.submission_id]?.id === s.id : latestF[s.fighter_order_id]?.id === s.id)
    .filter(s => {
      const p = people[s.submission_id || s.fighter_order_id];
      return p && !p.returned_at && !['cancelled', 'returned'].includes(p.ship_status);
    })
    .map(s => {
      const p = people[s.submission_id || s.fighter_order_id];
      return {
        id: s.submission_id || s.fighter_order_id, fighter: !!s.fighter_order_id, name: p.full_name, phone: p.phone,
        tracking: s.tracking_number, status: s.event || s.status, pushed_at: s.created_at,
        last_event_at: s.last_event_at, days: daysSince(s.created_at),
      };
    });
}

export async function buildNvAlerts(db) {
  const [unpushed, stalePickup] = await Promise.all([unpushedOrders(db), stalePickups(db)]);
  return { unpushed_days: UNPUSHED_DAYS, stale_pickup_days: STALE_PICKUP_DAYS, unpushed, stale_pickup: stalePickup };
}

// Betulkan maklumat penghantaran order (HQ submissions / fighter_orders) supaya boleh dihantar semula ke NinjaVan.
// Server sahaja.
import { checkShipping, joinAddress, normalizeNegeri, normalizePhone } from '@/lib/shipping-validate';
import { latestShipmentsBy, isActiveShipment, isCancellableShipment, cancelShipment } from '@/lib/ninjavan/shipments';
import { logActivity } from '@/lib/utils/logger';

const CFG = {
  submissions:    { col: 'submission_id',    label: 'order' },
  fighter_orders: { col: 'fighter_order_id', label: 'order fighter' },
};

/**
 * @param {object} db admin client
 * @param {{ table: 'submissions'|'fighter_orders', id: string, input: {full_name, phone, street, poskod, daerah, negeri},
 *           cancelParcel?: boolean, actor: { id, name } }} p
 * @returns {Promise<{ order: object, warnings: string[], cancelled: string|null }>}
 */
export async function editShipping(db, { table, id, input, cancelParcel = false, actor }) {
  const cfg = CFG[table];
  if (!cfg) throw new Error('Jadual tidak sah.');
  const { data: o, error } = await db.from(table).select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!o) throw new Error('Order tidak dijumpai.');
  if (o.returned_at) throw new Error('Order dah di-return — tak boleh diubah.');
  if (table === 'fighter_orders' && !['new', 'ready'].includes(o.ship_status)) throw new Error('Order dah dipack / dibatalkan — tak boleh diubah.');

  const next = {
    full_name: String(input.full_name || '').trim().replace(/\s+/g, ' ').slice(0, 120),
    phone: normalizePhone(input.phone),
    address: joinAddress({
      street: String(input.street || '').trim().replace(/\s+/g, ' '),
      poskod: String(input.poskod || '').trim(),
      daerah: String(input.daerah || '').trim().replace(/\s+/g, ' '),
      negeri: normalizeNegeri(input.negeri) || String(input.negeri || '').trim(),
    }),
  };
  const r = checkShipping(next);
  if (r.errors.length) throw new Error(r.errors.join(' · '));

  // Parcel aktif mesti dibatalkan dahulu (hanya jika belum diambil kurier) — SELEPAS maklumat baharu disahkan
  let cancelled = null;
  const sh = (await latestShipmentsBy(db, cfg.col, [id]))[id];
  if (isActiveShipment(sh)) {
    if (!isCancellableShipment(sh)) throw new Error(`Parcel ${sh.tracking_number} dah diambil kurier (${sh.status}) — alamat tak boleh diubah di sini. Hubungi NinjaVan.`);
    if (!cancelParcel) throw Object.assign(new Error(`Order ini ada parcel ${sh.tracking_number} — batal parcel dahulu untuk ubah alamat.`), { needsCancel: true });
    await cancelShipment(db, sh);
    cancelled = sh.tracking_number;
  }

  const now = new Date().toISOString();
  const patch = { ...next, ...(table === 'fighter_orders' ? { updated_at: now } : {}) };
  const { data: saved, error: upErr } = await db.from(table).update(patch).eq('id', id).select('*').single();
  if (upErr) throw upErr;
  // Ralat push lama dikosongkan (migration 042 — abaikan jika kolum belum wujud)
  await db.from(table).update({ nv_error: null, nv_error_at: null }).eq('id', id).then(() => {}, () => {});

  const diff = ['full_name', 'phone', 'address'].filter(k => (o[k] || '') !== next[k]);
  await logActivity(db, {
    userId: actor.id, actionType: 'order_shipping_edit', entityType: table === 'submissions' ? 'submission' : 'fighter_order', entityId: id,
    oldValues: Object.fromEntries(diff.map(k => [k, o[k]])), newValues: Object.fromEntries(diff.map(k => [k, next[k]])),
    description: `${actor.name || 'Admin'} betulkan maklumat penghantaran ${cfg.label} ${next.full_name}${cancelled ? ` (parcel ${cancelled} dibatalkan)` : ''}: ${diff.join(', ') || 'tiada perubahan'}`,
  });
  return { order: saved, warnings: r.warnings, cancelled };
}

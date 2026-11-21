// Kotak packaging sabun garam (SKU KTK-SGH): 1 kotak untuk setiap unit sabun dalam parcel (termasuk sabun add-on).
// Ditolak bila parcel live di-push ke NinjaVan, dipulangkan bila parcel dibatalkan sebelum pickup.
// Parcel COD yang di-return TIDAK memulangkan kotak (kotak dah terpakai).
// Rujukan pergerakan: reference_id = "nv:<ninjavan_shipments.id>" — satu potongan sahaja bagi setiap parcel.
import { getProductBySku } from '@/lib/stock';

export const BOX_SKU = 'KTK-SGH';
const SABUN_SKU = 'SGH-200G';
const refOf = shipment => `nv:${shipment.id}`;

/** Unit sabun dalam parcel: order HQ = stok sabun bersih yang ditolak untuk order itu; order fighter = items */
export async function sabunUnitsOf(db, shipment, sabunProductId) {
  if (shipment.fighter_order_id) {
    const { data: fo } = await db.from('fighter_orders').select('items').eq('id', shipment.fighter_order_id).maybeSingle();
    return (Array.isArray(fo?.items) ? fo.items : []).filter(i => i?.sku === SABUN_SKU).reduce((t, i) => t + (Number(i.qty) || 0), 0);
  }
  if (!shipment.submission_id) return 0;
  const { data: mv } = await db.from('stock_movements').select('movement_type, qty')
    .eq('product_id', sabunProductId).eq('reference_id', shipment.submission_id).in('movement_type', ['out', 'return']);
  const net = (mv || []).reduce((t, m) => t + (m.movement_type === 'out' ? m.qty : -m.qty), 0);
  return Math.max(0, net);
}

/** Tolak kotak untuk satu parcel. Tidak pernah throw — kegagalan dilog sahaja (jangan ganggu push NinjaVan). */
export async function deductBoxesForShipment(db, shipment) {
  try {
    if (!shipment?.id || !shipment.tracking_number || shipment.env !== 'live' || shipment.is_test) return 0;
    const [box, sabun] = await Promise.all([getProductBySku(db, BOX_SKU), getProductBySku(db, SABUN_SKU)]);
    if (!box || !sabun) return 0;
    const { data: done } = await db.from('stock_movements').select('id').eq('product_id', box.id)
      .eq('reference_id', refOf(shipment)).eq('movement_type', 'out').limit(1);
    if (done?.length) return 0;
    const qty = await sabunUnitsOf(db, shipment, sabun.id);
    if (qty <= 0) return 0;
    const { error } = await db.from('stock_movements').insert({
      product_id: box.id, movement_type: 'out', qty, reference_type: 'order', reference_id: refOf(shipment),
      notes: `Kotak sabun — NinjaVan ${shipment.tracking_number}`,
    });
    if (error) throw error;
    return qty;
  } catch (e) {
    console.error('[Stock] tolak kotak gagal (non-blocking):', e.message);
    return 0;
  }
}

/** Pulangkan kotak parcel yang dibatalkan (sekali sahaja). Tidak pernah throw. */
export async function restoreBoxesForShipment(db, shipment) {
  try {
    if (!shipment?.id) return;
    const box = await getProductBySku(db, BOX_SKU);
    if (!box) return;
    const { data: mv } = await db.from('stock_movements').select('movement_type, qty').eq('product_id', box.id).eq('reference_id', refOf(shipment));
    const out = (mv || []).filter(m => m.movement_type === 'out').reduce((t, m) => t + m.qty, 0);
    if (!out || (mv || []).some(m => m.movement_type === 'return')) return;
    await db.from('stock_movements').insert({
      product_id: box.id, movement_type: 'return', qty: out, reference_type: 'return', reference_id: refOf(shipment),
      notes: `Kotak dipulang — parcel NinjaVan ${shipment.tracking_number || ''} dibatalkan`.trim(),
    });
  } catch (e) {
    console.error('[Stock] pulang kotak gagal (non-blocking):', e.message);
  }
}

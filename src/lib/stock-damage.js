// Stok rosak dari parcel return.
// Return pulangkan SEMUA unit ke stok (rekod 'return'); unit yang rosak kemudian ditolak semula sebagai
// movement 'out' + reference_type 'adjustment' (rujukan sama dengan order) + nota "ROSAK (return)".
// → stok bersih betul, order kekal dikira return. Laporan jualan (pnl-report) mengabaikan baris ini.
//
// Rujukan (refId): HQ = submission id · Fighter = 'fighter:<order id>'

export const DAMAGE_REF_TYPE = 'adjustment';
export const DAMAGE_NOTE = 'ROSAK (return)';

export const isDamageMove = m => m.movement_type === 'out' && m.reference_type === DAMAGE_REF_TYPE;

/**
 * Keadaan return + rosak setiap rujukan.
 * @returns {Promise<Record<string, {product_id, sku, name, unit, cost, returned, damaged}[]>>}
 */
export async function damageState(admin, refIds) {
  const ids = [...new Set((refIds || []).filter(Boolean))];
  if (!ids.length) return {};
  const { data, error } = await admin.from('stock_movements')
    .select('product_id, movement_type, reference_type, reference_id, qty, products(sku, name, unit, cost_price)')
    .in('reference_id', ids)
    .in('movement_type', ['return', 'out']);
  if (error) throw error;
  const out = {};
  for (const m of data || []) {
    const isRet = m.movement_type === 'return', isDmg = isDamageMove(m);
    if (!isRet && !isDmg) continue;
    const list = (out[m.reference_id] ||= []);
    let row = list.find(r => r.product_id === m.product_id);
    if (!row) list.push(row = {
      product_id: m.product_id, sku: m.products?.sku || null, name: m.products?.name || m.products?.sku || 'Produk',
      unit: m.products?.unit || 'unit', cost: Number(m.products?.cost_price || 0), returned: 0, damaged: 0,
    });
    if (isRet) row.returned += m.qty; else row.damaged += m.qty;
  }
  return out;
}

/**
 * Rekod unit rosak untuk satu rujukan yang dah di-return.
 * items: [{ product_id, qty }] — qty ≤ unit dipulangkan − rosak sedia ada.
 * @returns {Promise<{ units: number, items: {product_id, sku, qty}[] }>}
 */
export async function recordDamage(admin, { refId, items, reason, label, actorId }) {
  const state = (await damageState(admin, [refId]))[refId] || [];
  if (!state.some(r => r.returned > 0)) throw new Error('Order ini belum ditanda return — stok belum dipulangkan.');
  const want = (items || []).map(i => ({ product_id: i.product_id, qty: parseInt(i.qty, 10) || 0 })).filter(i => i.qty > 0);
  if (!want.length) throw new Error('Isi bilangan unit rosak.');

  const rows = [];
  for (const w of want) {
    const s = state.find(r => r.product_id === w.product_id);
    if (!s) throw new Error('Produk tiada dalam return order ini.');
    const left = s.returned - s.damaged;
    if (w.qty > left) throw new Error(`${s.name}: maksimum ${left} unit lagi boleh ditanda rosak.`);
    rows.push({ s, qty: w.qty });
  }
  const why = String(reason || '').trim().slice(0, 200);
  const note = [DAMAGE_NOTE, label, why].filter(Boolean).join(' — ');
  const { error } = await admin.from('stock_movements').insert(rows.map(({ s, qty }) => ({
    product_id: s.product_id, movement_type: 'out', qty, reference_type: DAMAGE_REF_TYPE, reference_id: refId,
    notes: note, created_by: actorId || null,
  })));
  if (error) throw new Error(`Gagal rekod rosak: ${error.message}`);
  return { units: rows.reduce((t, r) => t + r.qty, 0), items: rows.map(({ s, qty }) => ({ product_id: s.product_id, sku: s.sku, qty })) };
}

/** Batalkan semua rekod rosak satu rujukan (pembetulan). @returns {Promise<{product_id, sku, qty}[]>} dibuang */
export async function clearDamage(admin, refId) {
  const { data } = await admin.from('stock_movements')
    .select('id, product_id, qty, products(sku)')
    .eq('reference_id', refId).eq('movement_type', 'out').eq('reference_type', DAMAGE_REF_TYPE);
  if (!data?.length) return [];
  const { error } = await admin.from('stock_movements').delete().in('id', data.map(d => d.id));
  if (error) throw error;
  return data.map(d => ({ product_id: d.product_id, sku: d.products?.sku || null, qty: d.qty }));
}

// Alat stok MCP E-Syifa (HQ sahaja). Guna jadual products + stock_movements + view stock_summary yang sama
// dengan Dashboard → Stok, jadi halaman stok & laporan P&L terus nampak perubahan.
// Jenis pergerakan:
//   add_stock            → 'in'  / reference_type 'batch'       (sama seperti /api/stock/add)
//   adjust_stock tambah  → 'return' / reference_type 'adjustment' (tidak mengubah kos purata)
//   adjust_stock tolak   → 'out' / reference_type 'adjustment'  (dikira "Rosak", P&L abaikan — bukan jualan)

const fail = msg => Object.assign(new Error(msg), { toolError: true });
const obj = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });
const SKU = { type: 'string', description: 'SKU produk (cth SGH-200G, GPM-500G, KKE-01). Senarai SKU: get_stock.' };

export const STOCK_TOOLS = [
  {
    name: 'get_stock',
    description: 'HQ sahaja: baki stok semasa setiap produk (SKU, baki, purata kos seunit, nilai stok, amaran stok rendah/habis) + pergerakan stok terkini (masuk, keluar order, return, rosak, pelarasan).',
    inputSchema: obj({
      sku: { ...SKU, description: 'Tapis pergerakan ikut SKU (pilihan).' },
      recent: { type: 'integer', description: 'Bilangan pergerakan terkini dipulangkan, 0–50 (lalai 10).' },
    }),
  },
  {
    name: 'add_stock',
    description: 'HQ sahaja: rekod stok MASUK (batch baru dari pembekal), sama seperti "Tambah Stok" di Dashboard → Stok. Kos seunit juga dikemas kini sebagai kos produk terkini. Sahkan SKU, kuantiti & kos dengan pengguna jika kurang jelas.',
    inputSchema: obj({
      sku: SKU,
      qty: { type: 'integer', description: 'Kuantiti unit masuk (> 0)' },
      cost_per_unit: { type: 'number', description: 'Kos seunit RM (≥ 0)' },
      note: { type: 'string', description: 'Nota (cth nama pembekal / no. invois). Kosong = "Batch tambahan <tarikh>".' },
    }, ['sku', 'qty', 'cost_per_unit']),
  },
  {
    name: 'adjust_stock',
    description: 'HQ sahaja: pelarasan stok selepas kiraan fizikal — "decrease" untuk stok rosak/hilang/terpakai (tidak dikira jualan dalam P&L), "increase" untuk stok terjumpa / terkurang kira. Bukan untuk batch baru (guna add_stock). Nota WAJIB.',
    inputSchema: obj({
      sku: SKU,
      qty: { type: 'integer', description: 'Kuantiti unit (> 0)' },
      direction: { type: 'string', enum: ['increase', 'decrease'], description: 'increase = tambah baki, decrease = tolak baki' },
      note: { type: 'string', description: 'Sebab pelarasan (wajib)' },
    }, ['sku', 'qty', 'direction', 'note']),
  },
];
export const STOCK_NAMES = new Set(STOCK_TOOLS.map(t => t.name));

const r2 = n => Math.round((n || 0) * 100) / 100;

async function productBySku(admin, sku) {
  const s = String(sku || '').trim();
  if (!s) throw fail('sku diperlukan.');
  const { data, error } = await admin.from('products').select('id, name, sku, unit, cost_price, is_active').ilike('sku', s).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) {
    const { data: all } = await admin.from('products').select('sku').eq('is_active', true).order('sku');
    throw fail(`SKU "${s}" tidak dijumpai. SKU aktif: ${(all || []).map(p => p.sku).join(', ') || '(tiada)'}`);
  }
  if (data.is_active === false) throw fail(`Produk ${data.sku} tidak aktif.`);
  return data;
}

async function balanceOf(admin, productId) {
  const { data } = await admin.from('stock_summary').select('current_stock, low_stock_threshold').eq('id', productId).maybeSingle();
  return data ? { balance: data.current_stock || 0, low_stock: (data.current_stock || 0) <= (data.low_stock_threshold || 10) } : null;
}

const moveLabel = m => m.movement_type === 'out' && m.reference_type === 'adjustment' ? 'rosak/pelarasan tolak'
  : m.reference_type === 'adjustment' ? 'pelarasan tambah'
  : m.movement_type === 'out' && m.reference_type === 'order' ? 'keluar (order)'
  : { in: 'masuk', out: 'keluar', return: 'return', adjustment: 'pelarasan (tidak dikira)' }[m.movement_type] || m.movement_type;

async function getStock(admin, input) {
  const { data, error } = await admin.from('stock_summary').select('*').eq('is_active', true).order('name');
  if (error) throw new Error(error.message);
  const products = (data || []).map(p => {
    const stock = p.current_stock || 0;
    const avg = p.avg_cost_per_unit ?? p.cost_price ?? 0;
    return {
      sku: p.sku, name: p.name, unit: p.unit, balance: stock, avg_cost_per_unit: r2(avg), cost_price: p.cost_price,
      stock_value: r2(Math.max(0, stock) * avg), low_stock_threshold: p.low_stock_threshold ?? 10,
      status: stock < 0 ? 'NEGATIF (stok masuk belum direkod — semak kiraan fizikal, betulkan dengan adjust_stock)' : stock === 0 ? 'HABIS' : stock <= (p.low_stock_threshold || 10) ? 'RENDAH' : 'OK',
    };
  });
  const recent = Math.min(50, Math.max(0, input.recent ?? 10));
  let movements = [];
  if (recent) {
    let q = admin.from('stock_movements')
      .select('id, movement_type, qty, cost_per_unit, reference_type, notes, created_at, products!inner(sku)')
      .order('created_at', { ascending: false }).limit(recent);
    if (input.sku) q = q.ilike('products.sku', String(input.sku).trim());
    const { data: mv, error: mErr } = await q;
    if (mErr) throw new Error(mErr.message);
    movements = (mv || []).map(m => ({
      id: m.id, at: m.created_at, sku: m.products?.sku, type: moveLabel(m), qty: m.qty,
      cost_per_unit: m.cost_per_unit, note: m.notes,
    }));
  }
  return {
    products, total_value: r2(products.reduce((s, p) => s + p.stock_value, 0)), recent_movements: movements,
    note: 'Baki = masuk + return − keluar. Order COD/FPX menolak stok automatik. Stok masuk: add_stock; kiraan fizikal / rosak: adjust_stock.',
  };
}

async function addStock(admin, actor, input) {
  const p = await productBySku(admin, input.sku);
  const qty = Number(input.qty);
  if (!Number.isInteger(qty) || qty <= 0) throw fail('qty mesti nombor bulat lebih dari 0.');
  const cost = Number(input.cost_per_unit);
  if (!Number.isFinite(cost) || cost < 0) throw fail('cost_per_unit tidak sah (mesti ≥ 0).');
  const { data: mv, error } = await admin.from('stock_movements').insert({
    product_id: p.id, movement_type: 'in', qty, cost_per_unit: cost, reference_type: 'batch',
    notes: String(input.note || '').trim() || `Batch tambahan ${new Date().toLocaleDateString('ms-MY', { timeZone: 'Asia/Kuala_Lumpur' })} (MCP)`,
    created_by: actor,
  }).select('id, created_at').single();
  if (error) throw new Error(error.message);
  if (cost > 0) await admin.from('products').update({ cost_price: cost, updated_at: new Date().toISOString() }).eq('id', p.id);
  return { ok: true, movement_id: mv.id, sku: p.sku, product: p.name, added: qty, cost_per_unit: cost, batch_cost: r2(qty * cost), ...(await balanceOf(admin, p.id)) };
}

async function adjustStock(admin, actor, input) {
  const p = await productBySku(admin, input.sku);
  const qty = Number(input.qty);
  if (!Number.isInteger(qty) || qty <= 0) throw fail('qty mesti nombor bulat lebih dari 0.');
  if (!['increase', 'decrease'].includes(input.direction)) throw fail('direction mesti "increase" atau "decrease".');
  const note = String(input.note || '').trim();
  if (!note) throw fail('note (sebab pelarasan) wajib.');
  const { data: mv, error } = await admin.from('stock_movements').insert({
    product_id: p.id, movement_type: input.direction === 'increase' ? 'return' : 'out', qty,
    reference_type: 'adjustment', notes: `${note} (MCP)`, created_by: actor,
  }).select('id').single();
  if (error) throw new Error(error.message);
  return { ok: true, movement_id: mv.id, sku: p.sku, product: p.name, change: input.direction === 'increase' ? qty : -qty, ...(await balanceOf(admin, p.id)) };
}

export async function callStockTool(admin, keyProfile, name, input, marketer) {
  if (keyProfile.role !== 'super_admin') throw fail('Alat stok hanya untuk akaun HQ.');
  if (marketer) throw fail('Stok adalah stok HQ — jangan isi parameter "marketer".');
  if (name === 'get_stock') return getStock(admin, input);
  if (name === 'add_stock') return addStock(admin, keyProfile.id, input);
  if (name === 'adjust_stock') return adjustStock(admin, keyProfile.id, input);
  throw fail(`Alat tidak dikenali: ${name}`);
}

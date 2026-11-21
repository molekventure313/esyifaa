import { NextResponse } from 'next/server';
import { guard, STAFF } from '@/lib/auth';
import { round2 } from '@/lib/stock-kinds';
import { todayMYT } from '@/lib/stock-ledger';

const rm = n => `RM${Number(n).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * POST /api/stock/add — rekod stok masuk (batch dari pembekal).
 * Body: { product_id, qty, received_at?, supplier?, notes?,
 *         goods_total?, postage?, extra_per_unit?   → kos seunit = (barang + pos) ÷ qty + kos lain seunit
 *         cost_per_unit? }                          → atau kos seunit terus
 * Kos seunit dibundarkan 2 titik perpuluhan.
 */
export async function POST(req) {
  const g = await guard(STAFF);
  if (g.error) return g.error;
  try {
    const b = await req.json();
    const qty = parseInt(b.qty, 10);
    if (!b.product_id) return NextResponse.json({ success: false, error: 'Pilih produk' }, { status: 400 });
    if (!qty || qty <= 0) return NextResponse.json({ success: false, error: 'Kuantiti mesti lebih dari 0' }, { status: 400 });

    const num = v => (v === '' || v == null ? 0 : parseFloat(v));
    const goods = num(b.goods_total), postage = num(b.postage), extra = num(b.extra_per_unit);
    if ([goods, postage, extra].some(v => isNaN(v) || v < 0)) return NextResponse.json({ success: false, error: 'Nilai kos tidak sah' }, { status: 400 });
    const byBreakdown = b.goods_total !== undefined && b.goods_total !== '' && b.goods_total !== null;
    const cost = byBreakdown ? round2((goods + postage) / qty + extra) : round2(parseFloat(b.cost_per_unit));
    if (isNaN(cost) || cost < 0) return NextResponse.json({ success: false, error: 'Kos seunit tidak sah' }, { status: 400 });

    const { data: product } = await g.admin.from('products').select('id, name, sku, unit').eq('id', b.product_id).maybeSingle();
    if (!product) return NextResponse.json({ success: false, error: 'Produk tidak dijumpai' }, { status: 404 });

    const today = todayMYT();
    const date = /^\d{4}-\d{2}-\d{2}$/.test(b.received_at || '') ? b.received_at : today;
    if (date > today) return NextResponse.json({ success: false, error: 'Tarikh terima tidak boleh pada masa depan' }, { status: 400 });

    const parts = [];
    if (String(b.supplier || '').trim()) parts.push(String(b.supplier).trim().slice(0, 80));
    if (byBreakdown) {
      const costParts = [`Barang ${rm(goods)}`];
      if (postage) costParts.push(`Pos/caj ${rm(postage)}`);
      if (extra) costParts.push(`Lain ${rm(extra)}/${product.unit} × ${qty}`);
      parts.push(`${costParts.join(' + ')} = ${rm(goods + postage + extra * qty)}`);
    }
    if (String(b.notes || '').trim()) parts.push(String(b.notes).trim().slice(0, 200));

    const { data: movement, error } = await g.admin.from('stock_movements').insert({
      product_id: product.id, movement_type: 'in', qty, cost_per_unit: cost, reference_type: 'batch',
      notes: parts.join(' · ') || `Batch ${date}`,
      created_by: g.user.id,
      ...(date < today ? { created_at: new Date(`${date}T12:00:00+08:00`).toISOString() } : {}),
    }).select().single();
    if (error) throw error;
    if (cost > 0) await g.admin.from('products').update({ cost_price: cost, updated_at: new Date().toISOString() }).eq('id', product.id);
    return NextResponse.json({ success: true, data: movement, cost_per_unit: cost });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { guard, STAFF } from '@/lib/auth';
import { stockOverview, todayMYT } from '@/lib/stock-ledger';

/**
 * POST /api/stock/count — kiraan fizikal. Body: { counts: [{ product_id, counted }], note?, dry_run? }
 * Jangkaan di rak = baki sistem + order HQ yang belum dipack (stok dah ditolak, barang masih di rak).
 * Beza → pelarasan: kurang = out/adjustment, lebih = return/adjustment (tidak mengubah kos purata).
 * dry_run: true → pulang beza sahaja tanpa rekod.
 */
export async function POST(req) {
  const g = await guard(STAFF);
  if (g.error) return g.error;
  try {
    const { counts = [], note = '', dry_run = false } = await req.json();
    const ov = await stockOverview(g.admin);
    const byId = Object.fromEntries(ov.products.map(p => [p.id, p]));
    const results = [];
    for (const c of counts) {
      const p = byId[c.product_id];
      const counted = parseInt(c.counted, 10);
      if (!p || isNaN(counted) || counted < 0) continue;
      const diff = counted - p.on_shelf;
      results.push({ product_id: p.id, sku: p.sku, name: p.name, unit: p.unit, expected: p.on_shelf, counted, diff, balance_before: p.balance, balance_after: p.balance + diff });
    }
    if (!results.length) return NextResponse.json({ success: false, error: 'Tiada kiraan untuk diproses' }, { status: 400 });
    if (dry_run) return NextResponse.json({ success: true, results });

    const stamp = new Date().toLocaleString('ms-MY', { timeZone: 'Asia/Kuala_Lumpur', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const extra = String(note || '').trim().slice(0, 160);
    const rows = results.filter(r => r.diff !== 0).map(r => ({
      product_id: r.product_id, movement_type: r.diff < 0 ? 'out' : 'return', qty: Math.abs(r.diff), reference_type: 'adjustment',
      reference_id: `count:${todayMYT()}`,
      notes: `Kiraan fizikal ${stamp}: dikira ${r.counted}, jangkaan ${r.expected} (${r.diff > 0 ? '+' : ''}${r.diff})${extra ? ` · ${extra}` : ''}`,
      created_by: g.user.id,
    }));
    if (rows.length) {
      const { error } = await g.admin.from('stock_movements').insert(rows);
      if (error) throw error;
    }
    return NextResponse.json({ success: true, results, adjusted: rows.length });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

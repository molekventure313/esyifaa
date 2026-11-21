import { NextResponse } from 'next/server';
import { guard, STAFF } from '@/lib/auth';
import { stockActivity } from '@/lib/stock-ledger';
import { KINDS, KIND_KEYS } from '@/lib/stock-kinds';

// GET /api/stock/activity?from=YYYY-MM-DD&to=&sku=&kinds=masuk,keluar&q=&group=1&format=csv
export async function GET(req) {
  const g = await guard(STAFF);
  if (g.error) return g.error;
  try {
    const sp = new URL(req.url).searchParams;
    const csv = sp.get('format') === 'csv';
    const data = await stockActivity(g.admin, {
      sku: sp.get('sku') || null,
      kinds: (sp.get('kinds') || '').split(',').filter(k => KIND_KEYS.includes(k)),
      from: sp.get('from'), to: sp.get('to'), q: sp.get('q') || '',
      group: !csv && sp.get('group') !== '0',
    });
    if (!csv) return NextResponse.json({ success: true, data });
    const esc = v => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const head = ['Tarikh', 'SKU', 'Produk', 'Jenis', 'Kuantiti', 'Kos seunit', 'Pelanggan', 'Nota', 'Oleh', ...(data.sku ? ['Baki selepas'] : [])];
    const lines = data.rows.map(r => [
      new Date(r.at).toLocaleString('ms-MY', { timeZone: 'Asia/Kuala_Lumpur' }), r.sku, r.product, KINDS[r.kind]?.label,
      (KINDS[r.kind]?.sign || 1) * r.qty, r.cost_per_unit ?? '', r.customer || '', r.notes || '', r.by || '', ...(data.sku ? [r.balance_after] : []),
    ].map(esc).join(','));
    return new NextResponse('﻿' + [head.join(','), ...lines].join('\n'), {
      headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="stok-${data.sku || 'semua'}-${data.from}-${data.to}.csv"` },
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

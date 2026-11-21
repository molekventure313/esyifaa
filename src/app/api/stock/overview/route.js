import { NextResponse } from 'next/server';
import { guard, STAFF } from '@/lib/auth';
import { stockOverview } from '@/lib/stock-ledger';

// GET /api/stock/overview — baki, di rak, menunggu pack, purata keluar & hari cukup setiap produk
export async function GET() {
  const g = await guard(STAFF);
  if (g.error) return g.error;
  try {
    const data = await stockOverview(g.admin);
    delete data.sku_of;
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

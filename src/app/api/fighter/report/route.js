import { NextResponse } from 'next/server';
import { fighterGuard } from '@/lib/fighter/server';
import { fighterMonthReport, saveManualAds } from '@/lib/fighter/report';

// Fighter — Laporan Saya
// GET ?month=YYYY-MM → P&L bulanan + pecahan harian ikut produk
// PUT { spend_date, product, amount } → simpan ads manual (amount kosong / 0 = padam)
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const g = await fighterGuard();
  if (g.error) return g.error;
  try {
    const data = await fighterMonthReport(g.admin, g.user.id, new URL(req.url).searchParams.get('month'));
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req) {
  const g = await fighterGuard();
  if (g.error) return g.error;
  try {
    const data = await saveManualAds(g.admin, g.user.id, await req.json());
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: e.migration ? 500 : 400 });
  }
}

import { NextResponse } from 'next/server';
import { guard, STAFF } from '@/lib/auth';
import { buildNvAlerts } from '@/lib/ninjavan/alerts';

// GET — amaran: order selesai belum dihantar ke NinjaVan > 3 hari, parcel menunggu pickup > 7 hari
export const dynamic = 'force-dynamic';

export async function GET() {
  const g = await guard(STAFF);
  if (g.error) return g.error;
  try {
    return NextResponse.json({ success: true, ...(await buildNvAlerts(g.admin)) });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

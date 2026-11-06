import { NextResponse } from 'next/server';
import { guard, OWNER } from '@/lib/auth';
import { buildNvSummary } from '@/lib/ninjavan/summary';

// GET ?period=today|yesterday|month|year|all&scope=hq|fighter — Dashboard Pos & COD (parcel dicipta dalam tempoh).
// scope=hq (lalai): parcel order HQ sahaja · scope=fighter: parcel fighter yang guna akaun NinjaVan HQ.
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const g = await guard(OWNER);
  if (g.error) return g.error;
  const sp = new URL(req.url).searchParams;
  try {
    const out = await buildNvSummary(g.admin, { period: sp.get('period') || 'month', scope: sp.get('scope') === 'fighter' ? 'fighter' : 'hq' });
    return NextResponse.json({ success: true, ...out });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { marketerConn, fail } from '@/lib/ads-hub/guard';
import { suggestAngles } from '@/lib/ads-hub/angles';

// AI tag angle untuk ads yang belum ditag (marketer boleh ubah selepas itu)
export const maxDuration = 26;

export async function POST(req) {
  const g = await marketerConn(req);
  if (g.error) return g.error;
  try {
    const r = await suggestAngles(g.admin, g.conn);
    return NextResponse.json({ success: r.ok, ...r }, { status: r.ok ? 200 : 502 });
  } catch (e) { return fail(e); }
}

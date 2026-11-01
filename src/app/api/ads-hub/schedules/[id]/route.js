import { NextResponse } from 'next/server';
import { marketerConn } from '@/lib/ads-hub/guard';
import { cancelSchedule } from '@/lib/ads-hub/automation';

// Batalkan satu tindakan berjadual yang belum jalan
export async function DELETE(req, { params }) {
  const g = await marketerConn();
  if (g.error) return g.error;
  const { id } = await params;
  const r = await cancelSchedule(g.admin, g.user.id, id);
  return NextResponse.json({ success: r.ok, ...r }, { status: r.ok ? 200 : 404 });
}

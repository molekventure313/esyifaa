import { NextResponse } from 'next/server';
import { marketerConn, fail } from '@/lib/ads-hub/guard';
import { executeAction } from '@/lib/ads-hub/actions';

// Marketer putuskan satu amaran/cadangan. Body: { decision: 'approve' | 'dismiss' }
// approve → laksana tindakan yang dicadangkan (jika ada), tertakluk had keselamatan.
export const maxDuration = 26;

export async function POST(req, { params }) {
  const g = await marketerConn();
  if (g.error) return g.error;
  const { id } = await params;
  const { decision } = await req.json().catch(() => ({}));
  try {
    // Kunci: hanya event 'open' boleh diproses, sekali sahaja
    const { data: ev } = await g.admin.from('meta_events').update({ status: decision === 'approve' ? 'executed' : 'dismissed', resolved_at: new Date().toISOString() })
      .eq('id', id).eq('marketer_id', g.user.id).eq('status', 'open').select('*').maybeSingle();
    if (!ev) return NextResponse.json({ success: false, error: 'Item ini dah diproses.' }, { status: 409 });
    if (decision !== 'approve' || !ev.action) return NextResponse.json({ success: true, message: decision === 'approve' ? 'Ditanda selesai.' : 'Diabaikan.' });

    const r = await executeAction(g.admin, g.conn, ev.action, { source: 'cadangan', actorId: g.user.id });
    if (!r.ok) await g.admin.from('meta_events').update({ status: 'failed', detail: `${ev.detail || ''} → ${r.message}` }).eq('id', id);
    return NextResponse.json({ success: r.ok, message: r.message }, { status: r.ok ? 200 : 422 });
  } catch (e) { return fail(e); }
}

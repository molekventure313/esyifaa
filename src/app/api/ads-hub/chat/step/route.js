import { NextResponse } from 'next/server';
import { marketerConn, fail } from '@/lib/ads-hub/guard';
import { loadThread, renderThread, step } from '@/lib/ads-hub/chat';

// Langkah seterusnya dalam perbualan (browser panggil selagi status 'continue')
export const maxDuration = 26;
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const g = await marketerConn(req);
  if (g.error) return g.error;
  const { thread_id } = await req.json().catch(() => ({}));
  try {
    let result;
    try { result = await step(g.admin, g.conn, g.targetProfile, thread_id); }
    catch (e) { if (e.status === 404) throw e; result = { status: 'error', error: e.message }; }
    const loaded = await loadThread(g.admin, g.mid, thread_id);
    return NextResponse.json({ success: true, ...result, thread: renderThread(loaded.thread, loaded.messages) });
  } catch (e) { return fail(e); }
}

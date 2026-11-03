import { NextResponse } from 'next/server';
import { marketerConn, fail } from '@/lib/ads-hub/guard';
import { loadThread, renderThread, confirm } from '@/lib/ads-hub/chat';

// Marketer Sahkan / Batal tindakan yang dicadangkan dalam chat.
// Body: { thread_id, decisions: { [tool_use_id]: 'approve' | 'reject' } }
export const maxDuration = 26;
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const g = await marketerConn(req);
  if (g.error) return g.error;
  const { thread_id, decisions } = await req.json().catch(() => ({}));
  try {
    const result = await confirm(g.admin, g.conn, g.user.id, thread_id, decisions || {});
    const loaded = await loadThread(g.admin, g.mid, thread_id);
    return NextResponse.json({ success: true, ...result, thread: renderThread(loaded.thread, loaded.messages) });
  } catch (e) { return fail(e); }
}

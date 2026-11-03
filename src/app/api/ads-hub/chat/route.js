import { NextResponse } from 'next/server';
import { marketerConn, fail } from '@/lib/ads-hub/guard';
import { loadThread, renderThread, startThread, addUserMessage, step } from '@/lib/ads-hub/chat';

// Chat Ads.
//  GET  ?thread_id=…  → paparan satu perbualan · tanpa thread_id → senarai perbualan terkini
//  POST { thread_id?, message } → tambah mesej marketer + jalankan langkah pertama
export const maxDuration = 26;
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const g = await marketerConn(req);
  if (g.error) return g.error;
  const threadId = new URL(req.url).searchParams.get('thread_id');
  try {
    if (threadId) {
      const loaded = await loadThread(g.admin, g.mid, threadId);
      if (!loaded) return NextResponse.json({ success: false, error: 'Perbualan tidak dijumpai.' }, { status: 404 });
      return NextResponse.json({ success: true, thread: renderThread(loaded.thread, loaded.messages) });
    }
    const { data, error } = await g.admin.from('ads_chat_threads').select('id, title, updated_at, pending')
      .eq('marketer_id', g.mid).eq('archived', false).order('updated_at', { ascending: false }).limit(20);
    if (error) throw error;
    return NextResponse.json({ success: true, threads: (data || []).map(t => ({ id: t.id, title: t.title, updated_at: t.updated_at, pending: !!t.pending })) });
  } catch (e) { return fail(e); }
}

export async function POST(req) {
  const g = await marketerConn(req);
  if (g.error) return g.error;
  const body = await req.json().catch(() => ({}));
  const text = String(body.message || '').trim().slice(0, 4000);
  if (!text) return NextResponse.json({ success: false, error: 'Mesej kosong.' }, { status: 400 });
  try {
    let thread;
    if (body.thread_id) {
      ({ thread } = (await loadThread(g.admin, g.mid, body.thread_id)) || {});
      if (!thread) return NextResponse.json({ success: false, error: 'Perbualan tidak dijumpai.' }, { status: 404 });
    } else {
      thread = await startThread(g.admin, g.mid, text);
    }
    await addUserMessage(g.admin, thread, text);
    let result;
    try { result = await step(g.admin, g.conn, g.profile, thread.id); }
    catch (e) { result = { status: 'error', error: e.message }; }
    const loaded = await loadThread(g.admin, g.mid, thread.id);
    return NextResponse.json({ success: true, ...result, thread: renderThread(loaded.thread, loaded.messages) });
  } catch (e) { return fail(e); }
}

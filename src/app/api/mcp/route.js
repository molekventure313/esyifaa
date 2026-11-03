import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { authKey, callTool, TOOLS, INSTRUCTIONS, SERVER_INFO, PROTOCOL_VERSIONS } from '@/lib/ads-hub/mcp';

// MCP E-Syifa (Streamable HTTP, tanpa sesi, JSON sahaja). Baca sahaja.
// Claude Code: claude mcp add --transport http esyifa https://<domain>/api/mcp --header "Authorization: Bearer esk_…"
// Auth dengan API key (Ads Hub → Tetapan), bukan cookie — route ini public dalam middleware.
export const dynamic = 'force-dynamic';

const rpcError = (id, code, message) => ({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });

async function handle(admin, auth, msg) {
  const { id, method, params } = msg || {};
  if (!msg || msg.jsonrpc !== '2.0' || typeof method !== 'string') return rpcError(id, -32600, 'Invalid Request');
  const isNotification = id === undefined;
  if (isNotification) return null;   // notifications/initialized, cancelled, dll

  if (method === 'initialize') {
    const asked = params?.protocolVersion;
    return {
      jsonrpc: '2.0', id,
      result: {
        protocolVersion: PROTOCOL_VERSIONS.includes(asked) ? asked : PROTOCOL_VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: INSTRUCTIONS,
      },
    };
  }
  if (method === 'ping') return { jsonrpc: '2.0', id, result: {} };
  if (method === 'tools/list') return { jsonrpc: '2.0', id, result: { tools: TOOLS } };
  if (method === 'tools/call') {
    const name = params?.name;
    if (!TOOLS.some(t => t.name === name)) return rpcError(id, -32602, `Unknown tool: ${name}`);
    try {
      const out = await callTool(admin, auth.profile, name, params?.arguments || {});
      return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: JSON.stringify(out) }], structuredContent: out } };
    } catch (e) {
      if (!e.toolError) console.error('[mcp]', name, e);
      return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: e.toolError ? e.message : `Ralat server: ${e.message}` }], isError: true } };
    }
  }
  return rpcError(id, -32601, `Method not found: ${method}`);
}

export async function POST(req) {
  const admin = createAdminClient();
  const auth = await authKey(admin, req.headers.get('authorization'));
  if (!auth) {
    return NextResponse.json(rpcError(null, -32001, 'API key tidak sah atau dibatalkan. Jana key di Ads Hub → Tetapan.'), { status: 401 });
  }
  let body;
  try { body = await req.json(); } catch { return NextResponse.json(rpcError(null, -32700, 'Parse error'), { status: 400 }); }

  const batch = Array.isArray(body);
  const replies = (await Promise.all((batch ? body : [body]).map(m => handle(admin, auth, m)))).filter(Boolean);
  if (!replies.length) return new NextResponse(null, { status: 202 });
  return NextResponse.json(batch ? replies : replies[0]);
}

// Tiada aliran SSE / sesi
export function GET() {
  return new NextResponse('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
}
export function DELETE() {
  return new NextResponse('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
}

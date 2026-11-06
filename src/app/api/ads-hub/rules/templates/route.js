import { NextResponse } from 'next/server';
import { adsHubGuard, marketerConn, fail } from '@/lib/ads-hub/guard';
import { ruleTemplates, applyRuleTemplates } from '@/lib/ads-hub/automation';

// Templat peraturan = peraturan aktif akaun HQ.
// GET → senarai templat · POST { keys? } → salin ke akaun sasaran (marketer sendiri; super_admin: ?marketer=<id>)
export const dynamic = 'force-dynamic';

export async function GET() {
  const g = await adsHubGuard();
  if (g.error) return g.error;
  try {
    return NextResponse.json({ success: true, templates: await ruleTemplates(g.admin) });
  } catch (e) { return fail(e); }
}

export async function POST(req) {
  const g = await marketerConn(req);
  if (g.error) return g.error;
  const body = await req.json().catch(() => ({}));
  try {
    const r = await applyRuleTemplates(g.admin, g.mid, { keys: body.keys, forceSuggest: !g.conn.token_encrypted });
    return NextResponse.json({ success: true, ...r });
  } catch (e) { return fail(e); }
}

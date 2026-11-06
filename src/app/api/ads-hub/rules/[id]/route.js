import { NextResponse } from 'next/server';
import { marketerConn, fail } from '@/lib/ads-hub/guard';
import { updateRule } from '@/lib/ads-hub/automation';

// Ubah (active / mode, atau { rule } = keseluruhan peraturan) atau padam satu peraturan milik marketer
export async function PATCH(req, { params }) {
  const g = await marketerConn(req);
  if (g.error) return g.error;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (body.rule) {
    if (body.rule.mode === 'auto' && !g.conn.token_encrypted) return NextResponse.json({ success: false, error: 'Akaun tanpa token: peraturan hanya boleh mod cadang.' }, { status: 400 });
    const r = await updateRule(g.admin, g.mid, id, body.rule);
    return NextResponse.json({ success: r.ok, ...r, error: r.ok ? undefined : r.message }, { status: r.ok ? 200 : 400 });
  }
  const upd = {};
  if (typeof body.active === 'boolean') upd.active = body.active;
  if (['suggest', 'auto'].includes(body.mode)) upd.mode = body.mode;
  if (!Object.keys(upd).length) return NextResponse.json({ success: false, error: 'Tiada perubahan.' }, { status: 400 });
  const { data, error } = await g.admin.from('meta_rules').update(upd).eq('id', id).eq('marketer_id', g.mid).select('id').maybeSingle();
  if (error) return fail(error);
  if (!data) return NextResponse.json({ success: false, error: 'Peraturan tidak dijumpai.' }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req, { params }) {
  const g = await marketerConn(req);
  if (g.error) return g.error;
  const { id } = await params;
  const { error } = await g.admin.from('meta_rules').delete().eq('id', id).eq('marketer_id', g.mid);
  if (error) return fail(error);
  return NextResponse.json({ success: true });
}

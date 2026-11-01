import { NextResponse } from 'next/server';
import { marketerConn, fail } from '@/lib/ads-hub/guard';

// Ubah (active / mode) atau padam satu peraturan milik marketer
export async function PATCH(req, { params }) {
  const g = await marketerConn();
  if (g.error) return g.error;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const upd = {};
  if (typeof body.active === 'boolean') upd.active = body.active;
  if (['suggest', 'auto'].includes(body.mode)) upd.mode = body.mode;
  if (!Object.keys(upd).length) return NextResponse.json({ success: false, error: 'Tiada perubahan.' }, { status: 400 });
  const { data, error } = await g.admin.from('meta_rules').update(upd).eq('id', id).eq('marketer_id', g.user.id).select('id').maybeSingle();
  if (error) return fail(error);
  if (!data) return NextResponse.json({ success: false, error: 'Peraturan tidak dijumpai.' }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req, { params }) {
  const g = await marketerConn();
  if (g.error) return g.error;
  const { id } = await params;
  const { error } = await g.admin.from('meta_rules').delete().eq('id', id).eq('marketer_id', g.user.id);
  if (error) return fail(error);
  return NextResponse.json({ success: true });
}

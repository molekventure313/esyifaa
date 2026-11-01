import { NextResponse } from 'next/server';
import { guard, OWNER } from '@/lib/auth';
import { tableMissing, MIGRATION_MSG } from '@/lib/fighter/server';

// HQ — urus Fighter (super_admin)
// GET   → senarai fighter + status sambungan + produk (kos) + markup (default & harga khas)
// PATCH { id, is_active }                       → lulus / gantung akaun
// PATCH { markups: [{ scope, sku, markup }] }   → tetapkan markup (scope 'default' atau id fighter)
// PATCH { remove_markup: { scope, sku } }       → buang harga khas fighter (kembali ke default)

export async function GET() {
  const g = await guard(OWNER);
  if (g.error) return g.error;
  try {
    const [{ data: fighters, error: fe }, { data: settings, error: se }, { data: products }, { data: markups, error: me }] = await Promise.all([
      g.admin.from('profiles').select('id, full_name, email, phone, marketer_code, is_active, created_at').eq('role', 'independent').order('created_at', { ascending: false }),
      g.admin.from('fighter_settings').select('fighter_id, chip_brand_id, chip_status, ai_status, whatsapp, meta_pixel_id, sender_name'),
      g.admin.from('products').select('sku, name, unit, cost_price').eq('is_active', true).order('name'),
      g.admin.from('fighter_markups').select('scope, sku, markup'),
    ]);
    const missing = [se, me].find(tableMissing);
    if (missing) throw new Error(MIGRATION_MSG);
    if (fe || se || me) throw (fe || se || me);
    const setOf = Object.fromEntries((settings || []).map(s => [s.fighter_id, s]));
    return NextResponse.json({
      success: true,
      products: (products || []).map(p => ({ ...p, cost_price: Number(p.cost_price || 0) })),
      markups: (markups || []).map(m => ({ ...m, markup: Number(m.markup) })),
      fighters: (fighters || []).map(f => {
        const s = setOf[f.id] || {};
        return {
          ...f,
          chip_ok: s.chip_status === 'ok', ai_ok: s.ai_status === 'ok',
          has_chip: !!s.chip_brand_id, whatsapp: s.whatsapp || null, pixel: !!s.meta_pixel_id, sender_name: s.sender_name || null,
        };
      }),
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  const g = await guard(OWNER);
  if (g.error) return g.error;
  try {
    const b = await req.json();
    const now = new Date().toISOString();

    if (b.id && b.is_active !== undefined) {
      const { data: f } = await g.admin.from('profiles').select('id, role').eq('id', b.id).maybeSingle();
      if (f?.role !== 'independent') throw new Error('Bukan akaun fighter.');
      const { error } = await g.admin.from('profiles').update({ is_active: !!b.is_active, updated_at: now }).eq('id', b.id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (Array.isArray(b.markups)) {
      const rows = b.markups.map(m => {
        const markup = Math.round(Number(m.markup) * 100) / 100;
        if (!m.scope || !m.sku || !Number.isFinite(markup) || markup < 0 || markup > 1000) throw new Error('Markup tidak sah.');
        return { scope: String(m.scope), sku: String(m.sku), markup, updated_at: now };
      });
      if (rows.length) {
        const { error } = await g.admin.from('fighter_markups').upsert(rows, { onConflict: 'scope,sku' });
        if (error) throw new Error(tableMissing(error) ? MIGRATION_MSG : error.message);
      }
      return NextResponse.json({ success: true });
    }

    if (b.remove_markup?.scope && b.remove_markup.scope !== 'default') {
      const { error } = await g.admin.from('fighter_markups').delete().eq('scope', b.remove_markup.scope).eq('sku', b.remove_markup.sku);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    throw new Error('Permintaan tidak sah.');
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
}

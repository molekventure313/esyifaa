import { NextResponse } from 'next/server';
import { spGuard, quotaInfo } from '@/lib/sp-generator/server';
import { SP_PRODUCTS, defaultContent } from '@/lib/sp-generator/products';
import { SLUG_RE, cleanAngle } from '@/lib/sp-generator/schema';

// SP Generator — senarai & bina SP baru
// GET  → SP saya (super_admin: semua SP + nama pemilik) + kuota AI
// POST { product_key, title, slug, angle } → bina draf dengan kandungan permulaan

export async function GET() {
  const g = await spGuard();
  if (g.error) return g.error;
  try {
    let q = g.admin.from('ai_salespages')
      .select('id, owner_id, product_key, slug, title, status, published_at, created_at, updated_at')
      .order('updated_at', { ascending: false }).limit(300);
    if (!g.isOwner) q = q.eq('owner_id', g.user.id);
    const { data, error } = await q;
    if (error) throw new Error(`Jadual SP Generator belum wujud — run migration 022. (${error.message})`);

    let names = {};
    if (g.isOwner) {
      const ids = [...new Set((data || []).map(r => r.owner_id))];
      const { data: people } = ids.length ? await g.admin.from('profiles').select('id, full_name, marketer_code').in('id', ids) : { data: [] };
      names = Object.fromEntries((people || []).map(p => [p.id, p.marketer_code ? `${p.full_name} (${p.marketer_code})` : p.full_name]));
    }
    return NextResponse.json({
      success: true,
      me: g.user.id,
      is_owner: g.isOwner,
      marketer_code: g.profile.marketer_code || null,
      quota: await quotaInfo(g),
      data: (data || []).map(r => ({ ...r, owner_name: names[r.owner_id] || null, mine: r.owner_id === g.user.id })),
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  const g = await spGuard();
  if (g.error) return g.error;
  try {
    const body = await req.json();
    const productKey = body.product_key;
    if (!SP_PRODUCTS[productKey]) return NextResponse.json({ success: false, error: 'Produk tidak sah.' }, { status: 400 });
    const title = String(body.title || '').trim().slice(0, 100);
    if (!title) return NextResponse.json({ success: false, error: 'Isi nama SP.' }, { status: 400 });
    const slug = String(body.slug || '').trim().toLowerCase();
    if (!SLUG_RE.test(slug)) return NextResponse.json({ success: false, error: 'Link tidak sah — guna huruf kecil, nombor & sengkang (3-50 aksara).' }, { status: 400 });

    const content = defaultContent(productKey);
    content.meta.title = title;
    const { data, error } = await g.admin.from('ai_salespages').insert({
      owner_id: g.user.id, product_key: productKey, slug, title, angle: cleanAngle(body.angle), content,
    }).select('id').single();
    if (error) {
      if (error.code === '23505') return NextResponse.json({ success: false, error: `Link /s/${slug} sudah digunakan — pilih link lain.` }, { status: 409 });
      throw error;
    }
    return NextResponse.json({ success: true, id: data.id });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { adsHubGuard, targetMarketer, writeTarget, fail, tableMissing, MIGRATION_MSG } from '@/lib/ads-hub/guard';
import { campaignProducts, fillAdsSpend, cacheRange, PRODUCT_OPTIONS } from '@/lib/ads-hub/spend';
import { AD_PRODUCT_KEYS } from '@/lib/products';

// Produk setiap campaign (pecahan ads spend automatik ikut produk).
//  GET               → senarai campaign + produk (manual / teka / default)
//  PUT { campaign_id, product }  → tetapkan produk (product kosong = kembali teka automatik), isi semula ads spend
export const maxDuration = 26;
export const dynamic = 'force-dynamic';

const bad = (msg, status = 400) => NextResponse.json({ success: false, error: msg }, { status });

async function loadConn(admin, id) {
  const { data, error } = await admin.from('meta_connections').select('*').eq('marketer_id', id).maybeSingle();
  if (error) throw Object.assign(new Error(tableMissing(error) ? MIGRATION_MSG : error.message), { status: 500 });
  return data;
}

export async function GET(req) {
  const g = await adsHubGuard();
  if (g.error) return g.error;
  const t = targetMarketer(g, new URL(req.url).searchParams.get('marketer'));
  try {
    const conn = await loadConn(g.admin, t.id);
    if (!conn) return NextResponse.json({ success: true, campaigns: [], products: PRODUCT_OPTIONS });
    const campaigns = await campaignProducts(g.admin, conn);
    campaigns.sort((a, b) => (a.status === 'ACTIVE' ? 0 : 1) - (b.status === 'ACTIVE' ? 0 : 1) || String(a.campaign_name).localeCompare(String(b.campaign_name)));
    return NextResponse.json({ success: true, campaigns, products: PRODUCT_OPTIONS });
  } catch (e) { return fail(e); }
}

export async function PUT(req) {
  const g = await adsHubGuard();
  if (g.error) return g.error;
  const t = await writeTarget(g, req);
  if (t.error) return t.error;
  const { campaign_id, product } = await req.json().catch(() => ({}));
  if (!campaign_id) return bad('Campaign tidak sah.');
  if (product && !AD_PRODUCT_KEYS.includes(product)) return bad('Produk tidak sah.');
  try {
    const conn = await loadConn(g.admin, t.id);
    if (!conn) return bad('Sambung akaun Meta dulu.');
    const q = g.admin.from('meta_campaign_products');
    const { error } = product
      ? await q.upsert({ marketer_id: t.id, campaign_id: String(campaign_id), product, updated_at: new Date().toISOString() }, { onConflict: 'marketer_id,campaign_id' })
      : await q.delete().eq('marketer_id', t.id).eq('campaign_id', String(campaign_id));
    if (error) return bad(tableMissing(error) ? MIGRATION_MSG : error.message, 500);
    const spend = await fillAdsSpend(g.admin, conn, cacheRange());
    return NextResponse.json({ success: true, spend });
  } catch (e) { return fail(e); }
}

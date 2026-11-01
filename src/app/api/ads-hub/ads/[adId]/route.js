import { NextResponse } from 'next/server';
import { adsHubGuard } from '@/lib/ads-hub/guard';

// Tag angle satu ad (milik marketer sendiri). Kosong = kembali guna nama adset.
export async function PATCH(req, { params }) {
  const g = await adsHubGuard();
  if (g.error) return g.error;
  if (g.isOwner) return NextResponse.json({ success: false, error: 'Tag angle diurus oleh marketer.' }, { status: 403 });
  const { adId } = await params;
  const body = await req.json().catch(() => ({}));
  const angle = String(body.angle || '').trim().slice(0, 60) || null;

  const { data, error } = await g.admin.from('meta_ads')
    .update({ angle }).eq('ad_id', adId).eq('marketer_id', g.user.id).select('ad_id').maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ success: false, error: 'Ad tidak dijumpai.' }, { status: 404 });
  return NextResponse.json({ success: true, angle });
}

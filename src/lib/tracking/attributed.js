import { sendCAPIEvent, sendFpxCAPIEvent, sendCAPIEventToPixel } from '@/lib/tracking/capi';

/**
 * Hantar CAPI event ke pixel yang BETUL ikut pemilik order/lead.
 *
 * - Order/lead marketer → pixel marketer SAHAJA (perlukan meta_pixel_id + meta_access_token).
 *   Kalau marketer tiada pixel/token → SKIP. Jangan sesekali fallback ke pixel HQ —
 *   ini yang sebabkan Purchase HQ melambung tapi order sebenar masuk marketer.
 * - Order/lead HQ → pixel HQ ('fpx' = pixel Purchase FPX, 'main' = pixel utama/Lead).
 *
 * @param {object} opts
 * @param {object} opts.supabase   admin client
 * @param {string|null} opts.marketerId
 * @param {'fpx'|'main'} opts.hqPixel  pixel HQ untuk order bukan-marketer
 * @param {object} opts.event      params CAPI (eventName, eventId, sourceUrl, userData, customData, ...)
 */
export async function sendAttributedCAPIEvent({ supabase, marketerId, hqPixel = 'fpx', event }) {
  if (marketerId) {
    const { data: mProfile } = await supabase
      .from('profiles')
      .select('meta_pixel_id, meta_access_token')
      .eq('id', marketerId)
      .maybeSingle();

    if (mProfile?.meta_pixel_id && mProfile?.meta_access_token) {
      return sendCAPIEventToPixel({
        pixelId: mProfile.meta_pixel_id,
        accessToken: mProfile.meta_access_token,
        ...event,
      });
    }

    console.warn(`CAPI ${event.eventName} skipped — marketer ${marketerId} tiada pixel/access token (tidak fallback ke HQ)`);
    return null;
  }

  return hqPixel === 'main' ? sendCAPIEvent(event) : sendFpxCAPIEvent(event);
}

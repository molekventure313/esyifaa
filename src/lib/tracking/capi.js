import { hashUserData } from '../utils/hash';
import { createAdminClient } from '../supabase/admin';

// ─── MAIN PIXEL CACHE ───
let _cachedConfig = null;
let _cacheExpiry = 0;
const CACHE_TTL_MS = 60 * 1000;

// ─── FPX PIXEL CACHE ───
let _cachedFpxConfig = null;
let _fpxCacheExpiry = 0;

export function resetTrackingCache() {
  _cachedConfig = null;
  _cacheExpiry = 0;
}

export function resetFpxTrackingCache() {
  _cachedFpxConfig = null;
  _fpxCacheExpiry = 0;
}

// ─── Fetch Main Pixel Config ───
async function getTrackingConfig() {
  const now = Date.now();
  if (_cachedConfig && now < _cacheExpiry) return _cachedConfig;

  try {
    const adminClient = createAdminClient();
    const { data } = await adminClient
      .from('tracking_config')
      .select('meta_pixel_id, meta_access_token, meta_test_event_code, is_active')
      .limit(1)
      .single();

    if (data?.is_active && data?.meta_pixel_id && data?.meta_access_token) {
      _cachedConfig = {
        pixelId: data.meta_pixel_id,
        accessToken: data.meta_access_token,
        testEventCode: data.meta_test_event_code || null,
      };
    } else {
      _cachedConfig = null;
    }

    _cacheExpiry = now + CACHE_TTL_MS;
    return _cachedConfig;
  } catch (err) {
    console.warn('getTrackingConfig error:', err?.message);
    const pixelId = process.env.META_PIXEL_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;
    if (pixelId && accessToken) {
      return { pixelId, accessToken, testEventCode: process.env.META_TEST_EVENT_CODE || null };
    }
    return null;
  }
}

// ─── Fetch FPX Pixel Config ───
async function getFpxTrackingConfig() {
  const now = Date.now();
  if (_cachedFpxConfig && now < _fpxCacheExpiry) return _cachedFpxConfig;

  try {
    const adminClient = createAdminClient();
    const { data } = await adminClient
      .from('tracking_config')
      .select('fpx_pixel_id, fpx_access_token, fpx_test_event_code, fpx_is_active')
      .limit(1)
      .single();

    if (data?.fpx_is_active && data?.fpx_pixel_id && data?.fpx_access_token) {
      _cachedFpxConfig = {
        pixelId: data.fpx_pixel_id,
        accessToken: data.fpx_access_token,
        testEventCode: data.fpx_test_event_code || null,
      };
    } else {
      _cachedFpxConfig = null;
    }

    _fpxCacheExpiry = now + CACHE_TTL_MS;
    return _cachedFpxConfig;
  } catch (err) {
    console.warn('getFpxTrackingConfig error:', err?.message);
    return null;
  }
}

// ─── Send CAPI Event (Main Pixel — Lead, etc.) ───
export async function sendCAPIEvent({
  eventName,
  eventId,
  eventTime = Math.floor(Date.now() / 1000),
  sourceUrl,
  userData = {},
  customData = {},
  clientIpAddress,
  clientUserAgent,
  fbp,
  fbc,
  actionSource = 'website'
}) {
  const config = await getTrackingConfig();
  if (!config) {
    console.warn('Meta CAPI (main) credentials missing or disabled, skipping.');
    return null;
  }
  return _sendToMeta({ config, eventName, eventId, eventTime, sourceUrl, userData, customData, clientIpAddress, clientUserAgent, fbp, fbc, actionSource });
}

// ─── Send CAPI Event (FPX Pixel — Purchase, InitiateCheckout) ───
export async function sendFpxCAPIEvent({
  eventName,
  eventId,
  eventTime = Math.floor(Date.now() / 1000),
  sourceUrl,
  userData = {},
  customData = {},
  clientIpAddress,
  clientUserAgent,
  fbp,
  fbc,
  actionSource = 'website'
}) {
  const config = await getFpxTrackingConfig();
  if (!config) {
    console.warn('Meta CAPI (FPX) credentials missing or disabled, skipping.');
    return null;
  }
  return _sendToMeta({ config, eventName, eventId, eventTime, sourceUrl, userData, customData, clientIpAddress, clientUserAgent, fbp, fbc, actionSource });
}

// ─── Send CAPI Event to a specific pixel (marketer pixel) ───
export async function sendCAPIEventToPixel({
  pixelId,
  accessToken,
  testEventCode = null,
  eventName,
  eventId,
  eventTime = Math.floor(Date.now() / 1000),
  sourceUrl,
  userData = {},
  customData = {},
  clientIpAddress,
  clientUserAgent,
  fbp,
  fbc,
  actionSource = 'website'
}) {
  if (!pixelId || !accessToken) {
    console.warn('sendCAPIEventToPixel: pixelId or accessToken missing, skipping.');
    return null;
  }
  return _sendToMeta({ config: { pixelId, accessToken, testEventCode }, eventName, eventId, eventTime, sourceUrl, userData, customData, clientIpAddress, clientUserAgent, fbp, fbc, actionSource });
}

// ─── Shared Meta Graph API sender ───
async function _sendToMeta({ config, eventName, eventId, eventTime, sourceUrl, userData, customData, clientIpAddress, clientUserAgent, fbp, fbc, actionSource }) {
  const { pixelId, accessToken, testEventCode } = config;

  try {
    const hashedUser = hashUserData(userData);

    const eventPayload = {
      data: [{
        event_name: eventName,
        event_time: eventTime,
        action_source: actionSource,
        event_id: eventId,
        event_source_url: sourceUrl,
        user_data: {
          ...hashedUser,
          client_ip_address: clientIpAddress,
          client_user_agent: clientUserAgent,
          fbc,
          fbp,
        },
        custom_data: customData,
      }]
    };

    if (testEventCode) {
      eventPayload.test_event_code = testEventCode;
    }

    const response = await fetch(`https://graph.facebook.com/v18.0/${pixelId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...eventPayload, access_token: accessToken }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to send Meta CAPI event:', error);
    return null;
  }
}

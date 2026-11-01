// Ads Hub — cadangan tag angle oleh Claude untuk ads yang belum ditag (server sahaja).
import { callClaude, textOf } from './ai';

const SCHEMA = {
  type: 'json_schema',
  schema: {
    type: 'object',
    properties: {
      tags: {
        type: 'array',
        items: {
          type: 'object',
          properties: { ad_id: { type: 'string' }, angle: { type: 'string' } },
          required: ['ad_id', 'angle'], additionalProperties: false,
        },
      },
    },
    required: ['tags'], additionalProperties: false,
  },
};

export async function suggestAngles(admin, conn) {
  const { data: ads } = await admin.from('meta_ads').select('ad_id, name, headline, adset_name, campaign_name')
    .eq('marketer_id', conn.marketer_id).is('angle', null).neq('status', 'ARCHIVED').limit(80);
  if (!ads?.length) return { ok: true, tagged: 0 };
  const { data: tagged } = await admin.from('meta_ads').select('angle').eq('marketer_id', conn.marketer_id).not('angle', 'is', null);
  const existing = [...new Set((tagged || []).map(t => t.angle))];

  const res = await callClaude({
    system: [{ type: 'text', text: 'Anda tag angle iklan E-Syifa (produk rawatan Islam). Angle = masalah/emosi utama yang ad sasarkan, 1–3 perkataan Bahasa Melayu (contoh: Lebam, Gatal Malam, Gangguan Rumah, Rezeki Niaga, Emosi). Ads dengan masalah sama mesti dapat angle yang sama. Guna semula angle sedia ada jika sesuai.' }],
    messages: [{ role: 'user', content: `Angle sedia ada: ${JSON.stringify(existing)}\nAds:\n${JSON.stringify(ads)}` }],
    maxTokens: 4000,
    format: SCHEMA,
  });
  if (res.stop_reason === 'refusal') return { ok: false, error: 'AI menolak permintaan.' };
  let tags = [];
  try { tags = JSON.parse(textOf(res)).tags || []; } catch (_) { return { ok: false, error: 'Jawapan AI tidak sah.' }; }

  const valid = new Set(ads.map(a => a.ad_id));
  let count = 0;
  for (const t of tags) {
    const angle = String(t.angle || '').trim().slice(0, 60);
    if (!valid.has(t.ad_id) || !angle) continue;
    const { error } = await admin.from('meta_ads').update({ angle }).eq('ad_id', t.ad_id).eq('marketer_id', conn.marketer_id).is('angle', null);
    if (!error) count++;
  }
  return { ok: true, tagged: count };
}

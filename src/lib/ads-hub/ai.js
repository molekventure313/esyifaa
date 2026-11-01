// Ads Hub — panggilan Claude (server sahaja).
import Anthropic from '@anthropic-ai/sdk';

export const AI_MODEL = 'claude-opus-5-5';
export const CHAT_QUOTA_MONTH = 400;   // panggilan model (langkah chat) sebulan / marketer

let client;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw Object.assign(new Error('AI belum diaktifkan — tambah ANTHROPIC_API_KEY di Netlify env.'), { status: 503 });
  }
  // Function Netlify dihadkan ±26 saat — jangan cuba semula di dalam satu permintaan
  client ??= new Anthropic({ timeout: 22000, maxRetries: 0 });
  return client;
}

/**
 * Satu panggilan Messages API. Fallback server-side ("default") aktif: jika model menolak atas sebab
 * polisi, API cuba semula pada model fallback yang disyorkan dalam panggilan yang sama.
 */
export async function callClaude({ system, messages, tools, maxTokens = 8000, effort = 'low', format }) {
  try {
    return await getClient().beta.messages.create({
      model: AI_MODEL,
      max_tokens: maxTokens,
      system,
      messages,
      ...(tools ? { tools } : {}),
      output_config: { effort, ...(format ? { format } : {}) },
      cache_control: { type: 'ephemeral' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
    });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) throw Object.assign(new Error('AI sibuk sekarang — cuba lagi sebentar.'), { status: 503 });
    if (e instanceof Anthropic.APIConnectionTimeoutError) throw Object.assign(new Error('AI ambil masa terlalu lama — cuba lagi.'), { status: 504 });
    if (e instanceof Anthropic.AuthenticationError) throw Object.assign(new Error('ANTHROPIC_API_KEY tidak sah.'), { status: 503 });
    if (e instanceof Anthropic.APIError) throw Object.assign(new Error(`AI gagal (${e.status ?? 'rangkaian'}): ${e.message}`), { status: 502 });
    throw e;
  }
}

export const textOf = msg => (msg.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();

const MYT_MS = 8 * 3600 * 1000;
export const nowMyt = () => new Date(Date.now() + MYT_MS).toISOString().slice(0, 16).replace('T', ' ');

import { NextResponse } from 'next/server';
import {
  spGuard, loadOwnSp, usageThisMonth, callClaude, logAi,
  AI_MODEL_MAIN, AI_MODEL_FAST, QUOTA_FULL, QUOTA_CALLS,
} from '@/lib/sp-generator/server';
import { ANGLE_SECTIONS, sectionJsonSchema, sanitizeContent } from '@/lib/sp-generator/schema';
import { SYSTEM_PROMPT, BRIEF_SCHEMA, briefPrompt, sectionPrompt } from '@/lib/sp-generator/prompts';

// SP Generator — AI (Claude). Dipanggil dari editor, SATU langkah setiap request (elak timeout function):
//   { step: 'brief' }                                   → strategi angle (= 1 kuota "jana penuh")
//   { step: 'section', section, brief }                 → tulis satu section (editor panggil selari)
//   { step: 'rewrite', section, brief, current, instruction } → tulis semula satu section
// Hasil TIDAK disimpan di sini — editor gabungkan ke draf & simpan (PATCH).

export const maxDuration = 26;

// Buang ✅ / • / nombor di awal item senarai — paparan SP dah ada ikon sendiri
const stripLead = v => (typeof v === 'string' ? v.replace(/^[\s✅✓✔️☑️•\-–*]+|^\d+[.)]\s*/u, '').trim() : v);
function tidyLists(obj) {
  for (const [k, v] of Object.entries(obj || {})) {
    if (Array.isArray(v)) obj[k] = v.map(x => (typeof x === 'string' ? stripLead(x) : x));
  }
  return obj;
}

export async function POST(req, { params }) {
  const g = await spGuard();
  if (g.error) return g.error;
  const { id } = await params;
  const r = await loadOwnSp(g, id);
  if (r.error) return r.error;
  const sp = r.sp;

  try {
    const body = await req.json();
    const step = body.step;

    // Kuota bulanan (super_admin tanpa had)
    if (!g.isOwner) {
      const used = await usageThisMonth(g.admin, g.user.id);
      if (step === 'brief' && used.full >= QUOTA_FULL) {
        return NextResponse.json({ success: false, error: `Kuota jana penuh bulan ini dah habis (${QUOTA_FULL}/${QUOTA_FULL}). Anda masih boleh edit teks secara manual.` }, { status: 429 });
      }
      if (step !== 'brief' && used.calls >= QUOTA_CALLS) {
        return NextResponse.json({ success: false, error: `Kuota AI bulan ini dah habis (${QUOTA_CALLS}). Anda masih boleh edit teks secara manual.` }, { status: 429 });
      }
    }

    if (step === 'brief') {
      const res = await callClaude({
        system: SYSTEM_PROMPT, prompt: briefPrompt(sp.product_key, sp.angle),
        toolName: 'strategi_angle', schema: BRIEF_SCHEMA, maxTokens: 4000,
      });
      await logAi(g.admin, { userId: g.user.id, spId: sp.id, kind: 'brief', model: res.model, usage: res.usage });
      return NextResponse.json({ success: true, data: res.data });
    }

    if (step === 'section' || step === 'rewrite') {
      const key = body.section;
      if (!ANGLE_SECTIONS[key]) return NextResponse.json({ success: false, error: 'Section tidak sah.' }, { status: 400 });
      const brief = body.brief && typeof body.brief === 'object' && JSON.stringify(body.brief).length <= 4000
        ? body.brief : sp.content?.brief;
      if (!brief) return NextResponse.json({ success: false, error: 'Jana strategi angle dahulu.' }, { status: 400 });

      const rewrite = step === 'rewrite';
      const current = rewrite ? sanitizeContent({ [key]: body.current })[key] : null;
      if (current) delete current.image;
      const res = await callClaude({
        model: rewrite ? AI_MODEL_FAST : AI_MODEL_MAIN,
        system: SYSTEM_PROMPT,
        prompt: sectionPrompt(sp.product_key, sp.angle, brief, key, rewrite ? { current, instruction: String(body.instruction || '').slice(0, 400) } : {}),
        toolName: `section_${key}`, schema: sectionJsonSchema(key), maxTokens: 4000,
      });
      await logAi(g.admin, { userId: g.user.id, spId: sp.id, kind: step, model: res.model, usage: res.usage });
      const data = tidyLists(sanitizeContent({ [key]: res.data })[key]);
      delete data.image;   // gambar tidak diubah oleh AI
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: false, error: 'Langkah tidak sah.' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: e.status || 500 });
  }
}

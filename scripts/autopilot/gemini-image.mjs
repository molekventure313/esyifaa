// Autopilot HQ — jana gambar latar ad dengan Gemini (Nano Banana). Key TIDAK pernah dicetak.
// Env (.env.local): GEMINI_API_KEY (wajib), GEMINI_IMAGE_MODEL (pilihan, lalai gemini-3.1-flash-image)
//
//   node scripts/autopilot/gemini-image.mjs --check
//        → semak key + senarai model gambar yang tersedia
//   node scripts/autopilot/gemini-image.mjs --prompt-file prompt.txt --out bg.jpg [--aspect 4:5] [--n 3]
//        [--ref produk.jpg --ref gaya.jpg] [--model <id>] [--size 1K|2K|4K]
//        → --n 3 menghasilkan bg-1.jpg, bg-2.jpg, bg-3.jpg (variasi). --ref = gambar rujukan (produk sebenar, gaya).
//
// Gemini hanya lukis VISUAL. Teks hook / harga / logo ditindih dengan templat HTML (render-iklan-gambar.py)
// supaya ejaan Bahasa Melayu tepat — jadi prompt mesti minta "no text, no letters, no logos".
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..', '..');
const env = {};
for (const f of ['.env.local', '.env']) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  for (const l of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(l);
    if (m && !(m[1] in env)) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
}
const KEY = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;
const API = 'https://generativelanguage.googleapis.com/v1beta';

const args = process.argv.slice(2);
const arg = name => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const all = name => args.flatMap((a, i) => (a === `--${name}` ? [args[i + 1]] : []));
const die = msg => { console.error(`RALAT: ${msg}`); process.exitCode = 1; throw Object.assign(new Error(msg), { quiet: true }); };
process.on('uncaughtException', e => { if (!e.quiet) console.error(e); process.exitCode = 1; });

if (!KEY) die('GEMINI_API_KEY tiada dalam .env.local');
const H = { 'x-goog-api-key': KEY, 'Content-Type': 'application/json' };
// Mesej ralat Google kadang ulang URL permintaan — buang key jika ada
const clean = s => s.split(KEY).join('***');

async function api(p, init = {}) {
  const r = await fetch(`${API}${p}`, { ...init, headers: { ...H, ...(init.headers || {}) } });
  const text = await r.text();
  if (!r.ok) die(`Gemini ${r.status}: ${clean(text).slice(0, 400)}`);
  return JSON.parse(text);
}

if (args.includes('--check')) {
  const models = [];
  let token = '';
  do {
    const j = await api(`/models?pageSize=200${token ? `&pageToken=${token}` : ''}`);
    models.push(...(j.models || []));
    token = j.nextPageToken || '';
  } while (token);
  const img = models.filter(m => /image/i.test(m.name) && (m.supportedGenerationMethods || []).includes('generateContent'));
  console.log('Key OK.\n\nModel gambar (generateContent):');
  for (const m of img) console.log(`  ${m.name.replace('models/', '')}  —  ${m.displayName || ''}`);
  console.log(`\nTetapan semasa: GEMINI_IMAGE_MODEL=${env.GEMINI_IMAGE_MODEL || '(lalai gemini-3.1-flash-image)'}`);
} else {
  await generate();
}

// process.exit() semasa sambungan fetch masih terbuka mencetuskan assertion libuv di Windows — keluar secara semula jadi
async function generate() {

const model = arg('model') || process.env.GEMINI_IMAGE_MODEL || env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image';
const out = arg('out');
const aspect = arg('aspect') || '4:5';
const n = Math.max(1, Math.min(6, parseInt(arg('n') || '1', 10) || 1));
// Baris bermula '#' dalam fail prompt = nota templat, tidak dihantar ke Gemini
const prompt = arg('prompt') || (arg('prompt-file')
  ? fs.readFileSync(arg('prompt-file'), 'utf8').split(/\r?\n/).filter(l => !l.startsWith('#')).join('\n').trim() : '');
if (!out || !prompt) die('Guna: --prompt-file <prompt.txt> (atau --prompt "...") --out <bg.jpg> [--aspect 4:5] [--n 3] [--ref gambar.jpg]');
if (/\{\{[^}]*\}\}/.test(prompt)) die(`Prompt masih ada ruang templat belum diisi: ${prompt.match(/\{\{[^}]*\}\}/g).slice(0, 3).join(', ')}`);
if (!['1:1', '4:5', '9:16', '16:9', '3:4', '4:3'].includes(aspect)) die('--aspect mesti 1:1, 4:5, 9:16, 16:9, 3:4 atau 4:3');

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const refs = all('ref').map(f => {
  const mime = MIME[path.extname(f).toLowerCase()];
  if (!mime) die(`Rujukan ${f}: hanya jpg / png / webp`);
  return { inline_data: { mime_type: mime, data: fs.readFileSync(f).toString('base64') } };
});

fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
const ext = path.extname(out) || '.jpg';
const base = out.slice(0, out.length - ext.length);

for (let i = 1; i <= n; i++) {
  const j = await api(`/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [...refs, { text: prompt }] }],
      generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: aspect, ...(arg('size') ? { imageSize: arg('size') } : {}) } },
    }),
  });
  const parts = j.candidates?.[0]?.content?.parts || [];
  const img = parts.find(p => p.inlineData || p.inline_data);
  if (!img) {
    const why = j.candidates?.[0]?.finishReason || j.promptFeedback?.blockReason || 'tiada gambar';
    const note = parts.find(p => p.text)?.text || '';
    die(`Gemini tidak pulangkan gambar (${why}). ${note.slice(0, 300)}`);
  }
  const data = img.inlineData || img.inline_data;
  const mime = data.mimeType || data.mime_type || 'image/png';
  // Simpan ikut format sebenar (png/jpg) — templat HTML terima kedua-duanya
  const realExt = mime.includes('png') ? '.png' : '.jpg';
  const file = `${n > 1 ? `${base}-${i}` : base}${realExt}`;
  const buf = Buffer.from(data.data, 'base64');
  fs.writeFileSync(file, buf);
  console.log(`OK: ${file} (${(buf.length / 1024).toFixed(0)} KB, ${aspect}, model ${model})`);
}
}

// Autopilot HQ — VO dengan ElevenLabs (dijalankan di PC oleh Claude). Key TIDAK pernah dicetak.
// Env (.env.local): ELEVENLABS_API_KEY (wajib), ELEVENLABS_VOICE_ID, ELEVENLABS_MODEL_ID
//
//   node scripts/autopilot/tts.mjs --check                       → semak key, senarai model & suara
//   node scripts/autopilot/tts.mjs --text-file vo.txt --out vo.mp3 [--voice <id>] [--model <id>]
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
const KEY = process.env.ELEVENLABS_API_KEY || env.ELEVENLABS_API_KEY;
const API = 'https://api.elevenlabs.io/v1';

const args = process.argv.slice(2);
const arg = name => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const die = msg => { console.error(`RALAT: ${msg}`); process.exit(1); };

if (!KEY) die('ELEVENLABS_API_KEY tiada dalam .env.local');
const H = { 'xi-api-key': KEY };

async function api(p, init = {}) {
  const r = await fetch(`${API}${p}`, { ...init, headers: { ...H, ...(init.headers || {}) } });
  if (!r.ok) {
    const t = await r.text().catch(() => '');
    die(`ElevenLabs ${r.status}: ${t.slice(0, 300)}`);
  }
  return r;
}

if (args.includes('--check')) {
  const [models, voices] = await Promise.all([api('/models').then(r => r.json()), api('/voices').then(r => r.json())]);
  console.log('Key OK.');
  console.log('\nModel TTS:');
  for (const m of models.filter(m => m.can_do_text_to_speech)) console.log(`  ${m.model_id}  —  ${m.name}`);
  console.log('\nSuara dalam akaun:');
  for (const v of voices.voices || []) console.log(`  ${v.voice_id}  —  ${v.name}${v.labels?.accent ? ` (${v.labels.accent})` : ''}`);
  console.log(`\nTetapan semasa: VOICE=${env.ELEVENLABS_VOICE_ID || '(tiada)'} MODEL=${env.ELEVENLABS_MODEL_ID || '(tiada)'}`);
  process.exit(0);
}

const textFile = arg('text-file');
const out = arg('out');
const voice = arg('voice') || process.env.ELEVENLABS_VOICE_ID || env.ELEVENLABS_VOICE_ID;
const model = arg('model') || process.env.ELEVENLABS_MODEL_ID || env.ELEVENLABS_MODEL_ID;
if (!textFile || !out) die('Guna: --text-file <fail.txt> --out <fail.mp3>');
if (!voice) die('ELEVENLABS_VOICE_ID tiada (tetapkan dalam .env.local atau --voice)');
if (!model) die('ELEVENLABS_MODEL_ID tiada (jalankan --check untuk senarai model)');
const text = fs.readFileSync(textFile, 'utf8').trim();
if (!text) die('Fail teks kosong.');

const r = await api(`/text-to-speech/${encodeURIComponent(voice)}?output_format=mp3_44100_128`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
  body: JSON.stringify({ text, model_id: model }),
});
const buf = Buffer.from(await r.arrayBuffer());
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
fs.writeFileSync(out, buf);
console.log(`OK: ${out} (${(buf.length / 1024).toFixed(0)} KB, ${text.split(/\s+/).length} perkataan, model ${model})`);

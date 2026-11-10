# Blueprint: Automasi Ads (tiru sistem E-Syifa) untuk bisnes flipping

> Fail ini untuk **agent Claude** yang bekerja dalam projek bisnes flipping (beli barang TikTok Shop / Shopee → markup → jual melalui salespage sendiri + Facebook/Instagram ads, ada stok sendiri, COD + FPX).
> Tujuan: bina semula sistem automasi ads yang dah terbukti di E-Syifa (Ads Hub + peraturan auto + autopilot creative), disesuaikan untuk flipping.
>
> Rujukan kod sebenar: **`C:\Users\ACER\Desktop\Esyifaa`** (repo E-Syifa, Next.js + Supabase + Netlify). Baca kod di sana untuk butiran — fail ini ialah peta, prinsip dan senarai apa yang perlu diubah.

---

## 0. Peraturan wajib (baca dulu)

1. **Folder E-Syifa = BACA SAHAJA.** Jangan edit, commit, push, jalankan migration atau jalankan skrip yang menulis data di sana. Salin kod ke repo flipping dan ubah di situ.
2. **Jangan baca / salin `.env.local`, `.env`, atau mana-mana key** dari folder E-Syifa. Projek flipping guna akaun & key sendiri (Meta, Supabase, ElevenLabs, Gemini, Anthropic). Jangan cetak key dalam chat atau log.
3. **Jangan import silang** antara dua projek. Salin & sesuaikan sahaja.
4. **Abaikan modul khas E-Syifa** (lihat §9) — jangan tiru.
5. **Migration SQL dijalankan manual oleh owner** dalam Supabase SQL Editor. Tulis fail `sql/NNN_*.sql`, beri isi SQL dalam chat, dan **tunggu owner sahkan dah run** sebelum push kod yang bergantung padanya.
6. **Jangan push / deploy tanpa kebenaran jelas owner.**
7. **Jangan launch ad tanpa kelulusan owner** pada draf (angle, copy, creative) dalam perbualan semasa.
8. Owner bercakap Bahasa Melayu santai. Jawab dalam BM, ringkas.

---

## 1. Prinsip asas (kenapa sistem ni menang)

1. **Keputusan ads guna ORDER SEBENAR, bukan pixel.** Setiap ad dipadankan dengan order melalui UTM:
   `url_tags` setiap ad = `utm_source=facebook&utm_medium={{adset.id}}&utm_campaign={{campaign.id}}&utm_content={{ad.id}}`.
   Salespage simpan UTM dalam order (`orders.utm_content` = ID ad Meta). Laporan gabung belanja Meta (cache) + order sebenar → **ROAS sebenar setiap ad / adset**.
   Rujuk: `src/lib/utm.js`, `src/app/api/submissions/route.js` (simpan UTM), `src/lib/ads-hub/report.js` (`buildReport`).
2. **Formula wang (konsisten di semua tempat):**
   - Kos ads = belanja Meta × 1.08 (SST 8%).
   - ROAS = jualan ÷ belanja Meta (tanpa SST).
   - Untung lepas ads = jualan − kos barang − pos − kos ads.
   - ROI = untung lepas ads ÷ kos ads.
   - Order dikira hanya bila **bayaran selesai (FPX berbayar / COD)** dan **bukan return / batal**.
3. **Semua perubahan pada akaun Meta melalui SATU pintu** (`executeAction`) yang kuatkuasa had keselamatan dan tulis log. Tiada jalan pintas.
4. **Manusia lulus, mesin laksana.** AI boleh analisis, draf dan cadang; launch creative baru hanya selepas owner kata "lulus".
5. **Cache dulu, kira kemudian.** Data Meta disync ke DB setiap jam; laporan & peraturan baca dari DB (laju, tak kena rate limit).

---

## 2. Stack & seni bina

- Next.js (App Router) + Supabase (Postgres, service role di server sahaja) + Netlify (Scheduled Functions panggil route cron dengan header `x-cron-secret`).
- Meta Marketing API terus (Graph API, token System User disulitkan AES-256-GCM).
- Claude: (a) dalam app — chat ads & laporan pagi (Anthropic SDK); (b) di PC owner — Claude Code + **pelayan MCP sendiri** untuk baca data & launch autopilot.

Jika sistem flipping sedia ada guna stack lain, kekalkan stack dia — tiru **logik & skema**, bukan semestinya kod baris demi baris.

---

## 3. Peta fail E-Syifa (baca ikut modul)

| Modul | Fail | Isi |
|---|---|---|
| Klien Meta | `src/lib/ads-hub/meta.js` | `metaGet/metaPost/metaGetAll`, versi API, kesan token error |
| Sulit token | `src/lib/ads-hub/crypto.js` | AES-256-GCM, env `ADS_TOKEN_KEY` |
| Sync | `src/lib/ads-hub/sync.js` | tarik ads + insights harian → `meta_ads`, `meta_insights_daily` |
| Laporan ROAS sebenar | `src/lib/ads-hub/report.js` | `buildReport` gabung insights + order ikut `utm_content` |
| Ads spend auto | `src/lib/ads-hub/spend.js` | belanja ×1.08 → jadual ads spend ikut produk (campaign → produk) |
| Tindakan + had | `src/lib/ads-hub/actions.js` | `executeAction`: set_status, set_budget, duplicate_adset; had bajet / % naik / kuota auto / 20 jam |
| Peraturan, jadual, amaran | `src/lib/ads-hub/automation.js` | `evaluateConnection`, `evaluateAdsetRule`, `runTimeRules`, `runDueSchedules`, templat peraturan |
| Autopilot launch | `src/lib/ads-hub/autopilot.js` | upload video/gambar, cipta kempen/adset/creative/ad, struktur 1-1-1, resume, had slot & bajet |
| MCP server | `src/lib/ads-hub/mcp.js`, `src/app/api/mcp/route.js` | JSON-RPC Streamable HTTP, auth `Bearer` key (hash SHA-256) |
| Chat ads AI | `src/lib/ads-hub/chat.js`, `ai.js` | Claude dengan alat baca; alat tulis perlu tekan Sahkan |
| Laporan pagi AI | `src/lib/ads-hub/morning.js` | satu laporan sehari tentang semalam |
| Akses | `src/lib/ads-hub/guard.js` | siapa boleh urus akaun mana |
| Route API | `src/app/api/ads-hub/*` | connection, sync, rules, schedules, events, log, reports, autopilot, mcp-keys |
| Cron | `src/app/api/cron/ads-sync`, `ads-rules`, `ads-scheduled`, `ads-report` + `netlify/functions/ads-*-cron.mjs` | jadual di §5 |
| UI | `src/components/dashboard/AdsHub.js`, `src/components/dashboard/AdsHubExtras.js` | dashboard, tab Peraturan, Tetapan, had, kad autopilot |
| Skema | `sql/025_ads_hub.sql`, `026_ads_hub_ai.sql`, `030_ai_agents.sql` (`meta_campaign_products`), `031_mcp_keys.sql`, `032_autopilot.sql`, `033_rules_scope.sql`, `034_rules_adset_time.sql`, `035_meta_mcp_source.sql` | lihat §4 |
| Skill autopilot | `.claude/skills/autopilot-hq/SKILL.md` + `templates/` | kitaran kilang creative (§7) |
| Skrip PC | `scripts/autopilot/tts.mjs`, `gemini-image.mjs`, `mcp_call.py`, `tus_upload.py` | VO, gambar, panggil MCP, upload berpecah |

---

## 4. Skema data (ringkas)

- `meta_connections` — satu baris setiap akaun Meta: token disulitkan, ad account, status sync, **had keselamatan** (`limit_max_budget`, `limit_max_increase_pct`, `limit_auto_actions_per_day`), suis `auto_ads_spend`, `default_product`, tetapan autopilot (`autopilot_enabled`, `autopilot_adset_budget`, `autopilot_max_adsets`, `autopilot_daily_cap`, page/IG id, `autopilot_template_adset_id`).
- `meta_ads` — cache struktur: ad, adset, campaign, status, bajet adset, creative.
- `meta_insights_daily` — belanja, impression, klik, pembelian pixel setiap ad setiap hari.
- `meta_rules` — peraturan auto (lihat §6). `meta_events` — amaran/cadangan/tindakan (dedupe). `meta_actions_log` — log SEMUA perubahan (sebelum/selepas, sumber, status).
- `meta_scheduled_actions` — tindakan berjadual (cth pause jam 12 malam satu adset).
- `meta_reports`, `ads_chat_threads/messages` — laporan pagi & chat.
- `mcp_api_keys` — key MCP (hash sahaja).
- `autopilot_launches` — setiap launch (client_ref unik, status launching → scheduled/failed/cancelled, id kempen/adset/ad).
- Jadual ads spend harian ikut produk (E-Syifa: `ads_spend`).

Untuk flipping: **jadual order sedia ada mesti ada kolum UTM** (`utm_source/medium/campaign/content`, `fbclid`) dan status bayaran/return yang jelas. Kalau tiada — itu kerja pertama.

---

## 5. Kitaran cron (waktu Malaysia)

| Bila | Route | Kerja |
|---|---|---|
| Setiap jam, minit :05 | `/api/cron/ads-sync` | sync Meta → cache; isi ads spend auto |
| Setiap jam, minit :20 | `/api/cron/ads-rules` | nilai peraturan ikut syarat (lepas sync) |
| Setiap 10 minit | `/api/cron/ads-scheduled` | tindakan berjadual + peraturan ikut jam (`run_at_time`) |
| Setiap 15 minit | `/api/cron/ads-report` | laporan pagi bila tiba masanya |

Setiap route semak `x-cron-secret`, ada bajet masa (Netlify had ±26s) dan boleh sambung semula (dedupe dalam `meta_events`).

---

## 6. Enjin peraturan auto

**Bentuk peraturan** (`meta_rules`): `metric` + `operator` (`< <= > >= =`) + `value`, `conditions` tambahan (DAN, maks 3), `window_days` (1 = hari ini), `min_spend`, `level` (`ad` / `adset`), `scope` (semua / autopilot), `frequency` (`daily` / `hourly` — boleh berulang setiap jam), `run_at_time` ('HH:mm', sekali sehari pada semua adset dalam kempen aktif), `action` (`pause`, `pause_adset`, `activate_adset`, `budget_up` %, `budget_down` %, `budget_set` RM, `notify`), `action_max`, `mode` (`suggest` = cadang sahaja / `auto`).

- Peringkat adset: metrik dijumlahkan ikut adset; **hanya adset dalam kempen ACTIVE**.
- Adset autopilot yang masih `launching/failed/cancelled` tidak dihidupkan.
- Dedupe: satu tindakan sehari (atau sejam jika `hourly`) bagi setiap peraturan × objek.

**Had keselamatan** (dalam `executeAction`, untuk semua sumber): bajet ≤ `limit_max_budget`; kenaikan ≤ `limit_max_increase_pct` sekali naik; naik bajet sekali dalam 20 jam (kecuali peraturan hourly / ikut jam); kuota tindakan auto sehari; bajet sama = no-op.

**Set peraturan HQ E-Syifa yang sedang live (titik mula — UBAH NILAI untuk flipping, lihat §8):**

| # | Syarat (hari ini, ikut adset, kempen aktif) | Tindakan |
|---|---|---|
| 1 | belanja > RM30 dan order = 0 | pause adset (setiap jam) |
| 2 | order > 0 dan ROAS < 2, belanja ≥ RM35 | pause adset |
| 3.1 | order ≥ 1 dan ROAS ≥ 2.5, belanja ≥ RM20 | set bajet RM100 |
| 3.2 | order ≥ 2 dan ROAS ≥ 2.2 | set bajet RM150 |
| 3.3 | order ≥ 4 dan ROAS ≥ 2.2 | set bajet RM250 |
| 3.4 | order ≥ 6 dan ROAS ≥ 2.2 | set bajet RM350 |
| 3.5 | order ≥ 9 dan ROAS ≥ 2.3 | set bajet RM500 |
| 4 | order ≥ 2 dan ROAS ≥ 2.5 | hidupkan semula adset (order lambat masuk) |
| 5 | jam 23:30 | set semua adset RM60 |
| 6a | jam 00:00 | pause semua adset |
| 6b | jam 06:00 | hidupkan semua adset |

"Tangga scale" (3.x) = `budget_set` yang **hanya menaikkan** (tak turunkan adset yang dah lebih tinggi), langkau had %, dan **tiada naik selepas 9 malam**. (Peraturan lama "scale 30% sejam" dimatikan — tangga lebih stabil.)

---

## 7. Kilang creative (autopilot)

Kitaran (lihat `.claude/skills/autopilot-hq/SKILL.md`): **semak slot → analisis data → DRAF → (owner LULUS) → produksi → launch (mula 06:00 esok) → laporan**. Kill/scale lepas live = kerja peraturan §6, bukan skill.

- **Analisis:** angle/hook yang menang & kalah (ROAS sebenar), produk dengan jualan tertinggi, elak ulang angle yang sedang jalan.
- **Draf:** angle + emosi → hook → ad copy → skrip VO / draf gambar. Bentang, kemudian **berhenti tunggu "lulus"**.
- **Produksi video:** VO ElevenLabs (`scripts/autopilot/tts.mjs`) → animasi HTML deterministik (`render(t)`) → Playwright frame → ffmpeg MP4 → thumbnail sebagai 3 frame pertama → mux audio. Templat orang lidi: `.claude/skills/autopilot-hq/templates/orang-lidi.html` + `render-orang-lidi.py`.
- **Produksi gambar (4:5):** latar Gemini (`scripts/autopilot/gemini-image.mjs`, `--n 3`, `--size 2K`) + teks/logo/produk ditindih HTML (`.claude/skills/autopilot-hq/templates/iklan-gambar.html` + `render-iklan-gambar.py`, ejaan tepat); ATAU ad penuh Gemini Pro dengan gambar produk sebagai `--ref` (tulisan besar tepat, label kecil produk mungkin rosak).
- **Launch** melalui MCP sendiri: `request_upload` → upload (`tus_upload.py` untuk fail besar) → `upload_video`/`video_status` atau `image_path` → `launch_ad` (resumable dengan `client_ref`; pilihan `own_campaign` = struktur 1-1-1). Sandaran bila Meta tolak creative: `prepare_launch` → cipta ad melalui MCP Meta Ads rasmi → `complete_launch`.
- **Had autopilot di server:** suis ON/OFF, bajet setiap adset baru, adset aktif maksimum, jumlah bajet harian kempen autopilot.

**Framework copy & creative** (skill plugin owner — ringkasan, kerana fail plugin bukan dalam repo):
- **Hook = Winning Angle + Trigger Emosi.** Angle: Soalan, Testimoni, Direct, Tawaran. Emosi: Anxiety, Relief, Status, Care, FOMO, Insecurity.
- **Ad copy:** Hook → produk + solusi → manfaat (✅) → cara guna + impak → detail penting (COD, pos, bonus) → CTA → headline. Tiada label segmen dalam teks.
- **Layout gambar (CFT):** SITUASI (situasi manusia 70%, produk bawah kanan, hook bawah kiri) · SPLIT (kiri 4–5 manfaat ✓, kanan produk) · OFFER (tawaran besar kanan atas, produk kiri) · EXAGGERATE (metafora melampau 70%, produk kecil sebagai anchor). Satu creative = satu mesej.
- **Prompt Gemini penuh:** 4:5, BI untuk gaya, teks BM dalam "..."; jangan tulis nama produk dalam arahan visual — "integrate the exact physical product from the uploaded reference image"; akhiri dengan blok PRODUCT CONSISTENCY.
- **Skrip VO H-E-I-U-W-T-O-A:** Hook, Exaggerate, Intro, USP, Who, Trust, Offer, Action (60–80 saat).

Jika owner sudi, minta dia salin skill plugin (`cft-adcreative-formula`, `skrip-vo-heiuwtoa`, `draf-video-motion-graphic`) ke `.claude/skills/` projek flipping.

---

## 8. Perubahan khas untuk FLIPPING

1. **ROAS breakeven ikut produk — WAJIB sebelum peraturan.**
   `untung kasar seunit = harga jual − kos barang (landed: harga beli + pos masuk) − pos keluar − fi FPX/COD − (kadar return COD × kos return)`.
   `ROAS breakeven = harga jual ÷ untung kasar seunit` (tanpa SST; tambah 8% jika guna kos ads ber-SST).
   Simpan dalam jadual produk (`cost_price`, `breakeven_roas`, `target_roas`). Peraturan kill/scale guna **gandaan breakeven produk itu**, bukan nilai tetap 2.0 — cth kill bila ROAS < 1.0× breakeven selepas belanja ≥ 1× untung seunit; tangga scale bila ROAS ≥ 1.3× breakeven. Tambah sokongan metrik `roas_vs_breakeven` dalam enjin peraturan (atau peraturan per kempen produk).
2. **Banyak SKU, uji cepat.** Satu SP setiap produk; kempen per produk (atau 1-1-1 per angle). Bajet uji kecil (cth RM30–50/adset), kill keras dalam 24 jam. Peta campaign → produk (E-Syifa: `meta_campaign_products` + teka dari nama) mesti tepat kerana margin berbeza setiap produk.
3. **Cari produk (fasa kemudian).** Data jualan TikTok Shop (cth MCP FastMoss: produk laris, trend jualan, video menang) → senarai calon → kira margin & breakeven → owner pilih → beli stok kecil → uji. Simpan calon & keputusan uji dalam DB.
4. **Stok.** Jangan scale produk yang stok hampir habis: syarat tambahan `stock_left > N` atau peraturan auto pause bila stok < hari jualan × N. Amaran restock.
5. **COD & return.** Kira order COD yang **berjaya dihantar** sahaja dalam jualan bila data ada; pantau kadar return setiap produk/angle (return tinggi = ROAS palsu).
6. **Creative — hak cipta & polisi.** JANGAN guna video/gambar penjual TikTok/Shopee atau jenama lain tanpa izin; buat sendiri (kilang §7, gambar produk sendiri, UGC sendiri) atau aset yang supplier benarkan secara jelas. Tolak barang tiruan berjenama. Patuhi polisi Meta (tiada dakwaan melampau, before/after, harga palsu "diskaun").
7. **Gambar produk.** Ambil gambar stok sendiri (latar putih + gaya hidup); jadikan PNG lutsinar untuk ditindih dalam ad.

---

## 9. JANGAN tiru (khas E-Syifa)

Fighter / penjual bebas (`src/lib/fighter/*`, `fighter_*`), perawat & kes, pengisian / ruqyah harian, pakej & kiraan khas Sabun/Kasturi/Garam (`src/lib/products.js` PRODUCTS, `src/lib/marketer-calc.js` parser kuantiti teks), komisen/gaji marketer & team, NinjaVan fighter, return waybill khas, skill produk E-Syifa, gaya animasi tema jin/ruqyah.

---

## 10. Pelan fasa (cadangan)

1. **Atribusi** — order simpan UTM; semua ad guna `url_tags` di §1; laporan ROAS sebenar setiap ad. *(Tanpa ini, semua fasa lain tak bermakna.)*
2. **Sync + Ads Hub ringkas** — sambung Meta (token disulitkan), cron sync setiap jam, dashboard ad/adset: belanja, order, jualan, ROAS, untung; ads spend auto (+SST).
3. **Margin produk** — kos, breakeven & target ROAS setiap produk; untung lepas ads tepat.
4. **Tindakan + had + log** — `executeAction` dengan had keselamatan; log semua.
5. **Peraturan auto** — mula mod **cadang** seminggu, semak, baru tukar ke **auto**. Set mula: kill tanpa order, kill ROAS < breakeven, tangga scale, reset malam, tutup 12 malam / buka 6 pagi.
6. **MCP sendiri** — alat baca (overview, ads, ringkasan order, peraturan) untuk Claude Code owner.
7. **Autopilot creative** — skill kitaran + skrip VO/gambar/render + `launch_ad`.
8. **Cari produk** — data TikTok Shop → calon → uji.

Setiap fasa: tulis migration → owner run → bina → uji dengan data sebenar (baca sahaja dulu) → owner luluskan push.

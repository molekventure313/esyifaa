# Templat Strategi — Ejen AI 01 (v2, full-stack media buyer)

**Nama templat:** Ejen Uji — Sabun Garam & Garam Pengasihan (kini 3 produk; nama dikekalkan)
**Ringkasan:** 3 produk · split test 3 ad setiap produk, tambah 1 ad sehari bila ada ad untung (maks 7 setiap produk) · struktur 1-1-1 · tiada fasa scale (tangga bajet server)

**Had (borang templat):** bajet adset RM60 · slot 21 (7 setiap produk) · had harian RM2,000 · launch/hari 12 · budget adset maks RM500 (tangga) · KPI ROAS 2.0 · struktur 1-1-1 · produk sabun-garam, garam-pengasihan, kasturi-kijang · creative video, gambar

## Angka asas (data HQ 30 hari, 11/10–09/11/2026)

| Metrik | Nilai | Guna untuk |
|---|---|---|
| AOV | RM65 | |
| Kos produk + pos | ±RM11.80 / order (18%) | |
| CPA breakeven | ±RM49 (spend Meta) | had kill |
| CPA sasaran (ROAS 2.0) | ±RM33 | |
| ROAS breakeven | ±1.32 (sebelum return COD) | |
| CTR link purata | 1.85% | penanda hook |
| CVR klik → order | 3.7% | penanda salespage |
| CPM purata | RM24.60 | penanda audience/kualiti |

Order COD dikira "completed" semasa order masuk; return masuk kemudian. Jadi ROAS 1–3 hari terakhir **terlebih** sebanyak kadar return. Semua had di bawah dah ada margin untuk ini. Ejen perlu kira semula angka ni setiap minggu.

---

## SOP (salin ke kotak "SOP penuh")

```
SOP EJEN AI 01 — MEDIA BUYER PENUH

PRINSIP
- Ukuran tunggal: profit lepas ads dari order sebenar (MCP esyifa). Pixel hanya untuk diagnosis.
- Satu ad = satu hipotesis (angle + hook + format). Nilai ad, bukan perasaan.
- Keputusan harian dibuat SEKALI pada kitaran pagi, guna data sehingga semalam 23:59.
  Jangan nilai ad dengan data separuh hari ini, kecuali brek kecemasan.
- Bilangan order kecil = data bising. 1 order tukar ROAS dengan banyak; guna ambang order & belanja di bawah, bukan ROAS sahaja.
- Server (peraturan Ads Hub, setiap jam) = brek kecemasan & tangga bajet harian. Ejen = keputusan berbilang hari.
  Jangan tulis peraturan yang bercanggah dengan SOP ini.

PERATURAN SERVER AKAUN INI (auto, kempen autopilot sahaja — jangan ubah/padam)
- Tangga bajet (setiap jam, data hari ini): RM100 (≥1 order, ROAS ≥2.5, belanja ≥RM20) → RM150 (≥2, ≥2.2) → RM250 (≥4, ≥2.2)
  → RM350 (≥6, ≥2.2) → RM500 (≥9, ≥2.3). Naik satu anak tangga sejam, tiada naik selepas 21:00. Reset RM60 setiap 23:30.
- Brek kecemasan: (1) adset belanja hari ini ≥RM80 tanpa order → pause (hanya adset yang bajetnya dah naik tangga);
  (2) adset belanja 3 hari ≥RM100 tanpa order → pause; (3) ad umur ≥4 hari, ROAS 3 hari <1.0, belanja ≥RM120 → pause adset.
- Brek (1) ialah perlindungan bajet satu hari, bukan keputusan kill: kitaran pagi boleh hidupkan semula adset itu
  (set_ad_status ACTIVE) jika data 3 hari masih lulus fasa SAH/KEKAL.
- Tiada pause 00:00 / hidup 06:00 pukal untuk akaun ini — ad yang ejen kill mesti kekal mati.

ANGKA RUJUKAN (kira semula setiap Isnin dari get_overview 30d; guna nilai di bawah sehingga dikemas kini)
AOV 65 · CPA_BE (breakeven) 49 · CPA_T (sasaran) 33 · ROAS_BE 1.32 · CTR_ASAS 1.85% · CVR_ASAS 3.7% · CPM_ASAS 24.6

ALAT & DATA (MCP esyifa)
- get_ads: age_days (hari ke-N sejak impression pertama, hari pertama = 1), frequency (7 hari sebenar dari Meta),
  hook_rate (3-saat views ÷ impression, %), hold_rate (ThruPlay ÷ 3-saat views, %), CTR, CPM, ROAS, CPA.
- get_ad_history: trend harian satu ad (termasuk hook_rate) — guna untuk fasa LETIH.
- get_overview.returns: kadar return COD matang + roas_adjusted_est. Penilaian ad untung & akaun guna ROAS adjusted,
  bukan ROAS mentah (order COD < 15 hari belum tentu dibayar).
- set_ad_status: satu-satunya cara kill / hidupkan semula. reason WAJIB = data + rujukan SOP (cth "A2 kill").
  Pause ad = buang satu creative; pause adset = kill angle penuh. Server tolak objek di luar kempen autopilot.

A. KITARAN HIDUP SETIAP AD (umur = age_days dari get_ads)

Fasa 1 — UJI (hari 1–2, sehingga ±RM120 belanja)
  Beri peluang penuh 2 hari. Kill awal HANYA jika:
  - belanja ≥ RM50 (≈1× CPA_BE) dan 0 order, ATAU
  - ≥ 3,000 impression dan CTR link < 0.8% (hook mati — penonton tak klik langsung)
  Selain itu biarkan, walaupun ROAS hari 1 rendah.

Fasa 2 — SAH (hari 3, nilai data kumulatif 3 hari)
  - PEMENANG: ROAS 3 hari ≥ 2.0 DAN ≥ 4 order → fasa 3
  - PEMERHATIAN: ROAS 1.5–2.0, atau ≥ 2.0 tapi < 4 order → lanjut 2 hari lagi (maksimum sekali). Hari 5 mesti jadi pemenang atau kill.
  - KILL: ROAS 3 hari < 1.5 dengan belanja ≥ RM100, ATAU CPA > CPA_BE dengan ≥ 2 order
  - Diagnosis sebelum kill (rekod dalam jurnal, guna untuk ad seterusnya):
      CTR < 1.2%            → hook / visual pembuka lemah → uji hook baru, angle sama
      hook_rate < 70% purata akaun (video) → 3 saat pertama tak hentikan scroll → tukar pembuka sahaja
      hook_rate ok, hold_rate rendah → penonton berhenti selepas hook → tegangkan babak 2–3 / pendekkan video
      CTR ok, CVR < 2.5%    → janji ad tak sepadan salespage, atau tawaran lemah
      CPM > 1.5× CPM_ASAS   → audience sempit / kualiti ad rendah / musim mahal
      Klik ok, order ada tapi AOV rendah → ad tarik pembeli pakej kecil; uji angle tawaran pakej

Fasa 3 — KEKAL (ad untung)
  - TIADA fasa scale oleh ejen. Bajet ad untung naik automatik ikut tangga server setiap hari (RM60 → 100 → 150 → 250 → 350 → 500,
    reset 23:30). Ejen JANGAN ubah bajet.
  - Ad untung kekal selagi ROAS 3 hari ≥ 1.8. Ia membuka FASA TAMBAH IKLAN untuk produknya (lihat D).

Fasa 4 — LETIH (fatigue): pemenang mula jatuh
  Tanda (mana-mana 2): ROAS 3 hari < 1.8 sedangkan 7 hari ≥ 2.0 · frekuensi 7 hari (impression ÷ reach) > 2.5 ·
  CTR 3 hari jatuh > 30% berbanding 3 hari pertama · CPA 3 hari > 1.3× CPA 7 hari.
  Tindakan: JANGAN kill dulu. Pastikan ada ad baru produk itu sedang diuji (tambah hari ini jika slot produk < 7).
  Kill bila ROAS 3 hari < 1.3 dengan belanja 3 hari ≥ RM120, ATAU 2 hari berturut-turut ROAS < 1.0.
  Satu hari teruk sahaja BUKAN alasan kill pemenang (hujung bulan / hujung minggu memang berubah-ubah).

Gantian: setiap ad yang di-kill diganti pada kitaran pagi berikutnya dengan angle LAIN (lihat D).

B. PERUNTUKAN BAJET AKAUN
- Sasaran: ±65% belanja pada pemenang/pemerhatian, ±35% pada ujian. Jika > 60% belanja 3 hari pada ujian → kurangkan launch baru.
- Setiap produk sentiasa ada sekurang-kurangnya 1 ad dalam fasa UJI (paip creative tak boleh kosong).
- Musim: 25hb–5hb (gaji) normal/agresif; 15hb–24hb lebih perlahan — jangan kill pemenang berdasarkan prestasi pertengahan bulan sahaja.
- Had harian akaun (autopilot_daily_cap) hanya dinaikkan oleh HQ. Jika pemenang tersekat had, CADANGKAN dalam laporan.

C. BREK AKAUN (semak sebelum apa-apa launch; jika berlaku → jangan launch, lapor & berhenti)
- ROAS akaun 3 hari < 1.3, ATAU profit lepas ads 7 hari < −RM300
- Ad ditolak Meta / amaran polisi / akaun bermasalah dalam 7 hari
- Peraturan auto akaun tiada atau dimatikan (list_rules)
- Satu PRODUK dengan 6 ad berturut-turut di-kill dalam fasa 1/2 → kurangkan produk itu ke 1 slot dan lapor kepada HQ
  (masalah mungkin salespage / tawaran, bukan angle). Produk lain tidak terjejas.

D. PRODUK, SLOT & ANGLE (fasa split test & fasa tambah iklan — dikira SETIAP produk)
Struktur: 1-1-1 — SETIAP ad = kempen sendiri "[1-1-1] <Produk> · <angle>" (1 kempen · 1 adset · 1 ad). Jangan kumpul ad dalam kempen produk.
Produk: Sabun Garam (sabun-garam) · Garam Pengasihan / garam masakan (garam-pengasihan) · Kasturi Kijang (kasturi-kijang).
Kira ad aktif setiap produk dari autopilot_status.adsets (nama adset bermula "<produk> | ") — termasuk ad autopilot lama.

D1. FASA SPLIT TEST (produk belum ada ad untung)
  - Tepat 3 ad aktif. Launch SERENTAK — jika produk ada < 3 ad aktif, isi semua kekurangan dalam kitaran yang sama
    (kitaran pertama: 9 ad untuk 3 produk). Ad yang di-kill diganti terus dengan angle lain supaya kekal 3.
  - Jangan lebih 3 ad dalam fasa ini.
D2. FASA TAMBAH IKLAN (dibuka bila ≥ 1 ad produk itu UNTUNG)
  - UNTUNG = ad hari ke-3 atau lebih dengan profit lepas ads 3 hari > 0 DAN ≥ 3 order (get_ads, data hingga semalam).
  - Tambah 1 ad sehari untuk produk itu (di atas penggantian ad yang di-kill), maksimum 7 ad aktif setiap produk.
  - Jika tiada lagi ad untung (semua di-kill / letih) → produk kembali ke D1: tiada tambahan baru, ganti kill sahaja,
    dan ad aktif yang melebihi 3 dibiarkan habis kitaran hidup (tidak di-kill semata-mata kerana kuota).
  - Slot tambahan boleh: angle BARU, ATAU angle pemenang/untung dengan content berbeza (hook, pembuka, video ↔ gambar,
    visual, testimoni lain). Maksimum 2 ad aktif berkongsi angle teras yang sama dalam satu produk.

ANGLE (guna skill cft-adcreative-formula setiap kali)
  - Angle = kombinasi 4 WINNING ANGLE CFT (Soalan / Testimoni / Direct / Tawaran) × 6 TRIGGER EMOSI × masalah/situasi pembeli.
  - Ad aktif dalam produk yang sama mesti beza MASALAH / SITUASI teras, ATAU beza jenis CFT + emosi — bukan hanya hook,
    warna atau ayat (kecuali slot variasi content angle untung di D2).
  - 3 ad split test pertama setiap produk: 3 jenis CFT berbeza (cth Soalan · Testimoni · Tawaran).
  - Sebelum launch, semak ad aktif + jurnal: sama teras dengan ad aktif (melebihi had D2) atau ad yang di-kill dalam 14 hari → pilih lain.
    Tulis dalam jurnal: angle teras, jenis CFT, emosi, dan kenapa ia berbeza.

Sumber angle:
  - Produk TIADA pemenang → BEBAS uji angle baru: masalah/situasi dalam salespage & FAQ, testimoni sebenar, tawaran (pakej, COD, harga),
    soalan/bantahan biasa, dan pemenang produk lain yang boleh dipindah. Kasturi Kijang dalam kategori ini
    (terbaik HQ "Pakej Seisi Keluarga" 1.88, 8 order — belum pemenang).
  - Produk ADA pemenang HQ → maksimum 1 daripada 3 ad split test ialah angle pemenang HQ (content baru); 2 lagi angle berbeza.
    Sabun: "Gangguan saka/sihir datang balik?" (2.03, 89 order) · "Mandian Ruqyah Di Rumah" (Direct, 2.59) · "Bayar Bila Sampai" (Tawaran, 2.29)
    Garam Pengasihan: "Bilik Asing 8 Bulan" (Testimoni, 2.45, 34 order)
  - Larangan: angle yang di-kill dalam 14 hari untuk produk itu (melainkan diagnosis kata hook yang lemah, bukan angle).
    Kalah (Sabun HQ): "Terjaga 3 Pagi", "Keluarga Mandi Bersama", "Rumah Rasa Berat", "Mak Ayah Di Kampung", "Sakit Misteri — Doktor Kata Normal".
    Kalah (Kasturi HQ): "Wangian Sunnah" (Direct), "Kena Himpit" (Soalan), "Anak Meracau Maghrib". Kalah (Garam HQ): "Ikhtiar Dari Dapur", "Tanda-tanda Sihir Pemisah".

Urutan kerja setiap kitaran: (1) kill ikut A → (2) ganti kill ikut D1 → (3) tambah ikut D2 → semua dalam kitaran yang sama.
Jika masa / had server tidak cukup untuk semua: utamakan penggantian, kemudian produk dengan ad aktif paling sedikit.

E. CREATIVE
- Wajib panggil skill produk, cft-adcreative-formula, skrip-vo-heiuwtoa, draf-video-motion-graphic setiap kitaran.
- Selang-seli format: video (VO penuh HEIUWTOA 60–80s, 4:5, thumbnail = frame 0) dan gambar (Gemini penuh, format CFT, 4:5).
- 3 saat pertama = 80% kerja. Setiap variasi mesti beza pada hook/pembuka, bukan hanya warna.
- TRUST / testimoni / angka: data sebenar dari skill produk sahaja (Kasturi tiada skill → guna salespage /kasturi-kijang sahaja). Jangan reka.
- Nama: angle mengandungi "<produk> | <angle> (<jenis CFT>) · <emosi> | v<n>" supaya variasi boleh dijejak.
- Link: salespage HQ (https://e-syifa.com/<slug>) — ?m=<kod ejen> ditambah automatik.

F. QA SEBELUM LAUNCH (gagal → buat semula sekali; gagal lagi → langkau & lapor)
- Tiada janji sembuh / jaminan hasil; tiada tuduhan terus kepada penonton ("anda kena sihir"); tiada penyakit/diagnosis perubatan
- Tiada darah, gore, mayat; jin = siluet/asap sahaja
- Ejaan BM teks besar betul; logo tidak diubah; produk ialah kotak sebenar
- Video: durasi ≈ audio, frame 0 = thumbnail
- Ragu tentang polisi Meta → jangan launch, masukkan dalam laporan

G. LAUNCH
- launch_ad dengan own_campaign: true (struktur 1-1-1 — WAJIB setiap launch). Jika ditolak mod Development: prepare_launch → MCP Meta → complete_launch.
- client_ref: <YYYY-MM-DD>-ai01-<slug-angle>-v<n>. Ikut mod akaun (shadow rekod sahaja; veto/auto mula 06:00 esok).
- Jangan ubah targeting, pixel, kempen atau peraturan. 2 ad pertama (10/11) berada dalam kempen "[AUTOPILOT] <Produk>" lama —
  biarkan dan kira dalam 3 ad split test produknya; ad baru semua 1-1-1.

H. JURNAL (ingatan ejen — WAJIB, dibaca setiap kitaran sebelum pilih angle)
Fail: autopilot/ejen-01/jurnal.md. Satu baris setiap ad:
tarikh · client_ref · produk · angle · jenis · hook · format · hipotesis · keputusan (pemenang/kill/letih) · hari hidup · belanja · order · ROAS · diagnosis · pengajaran
Setiap Isnin: kemas kini "Bank angle" di atas jurnal (pemenang, kalah, hook terbaik setiap angle).

I. KITARAN
Harian 06:30: semak (autopilot_status, get_overview 1d/3d/7d, get_ads 3d/7d) → brek akaun → nilai setiap ad ikut A
  → kill → ganti (D1) → tambah (D2) → pilih angle → creative → QA → launch → jurnal → laporan.
Mingguan (Isnin): kira semula angka rujukan, kadar return COD 30 hari, CTR/CVR/CPM trend, bank angle, cadangan kepada HQ
  (naik/turun had harian, produk, salespage jika CVR jatuh).

J. LAPORAN HARIAN (BM, ringkas)
1. Akaun: belanja · jualan · profit lepas ads · ROAS — semalam, 3 hari, 7 hari
2. Status setiap ad: fasa (uji/sah/kekal/letih) · ROAS 3h · order · keputusan hari ini + sebab
3. Setiap produk: fasa (split test / tambah iklan) · ad aktif x/7 · ad untung
4. Launch hari ini: produk · angle · jenis CFT · emosi · ganti/tambah · format · hipotesis · launch_id
5. Dilangkau / perlu HQ: brek, QA gagal, ragu polisi, cadangan bajet

K. BERHENTI & TANYA HQ
Brek akaun · server tolak launch 2 kali berturut-turut · produk / tawaran / harga / salespage baru · data testimoni tiada ·
CVR akaun jatuh < 2.5% selama 3 hari (masalah salespage, bukan ad).
```

---

## Jurang teknikal

| # | Perlu | Status |
|---|---|---|
| 1 | Ejen pause / hidupkan ad & adset | ✅ Alat MCP `set_ad_status` — kempen [AUTOPILOT]/[1-1-1] sahaja, ikut mod akaun (shadow = rekod), reason wajib, maks 20/hari, Log "🧠 Ejen AI" |
| 2 | Peraturan ikut umur ad | ✅ Metrik `age_days` dalam rules engine & get_ads (cth `age_days >= 3` = beri peluang 2 hari) |
| 3 | Frequency & CPM | ✅ Metrik `frequency` (7 hari sebenar dari Meta) & `cpm` dalam peraturan dan get_ads |
| 4 | Kadar return COD | ✅ `get_overview.returns` — kadar matang 15–44 hari + `roas_adjusted_est` |
| 5 | Jurnal ejen | ✅ `autopilot/ejen-01/jurnal.md` (PC, tidak dicommit) |
| 6 | Hook rate video | ✅ Sync 3-saat views & ThruPlay → `hook_rate`, `hold_rate` (data mula terkumpul selepas deploy) |
| 7 | Kitaran berjadual pagi + mingguan | ⏳ Selepas akaun ejen 01 disambung |
| 8 | Peraturan server ejen 01 | ⏳ Salin peraturan HQ, longgarkan kill rule (kecemasan sahaja) selepas akaun disambung |

Perlu: migration `sql/040_ads_metrics_agent.sql` dijalankan sebelum deploy.

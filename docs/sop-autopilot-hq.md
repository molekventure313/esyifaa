# SOP Autopilot HQ — struktur 1-1-1 & kill iklan tak perform

**Akaun:** HQ (Ads Hub HQ, Page 1267491113110095) · **Mod:** manual (semua kill & launch perlu "lulus" dari HQ dalam sesi)
**Skill pelaksana:** `.claude/skills/autopilot-hq/SKILL.md` (Langkah 1b = kill, Langkah 5 = launch)
**Asal:** kaedah kill Agent Miya (`docs/sop-ejen-01.md` bahagian A), diguna untuk HQ mulai 12/11/2026.

Blok di bawah boleh ditampal ke Ads Hub → Tetapan → Autopilot → "SOP penuh" (HQ belum ada templat strategi).

```
SOP AUTOPILOT HQ — STRUKTUR 1-1-1 & KILL

PRINSIP
- Ukuran tunggal: ROAS & profit dari order sebenar (MCP esyifa get_ads / get_overview). Pixel hanya untuk diagnosis.
- Satu ad = satu hipotesis (angle + hook + format). Nilai ad ikut data, bukan perasaan.
- SETIAP HARI (kitaran pagi) baca data 4 HARI TERAKHIR hingga semalam 23:59 untuk SETIAP ad yang masih hidup
  (get_ads from = semalam − 3 hari, to = semalam; cth pagi 14/11 → 10/11–13/11), termasuk ad di luar kempen autopilot
  ("[IMAGE] …", "CV - …"). Data kumulatif (from = tarikh ad mula) hanya sebagai konteks dalam jadual cadangan.
  Jangan nilai data separuh hari ini.
- PEMBAHAGIAN KERJA:
  Peraturan Ads Hub (server, setiap jam) = ON/OFF HARIAN & tangga bajet: tutup 00:00, hidup 06:00, tutup belanja >RM30 tanpa order,
  tutup ROAS <2 (belanja ≥RM35), tangga RM100→500, reset RM60 23:30, peraturan khas Kasturi.
  Adset PAUSED pada siang/malam biasanya kerja peraturan (get_activity source "auto") — BUKAN kill; ia hidup semula 06:00.
  Kitaran pagi (Claude) = KILL KEKAL berdasarkan data kumulatif berbilang hari.

STRUKTUR 1-1-1 (WAJIB untuk semua launch baru)
- Setiap ad = kempen sendiri "[1-1-1] <Produk> · <angle>" (1 kempen · 1 adset · 1 ad).
- launch_ad SENTIASA dengan own_campaign: true. Kempen lama "[AUTOPILOT] Sabun Garam" DITUTUP (12/11) — launch tanpa
  own_campaign akan masuk kempen mati dan tidak berjalan.
- Jangan kumpul ad baru dalam kempen produk dikongsi. Kempen dikongsi lama yang masih hidup
  ("[AUTOPILOT] Garam Pengasihan" — Bilik Asing; "[AUTOPILOT] Kasturi Kijang" — Tengkuk Berat) dibiarkan habis kitaran hidup.
- Kenapa: kill = tutup kempen, kekal mati walaupun peraturan 06:00 hidupkan adset; slot & bajet terus bebas;
  data setiap angle bersih (tiada perebutan bajet dalam kempen).

ANGKA RUJUKAN (data HQ 30 hari; kira semula setiap Isnin dari get_overview 30d)
AOV RM65 · CPA_BE (breakeven) RM49 · CPA_T (sasaran) RM33 · ROAS_BE 1.32 · CTR_ASAS 1.85% · CVR_ASAS 3.7% · CPM_ASAS RM24.6

PERATURAN KILL HARIAN — ROAS 4 HARI (peraturan utama, diguna mulai 13/11/2026)
  Untuk setiap ad hidup berumur hari ke-3 atau lebih (age_days ≥ 3):
  - ROAS 4 hari < 2.0 DAN belanja 4 hari ≥ RM60 → CADANG KILL dalam cadangan harian (pemenang lama pun termasuk;
    nyatakan ROAS kumulatif sebagai konteks supaya HQ boleh kecualikan).
  - ROAS 4 hari ≥ 2.0 → KEKAL. Bajet naik ikut tangga server sahaja; jangan ubah bajet manual.
  - Belanja 4 hari < RM60 → data belum cukup, KEKAL dan perhati (nyatakan dalam jadual).
  Ad hari 1–2 (UJI): beri peluang penuh 2 hari. Cadang kill awal HANYA jika belanja kumulatif ≥ RM50 dan 0 order,
  ATAU ≥ 3,000 impression dan CTR link < 0.8% (hook mati).
  Tanda LETIH (untuk diagnosis & keutamaan ganti, bukan syarat kill): frequency 7h > 2.5 · CTR 4h jatuh > 30% berbanding 7h ·
  CPA 4h > 1.3× CPA 7h. Pemenang yang letih tapi ROAS 4h masih ≥ 2.0 → kekal, tapi pastikan pengganti produk itu sedang diuji.

DIAGNOSIS SETIAP KILL (rekod untuk angle seterusnya)
  CTR < 1.2% → hook / visual pembuka lemah · hook_rate rendah → 3 saat pertama tak hentikan scroll ·
  hook_rate ok, hold_rate rendah → babak tengah lemah / video panjang · CTR ok, CVR < 2.5% → janji ad ≠ salespage / tawaran lemah ·
  CPM > RM37 (1.5× asas) → audience sempit / kualiti ad rendah.
  Angle yang di-kill tidak diulang dalam 14 hari untuk produk sama (kecuali diagnosis kata hook, bukan angle).

CARA KILL (set_ad_status; reason WAJIB = data + rujukan SOP, cth "Hari ke-5, ROAS 1.03, RM179, 2 order, CPA RM89 > CPA_BE — SOP HQ Fasa 2 kill")
1. Kempen 1-1-1 → object_type "campaign", status PAUSED. Kempen ditutup kekal mati (peraturan 06:00 hanya hidupkan adset
   dalam kempen AKTIF) dan slot/bajetnya terus bebas.
2. Kempen dikongsi, SEMUA adset kalah → tutup kempen. Server tolak jika > 1 adset ACTIVE: buat semasa 00:00–06:00
   (peraturan 00:00 dah pause semua), atau pause adset satu-satu dahulu, kemudian tutup kempen.
3. Kempen dikongsi yang masih ada pemenang → pause AD yang kalah sahaja (bukan adset — adset dihidupkan semula 06:00).
   Adset tanpa ad ACTIVE tidak dikira slot (sejak commit 6a80939).
4. Ad di luar kempen autopilot ("CV - Video - Sabun", "[IMAGE] …") → server Ads Hub tolak. Selepas HQ lulus, pause AD itu
   melalui MCP Meta Ads rasmi (ads_update_entity, entity_type "ad", fields {"status":"PAUSED"}, akaun act_1540811267265252).
   Jangan pause adset (peraturan 06:00 hidupkan semula) dan jangan sentuh adset 120252113089850123 — ia adset templat autopilot.
5. JANGAN kill dengan pause adset — peraturan 06:00 hidupkan semula.
6. Maksimum 20 perubahan status sehari. Hidupkan semula (ACTIVE) hanya jika kill silap data.

CADANGAN HARIAN (mod manual) — SATU mesej kepada HQ setiap pagi, dalam susunan ini:
1. Jadual semua ad hidup: ad · produk · umur · belanja 4h · order 4h · ROAS 4h · CPA 4h · ROAS kumulatif · keputusan
   (KEKAL / PERHATI / CADANG KILL) · sebab SOP · diagnosis · cara kill.
2. Untuk SETIAP cadangan kill → terus cadang angle pengganti untuk slot itu (lihat PENGGANTIAN): produk sama,
   jenis (angle BARU / PECAHAN angle menang), angle · CFT · emosi · format, sebab dari data.
3. Draf penuh pengganti (ad copy, skrip VO, draf animasi / gambar) ikut skill autopilot-hq Langkah 3.
- Tiada set_ad_status / launch sebelum HQ balas. "lulus kill" = kill sahaja; "lulus semua" = kill + produksi & launch pengganti;
  HQ boleh beri pengecualian (cth "kekal Gangguan saka").
- Selepas kill: lapor kempen/ad yang ditutup + slot bebas.

PENGGANTIAN (kaedah Agent Miya, docs/sop-ejen-01.md bahagian D)
- Setiap ad yang di-kill diganti dengan ad PRODUK SAMA dalam cadangan yang sama, supaya slot tak kosong (struktur 1-1-1).
- Pilih SATU daripada dua jenis untuk setiap pengganti:
  a. ANGLE BARU — masalah/situasi teras lain dari salespage & FAQ, testimoni sebenar, tawaran (pakej, COD, harga),
     soalan/bantahan biasa, atau pemenang produk lain yang boleh dipindah.
  b. PECAHAN ANGLE MENANG — angle teras pemenang (ROAS 4h ≥ 2.0 atau pemenang terbukti HQ) dengan content berbeza:
     hook / pembuka baru, video ↔ gambar, visual lain, testimoni lain, emosi lain.
- Imbangan: produk TIADA pemenang → angle baru. Produk ADA pemenang → maksimum 1 daripada 3 pengganti/ujian aktif produk itu
  ialah pecahan angle menang; selebihnya angle baru. Maksimum 2 ad aktif berkongsi angle teras yang sama dalam satu produk.
- Ad aktif dalam produk sama mesti beza masalah/situasi teras, ATAU beza jenis CFT (Soalan / Testimoni / Direct / Tawaran) + emosi.
- Larangan: angle yang di-kill dalam 14 hari untuk produk itu (kecuali diagnosis kata hook yang lemah, bukan angle).
- Guna skill cft-adcreative-formula + skill produk setiap kali; tulis alasan pilihan dari data (angle mana menang/kalah).
- Setiap produk sentiasa ada sekurang-kurangnya 1 ad dalam fasa UJI.
- Bilangan pengganti = min(ad yang dicadang kill + slot bebas, had launch sehari, 3); jika lebih, utamakan produk
  dengan ad aktif paling sedikit.
```

## Log keputusan

| Tarikh | Keputusan |
|---|---|
| 12/11/2026 | Kill pertama ikut SOP ini: tutup kempen [1-1-1] Sendawa, Mak Ayah, Rumah Rasa Berat dan [AUTOPILOT] Sabun Garam; pause ad KK Pakej Seisi Keluarga, Wangian Sunnah, Anak Meracau, Kena Himpit dan GP Pasangan Berubah, Tanda-tanda, Suami Berikhtiar, Ikhtiar Dapur. Kekal: GP Bilik Asing, SG Mandian Ruqyah, SG Bayar Bila Sampai, KK Tengkuk Berat (pengecualian HQ). Mulai hari ini semua launch HQ = 1-1-1. |
| 12/11/2026 | Ganti split test Sabun Garam (3 kempen 1-1-1, mula 12/11 06:00, RM60/hari; asalnya dijadual 13/11 — launch dibuat 02:00 pagi, sepatutnya start "today"): Angin Saka video CFT-SITUASI (launch 50), Benteng Lepas Berubat gambar (launch 49), Hati Panas Dengan Anak video testimoni (launch 51). |
| 12/11/2026 | Kill KK Tengkuk Berat & Sesak Dada (pause ad 120252658398690123): hari 6, ROAS kumulatif 1.54 / 3h 1.24, RM229, 8 order — bukan pemenang hari ≥ 5. Diagnosis: AOV RM44 (halaman kasturi-kijang-3), bukan creative. Kekal: GP Bilik Asing, SG Mandian Ruqyah, SG Bayar Bila Sampai, 3 ad UJI 12/11. |
| 13/11/2026 | Kill "apa yg diisi dalam sabun" (CV - Video - Sabun, pause ad 120252113089890123 melalui MCP Meta Ads — server Ads Hub tolak ad luar autopilot): hari 44, ROAS 4h 1.65 (RM119.76, 3 order), 30h 1.36, CPM RM41. SOP dikemas kini: peraturan kill harian = ROAS 4 hari < 2.0 (hari ≥ 3, belanja 4h ≥ RM60) → cadang kill + terus cadang pengganti (angle baru / pecahan angle menang, kaedah Miya). |
| 13/11/2026 | Launch 3 kempen 1-1-1 (dilancar 00:07, mula 13/11 06:00, RM60/hari): GP Faridah "Bertengkar Benda Kecil" video testimoni (launch 53), KK Kak Salmah + Pakej 2+1 video → /kasturi-kijang (launch 54), SG "Balik Kerja Badan Berat" gambar Direct (launch 55; tertangguh ±20 min kerana had API Meta). |

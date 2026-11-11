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
- Keputusan kill dibuat SEKALI pada kitaran pagi, guna data KUMULATIF hingga semalam 23:59 (get_ads from = tarikh ad mula,
  to = semalam) + 3 hari terakhir. Jangan guna period 7d sahaja (boleh potong hari pertama ad). Jangan nilai data separuh hari ini.
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

KITARAN HIDUP SETIAP AD (umur = age_days dari get_ads, hari pertama = 1)
Fasa 1 — UJI (hari 1–2)
  Beri peluang penuh 2 hari. Kill awal HANYA jika:
  - belanja kumulatif ≥ RM50 dan 0 order, ATAU
  - ≥ 3,000 impression dan CTR link < 0.8% (hook mati)
Fasa 2 — SAH (hari 3, data kumulatif)
  - PEMENANG: ROAS ≥ 2.0 DAN ≥ 4 order → KEKAL
  - PERHATI: ROAS 1.5–2.0, atau ≥ 2.0 tapi < 4 order → lanjut, maksimum hingga hari 5
  - KILL: ROAS < 1.5 dengan belanja ≥ RM100, ATAU CPA > CPA_BE (RM49) dengan ≥ 2 order
  - Hari ≥ 5: mesti PEMENANG atau KILL (tiada lagi PERHATI)
Fasa 3 — KEKAL (pemenang)
  - Bajet naik ikut tangga server sahaja; jangan ubah bajet manual.
  - Kekal selagi ROAS 3 hari ≥ 1.8.
Fasa 4 — LETIH (pemenang mula jatuh; mana-mana 2 tanda)
  ROAS 3h < 1.8 sedangkan 7h ≥ 2.0 · frequency 7h > 2.5 · CTR 3h jatuh > 30% · CPA 3h > 1.3× CPA 7h.
  Tindakan: pastikan ada ad baru produk itu sedang diuji. Kill bila ROAS 3h < 1.3 (belanja 3h ≥ RM120),
  ATAU 2 hari berturut ROAS < 1.0. Satu hari teruk sahaja bukan alasan kill pemenang.

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
4. Ad di luar kempen autopilot ("CV - Video - Sabun", "[IMAGE] …") → server tolak; lapor kepada HQ untuk tindakan manual.
5. JANGAN kill dengan pause adset — peraturan 06:00 hidupkan semula.
6. Maksimum 20 perubahan status sehari. Hidupkan semula (ACTIVE) hanya jika kill silap data.

KELULUSAN (mod manual)
- Kitaran pagi berjadual HANYA bentang jadual cadangan: ad · fasa · ROAS kumulatif & 3h · belanja · order · keputusan
  (KEKAL / PERHATI / KILL) · sebab SOP · cara kill. Tiada set_ad_status.
- Kill dilaksana selepas HQ balas "lulus kill" (atau senarai pengecualian, cth "kekal Tengkuk Berat") dalam sesi yang sama.
- Selepas kill: lapor kempen/ad yang ditutup + slot bebas, kemudian draf ganti dengan angle LAIN (struktur 1-1-1).

PENGGANTIAN
- Setiap ad yang di-kill diganti pada kitaran berikutnya dengan angle berbeza (masalah/situasi teras, atau jenis CFT + emosi).
- Setiap produk sentiasa ada sekurang-kurangnya 1 ad dalam fasa UJI.
- Bilangan draf = min(slot bebas selepas kill, had launch sehari, 3).
```

## Log keputusan

| Tarikh | Keputusan |
|---|---|
| 12/11/2026 | Kill pertama ikut SOP ini: tutup kempen [1-1-1] Sendawa, Mak Ayah, Rumah Rasa Berat dan [AUTOPILOT] Sabun Garam; pause ad KK Pakej Seisi Keluarga, Wangian Sunnah, Anak Meracau, Kena Himpit dan GP Pasangan Berubah, Tanda-tanda, Suami Berikhtiar, Ikhtiar Dapur. Kekal: GP Bilik Asing, SG Mandian Ruqyah, SG Bayar Bila Sampai, KK Tengkuk Berat (pengecualian HQ). Mulai hari ini semua launch HQ = 1-1-1. |

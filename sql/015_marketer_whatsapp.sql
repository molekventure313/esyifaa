-- Migration 015: No. WhatsApp marketer untuk SP
-- Run in Supabase SQL Editor — SEBELUM deploy kod yang guna column ini
--
-- Berasingan dari `phone` (nombor pendaftaran) — ini nombor WhatsApp jualan yang dipapar di SP marketer.
-- NULL = section "Nak order melalui WhatsApp?" & butang WhatsApp terapung TIDAK dipapar di SP marketer.
-- Format: 60XXXXXXXXX (tanpa +)

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marketer_whatsapp TEXT;

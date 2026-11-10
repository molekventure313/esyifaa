-- Migration 041: Peraturan auto ikut produk (Ads Hub).
-- product NULL = peraturan umum (semua produk). product 'kasturi-kijang' dsb = hanya kempen produk itu
-- (produk kempen ikut tetapan kad Ads Spend / teka dari nama).
-- Produk yang ada peraturan ikut-syarat sendiri TIDAK dinilai oleh peraturan ikut-syarat umum.
-- Peraturan ikut jam (run_at_time) umum tetap terpakai pada semua produk.
-- Run in Supabase SQL Editor — SEBELUM deploy kod yang guna kolum ini

ALTER TABLE meta_rules ADD COLUMN IF NOT EXISTS product TEXT;
ALTER TABLE meta_rules DROP CONSTRAINT IF EXISTS meta_rules_product_check;
ALTER TABLE meta_rules ADD CONSTRAINT meta_rules_product_check
  CHECK (product IS NULL OR product IN ('sabun-garam', 'garam-pengasihan', 'kasturi-kijang', 'pengisian'));

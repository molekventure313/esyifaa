-- Migration 040: Metrik ads untuk ejen AI marketer & peraturan auto.
-- 1) Umur ad (first_delivery_date — hari pertama ad dapat impression)
-- 2) Frequency 7 hari dari Meta (reach_7d, frequency_7d — reach sebenar, bukan jumlah harian)
-- 3) Hook rate video: 3-saat views & ThruPlay harian
-- 4) Peraturan auto boleh guna metrik baru: age_days, frequency, cpm, hook_rate
-- 5) Log tindakan: sumber 'ejen' (ejen AI melalui MCP set_ad_status) & status 'shadow'
-- Run in Supabase SQL Editor — SEBELUM deploy kod yang guna kolum ini

ALTER TABLE meta_ads
  ADD COLUMN IF NOT EXISTS first_delivery_date DATE,
  ADD COLUMN IF NOT EXISTS reach_7d            INTEGER,
  ADD COLUMN IF NOT EXISTS frequency_7d        NUMERIC(6,2);

ALTER TABLE meta_insights_daily
  ADD COLUMN IF NOT EXISTS video_3s  INTEGER NOT NULL DEFAULT 0,   -- 3-second video views (action video_view)
  ADD COLUMN IF NOT EXISTS thruplays INTEGER NOT NULL DEFAULT 0;   -- ThruPlay (15 saat / tamat)

-- Isi umur ad sedia ada dari sejarah insights
UPDATE meta_ads m SET first_delivery_date = x.d
FROM (SELECT ad_id, MIN(date) AS d FROM meta_insights_daily WHERE impressions > 0 GROUP BY ad_id) x
WHERE x.ad_id = m.ad_id AND m.first_delivery_date IS NULL;

ALTER TABLE meta_rules DROP CONSTRAINT IF EXISTS meta_rules_metric_check;
ALTER TABLE meta_rules ADD CONSTRAINT meta_rules_metric_check
  CHECK (metric IN ('spend', 'orders', 'revenue', 'roas', 'cpa', 'ctr', 'cpm', 'frequency', 'age_days', 'hook_rate'));

ALTER TABLE meta_actions_log DROP CONSTRAINT IF EXISTS meta_actions_log_source_check;
ALTER TABLE meta_actions_log ADD CONSTRAINT meta_actions_log_source_check
  CHECK (source IN ('chat', 'jadual', 'auto', 'cadangan', 'autopilot', 'ejen'));
ALTER TABLE meta_actions_log DROP CONSTRAINT IF EXISTS meta_actions_log_status_check;
ALTER TABLE meta_actions_log ADD CONSTRAINT meta_actions_log_status_check
  CHECK (status IN ('ok', 'failed', 'rejected', 'shadow'));

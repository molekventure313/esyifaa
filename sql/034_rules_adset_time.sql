-- Migration 034: Peraturan auto peringkat adset, berbilang syarat, setiap jam & ikut jam (Ads Hub).
-- level 'adset'  = metrik dijumlahkan ikut adset (belanja, order sebenar, jualan, ROAS adset).
-- conditions     = syarat tambahan (DAN) — [{ "metric": "orders", "operator": "<", "value": 1 }].
-- frequency      = 'hourly' → tindakan boleh berulang setiap jam (contoh scale 30% sejam).
-- run_at_time    = 'HH:mm' waktu Malaysia → dijalankan sekali sehari pada semua adset dalam kempen aktif.
-- action_max     = had budget (RM) untuk budget_up.  budget_set → action_value = budget baru (RM).
-- Run in Supabase SQL Editor — SEBELUM deploy kod yang guna kolum ini

ALTER TABLE meta_rules ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT 'ad';
ALTER TABLE meta_rules ADD COLUMN IF NOT EXISTS conditions JSONB NOT NULL DEFAULT '[]';
ALTER TABLE meta_rules ADD COLUMN IF NOT EXISTS frequency TEXT NOT NULL DEFAULT 'daily';
ALTER TABLE meta_rules ADD COLUMN IF NOT EXISTS run_at_time TEXT;
ALTER TABLE meta_rules ADD COLUMN IF NOT EXISTS action_max NUMERIC(12,2);

ALTER TABLE meta_rules DROP CONSTRAINT IF EXISTS meta_rules_level_check;
ALTER TABLE meta_rules ADD CONSTRAINT meta_rules_level_check CHECK (level IN ('ad', 'adset'));
ALTER TABLE meta_rules DROP CONSTRAINT IF EXISTS meta_rules_frequency_check;
ALTER TABLE meta_rules ADD CONSTRAINT meta_rules_frequency_check CHECK (frequency IN ('daily', 'hourly'));
ALTER TABLE meta_rules DROP CONSTRAINT IF EXISTS meta_rules_run_at_time_check;
ALTER TABLE meta_rules ADD CONSTRAINT meta_rules_run_at_time_check CHECK (run_at_time IS NULL OR run_at_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');

ALTER TABLE meta_rules DROP CONSTRAINT IF EXISTS meta_rules_operator_check;
ALTER TABLE meta_rules ADD CONSTRAINT meta_rules_operator_check CHECK (operator IN ('>', '>=', '<', '<=', '='));

ALTER TABLE meta_rules DROP CONSTRAINT IF EXISTS meta_rules_action_check;
ALTER TABLE meta_rules ADD CONSTRAINT meta_rules_action_check
  CHECK (action IN ('pause', 'pause_adset', 'activate_adset', 'budget_up', 'budget_down', 'budget_set', 'notify'));

-- Migration 033: Peraturan auto — skop kempen autopilot & tindakan pause adset (Ads Hub).
-- scope 'autopilot' = hanya ads dalam kempen [AUTOPILOT] akaun itu. pause_adset = pause adset (bebaskan slot autopilot).
-- Run in Supabase SQL Editor — SEBELUM deploy kod yang guna kolum ini

ALTER TABLE meta_rules ADD COLUMN IF NOT EXISTS scope TEXT NOT NULL DEFAULT 'all';
ALTER TABLE meta_rules DROP CONSTRAINT IF EXISTS meta_rules_scope_check;
ALTER TABLE meta_rules ADD CONSTRAINT meta_rules_scope_check CHECK (scope IN ('all', 'autopilot'));

ALTER TABLE meta_rules DROP CONSTRAINT IF EXISTS meta_rules_action_check;
ALTER TABLE meta_rules ADD CONSTRAINT meta_rules_action_check
  CHECK (action IN ('pause', 'pause_adset', 'budget_up', 'budget_down', 'notify'));

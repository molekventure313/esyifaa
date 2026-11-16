-- Migration 044: Salinan templat strategi milik akaun (macam peraturan: guna templat HQ → jadi versi sendiri).
-- owner_id NULL  = templat HQ (diurus HQ di "🧠 Templat Strategi").
-- owner_id = id  = versi sendiri marketer / fighter (disalin dari templat HQ, boleh diedit pemilik).
-- source_id      = templat HQ asal (untuk "reset ikut HQ terkini").
-- Run in Supabase SQL Editor — SEBELUM deploy kod yang guna kolum ini.

ALTER TABLE autopilot_strategies
  ADD COLUMN IF NOT EXISTS owner_id  UUID   REFERENCES profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS source_id BIGINT REFERENCES autopilot_strategies(id) ON DELETE SET NULL;

-- Nama unik: templat HQ sesama HQ; versi sendiri sesama pemilik yang sama
ALTER TABLE autopilot_strategies DROP CONSTRAINT IF EXISTS autopilot_strategies_name_key;
CREATE UNIQUE INDEX IF NOT EXISTS autopilot_strategies_hq_name    ON autopilot_strategies (name) WHERE owner_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS autopilot_strategies_owner_name ON autopilot_strategies (owner_id, name) WHERE owner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS autopilot_strategies_owner ON autopilot_strategies (owner_id);

-- Migration 039: Mod autopilot setiap akaun + templat strategi (Ads Hub).
-- HQ pilih mod untuk setiap akaun: manual (lulus setiap draf — cara asal) / shadow (ejen buat semua, rekod cadangan, TIDAK launch)
-- / veto (launch sendiri, sentiasa mula 06:00 esok supaya HQ boleh batal) / auto (launch sendiri ikut SOP).
-- Templat strategi = SOP + had siap (bajet, slot, had harian, launch sehari, KPI) yang boleh dipakai pada mana-mana akaun.
-- Run in Supabase SQL Editor — SEBELUM deploy kod yang guna kolum/jadual ini

CREATE TABLE IF NOT EXISTS autopilot_strategies (
  id           BIGSERIAL PRIMARY KEY,
  name         TEXT NOT NULL UNIQUE,
  description  TEXT,
  sop          TEXT NOT NULL DEFAULT '',               -- arahan penuh untuk ejen (struktur, angle, creative, bila launch, bila berhenti)
  params       JSONB NOT NULL DEFAULT '{}'::jsonb,     -- adset_budget, max_adsets, daily_cap, max_launches_day, kpi_roas, products, creative, structure
  created_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE autopilot_strategies ENABLE ROW LEVEL SECURITY;   -- server sahaja (service role)

ALTER TABLE meta_connections
  ADD COLUMN IF NOT EXISTS autopilot_mode             TEXT    NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS autopilot_strategy_id      BIGINT  REFERENCES autopilot_strategies(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS autopilot_max_launches_day INTEGER NOT NULL DEFAULT 3,   -- launch baru maksimum sehari (MYT)
  ADD COLUMN IF NOT EXISTS autopilot_notes            TEXT;                         -- arahan tambahan khusus akaun ini

ALTER TABLE meta_connections DROP CONSTRAINT IF EXISTS meta_connections_autopilot_mode_check;
ALTER TABLE meta_connections ADD CONSTRAINT meta_connections_autopilot_mode_check
  CHECK (autopilot_mode IN ('manual', 'shadow', 'veto', 'auto'));

-- Mod shadow: cadangan ejen direkod sebagai status 'shadow' (tiada apa-apa dicipta di Meta)
ALTER TABLE autopilot_launches DROP CONSTRAINT IF EXISTS autopilot_launches_status_check;
ALTER TABLE autopilot_launches ADD CONSTRAINT autopilot_launches_status_check
  CHECK (status IN ('launching', 'scheduled', 'failed', 'cancelled', 'shadow'));
ALTER TABLE autopilot_launches ADD COLUMN IF NOT EXISTS mode TEXT;   -- mod akaun semasa launch/cadangan dibuat

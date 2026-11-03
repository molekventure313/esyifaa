-- Migration 032: Autopilot HQ (Ads Hub).
-- Claude di PC hasilkan creative (selepas diluluskan dalam sesi Claude) → launch melalui MCP E-Syifa.
-- Server kuatkuasa had: bajet setiap adset, bilangan adset aktif & jumlah bajet harian kempen autopilot.
-- Run in Supabase SQL Editor — SEBELUM deploy kod yang guna kolum/jadual ini

ALTER TABLE meta_connections
  ADD COLUMN IF NOT EXISTS autopilot_enabled      BOOLEAN       NOT NULL DEFAULT FALSE,  -- suis kecemasan: OFF = launch ditolak
  ADD COLUMN IF NOT EXISTS autopilot_campaign_id  TEXT,                                  -- kempen ABO "[AUTOPILOT]" (dicipta automatik)
  ADD COLUMN IF NOT EXISTS autopilot_adset_budget NUMERIC(12,2) NOT NULL DEFAULT 60,     -- RM sehari setiap adset baru
  ADD COLUMN IF NOT EXISTS autopilot_max_adsets   INTEGER       NOT NULL DEFAULT 5,      -- adset aktif maksimum dalam kempen autopilot
  ADD COLUMN IF NOT EXISTS autopilot_daily_cap    NUMERIC(12,2) NOT NULL DEFAULT 600,    -- jumlah bajet harian maksimum kempen autopilot
  ADD COLUMN IF NOT EXISTS autopilot_page_id      TEXT,                                  -- Facebook Page untuk ads
  ADD COLUMN IF NOT EXISTS autopilot_ig_id        TEXT,                                  -- akaun Instagram (pilihan)
  ADD COLUMN IF NOT EXISTS autopilot_template_adset_id TEXT;                             -- adset contoh: salin targeting, pixel & optimization

-- Rekod setiap launch autopilot (juga kunci idempotensi: client_ref unik)
CREATE TABLE IF NOT EXISTS autopilot_launches (
  id            BIGSERIAL PRIMARY KEY,
  marketer_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_ref    TEXT NOT NULL,
  product       TEXT,
  angle         TEXT NOT NULL,
  headline      TEXT,
  primary_text  TEXT,
  link          TEXT,
  video_id      TEXT,
  campaign_id   TEXT,
  adset_id      TEXT,
  creative_id   TEXT,
  ad_id         TEXT,
  daily_budget  NUMERIC(12,2),
  start_time    TIMESTAMPTZ,
  status        TEXT NOT NULL DEFAULT 'launching' CHECK (status IN ('launching', 'scheduled', 'failed', 'cancelled')),
  error         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (marketer_id, client_ref)
);
CREATE INDEX IF NOT EXISTS autopilot_launches_marketer_idx ON autopilot_launches (marketer_id, created_at DESC);
ALTER TABLE autopilot_launches ENABLE ROW LEVEL SECURITY;   -- server sahaja (service role)

-- Log tindakan: sumber baharu 'autopilot'
ALTER TABLE meta_actions_log DROP CONSTRAINT IF EXISTS meta_actions_log_source_check;
ALTER TABLE meta_actions_log ADD CONSTRAINT meta_actions_log_source_check
  CHECK (source IN ('chat', 'jadual', 'auto', 'cadangan', 'autopilot'));

-- Storan persendirian: video & thumbnail creative (Meta ambil melalui URL bertandatangan)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ads-creatives', 'ads-creatives', false)
ON CONFLICT (id) DO NOTHING;

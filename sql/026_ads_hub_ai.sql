-- Migration 026: Ads Hub Fasa 2–4 — chat AI, laporan pagi, log tindakan, tindakan berjadual,
-- peraturan auto & amaran. Bergantung pada migration 025.
-- Run in Supabase SQL Editor — SEBELUM deploy kod yang guna jadual ini

-- Had keselamatan setiap marketer (dikuatkuasa pada SEMUA perubahan: chat, jadual, auto)
ALTER TABLE meta_connections ADD COLUMN IF NOT EXISTS limit_max_budget          NUMERIC(12,2) NOT NULL DEFAULT 100;  -- budget harian maksimum satu adset (RM)
ALTER TABLE meta_connections ADD COLUMN IF NOT EXISTS limit_max_increase_pct    INTEGER NOT NULL DEFAULT 30;         -- kenaikan budget maksimum sekali naik (%)
ALTER TABLE meta_connections ADD COLUMN IF NOT EXISTS limit_auto_actions_per_day INTEGER NOT NULL DEFAULT 10;        -- tindakan auto maksimum sehari
ALTER TABLE meta_connections ADD COLUMN IF NOT EXISTS report_enabled            BOOLEAN NOT NULL DEFAULT TRUE;       -- laporan pagi automatik

-- Chat Ads: satu thread = satu perbualan. Mesej disimpan persis seperti dihantar ke Claude (append-only).
CREATE TABLE IF NOT EXISTS ads_chat_threads (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marketer_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title        TEXT,
  pending      JSONB,                               -- tindakan menunggu Sahkan/Batal + hasil tool baca giliran yang sama
  archived     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ads_chat_threads_marketer ON ads_chat_threads(marketer_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS ads_chat_messages (
  id           BIGSERIAL PRIMARY KEY,
  thread_id    UUID NOT NULL REFERENCES ads_chat_threads(id) ON DELETE CASCADE,
  marketer_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role         TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content      JSONB NOT NULL,                      -- string atau senarai content block (termasuk thinking/tool_use/tool_result)
  usage        JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ads_chat_messages_thread ON ads_chat_messages(thread_id, id);
CREATE INDEX IF NOT EXISTS idx_ads_chat_messages_quota ON ads_chat_messages(marketer_id, role, created_at);

-- Laporan pagi (satu sehari setiap marketer)
CREATE TABLE IF NOT EXISTS meta_reports (
  id           BIGSERIAL PRIMARY KEY,
  marketer_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  report_date  DATE NOT NULL,
  body         TEXT NOT NULL,
  summary      JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (marketer_id, report_date)
);

-- Log semua tindakan pada akaun Meta (berjaya, gagal, ditolak had)
CREATE TABLE IF NOT EXISTS meta_actions_log (
  id           BIGSERIAL PRIMARY KEY,
  marketer_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  source       TEXT NOT NULL CHECK (source IN ('chat', 'jadual', 'auto', 'cadangan')),
  action       TEXT NOT NULL,                       -- set_status | set_budget | duplicate_adset
  object_type  TEXT,
  object_id    TEXT,
  object_name  TEXT,
  before       JSONB,
  after        JSONB,
  status       TEXT NOT NULL CHECK (status IN ('ok', 'failed', 'rejected')),
  message      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_meta_actions_log_marketer ON meta_actions_log(marketer_id, created_at DESC);

-- Tindakan berjadual ("hidupkan adset X Jumaat 8 malam")
CREATE TABLE IF NOT EXISTS meta_scheduled_actions (
  id           BIGSERIAL PRIMARY KEY,
  marketer_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  run_at       TIMESTAMPTZ NOT NULL,
  action       TEXT NOT NULL,
  object_type  TEXT,
  object_id    TEXT NOT NULL,
  object_name  TEXT,
  params       JSONB NOT NULL DEFAULT '{}'::jsonb,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'done', 'failed', 'cancelled')),
  result       TEXT,
  created_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  executed_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_meta_scheduled_due ON meta_scheduled_actions(status, run_at);

-- Peraturan auto (guna ROAS/order sebenar)
CREATE TABLE IF NOT EXISTS meta_rules (
  id            BIGSERIAL PRIMARY KEY,
  marketer_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  metric        TEXT NOT NULL CHECK (metric IN ('spend', 'orders', 'revenue', 'roas', 'cpa', 'ctr')),
  operator      TEXT NOT NULL CHECK (operator IN ('>', '>=', '<', '<=')),
  value         NUMERIC(12,2) NOT NULL,
  window_days   INTEGER NOT NULL DEFAULT 3 CHECK (window_days BETWEEN 1 AND 30),
  min_spend     NUMERIC(12,2) NOT NULL DEFAULT 0,  -- syarat dinilai hanya jika belanja tempoh ≥ nilai ini
  action        TEXT NOT NULL CHECK (action IN ('pause', 'budget_up', 'budget_down', 'notify')),
  action_value  NUMERIC(12,2),                      -- % untuk budget_up / budget_down
  mode          TEXT NOT NULL DEFAULT 'suggest' CHECK (mode IN ('suggest', 'auto')),
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  last_run_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_meta_rules_marketer ON meta_rules(marketer_id);

-- Cadangan peraturan & amaran sistem (dipaparkan di dashboard)
CREATE TABLE IF NOT EXISTS meta_events (
  id           BIGSERIAL PRIMARY KEY,
  marketer_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rule_id      BIGINT REFERENCES meta_rules(id) ON DELETE SET NULL,
  kind         TEXT NOT NULL CHECK (kind IN ('suggestion', 'alert')),
  severity     TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warn', 'critical')),
  object_type  TEXT,
  object_id    TEXT,
  object_name  TEXT,
  title        TEXT NOT NULL,
  detail       TEXT,
  action       JSONB,                               -- tindakan yang dicadangkan (untuk butang Sahkan)
  status       TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'executed', 'dismissed', 'failed')),
  dedupe_key   TEXT UNIQUE,                         -- elak amaran/cadangan sama berulang
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_meta_events_open ON meta_events(marketer_id, status, created_at DESC);

-- Hanya server (service role) baca/tulis
ALTER TABLE ads_chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_actions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_scheduled_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_events ENABLE ROW LEVEL SECURITY;

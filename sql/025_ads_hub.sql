-- Migration 025: Ads Hub (Fasa 1) — setiap marketer sambung akaun Meta sendiri (token System User),
-- data iklan disync setiap jam dan dipadankan dengan order sebenar (submissions.utm_content = ID ad Meta).
-- Run in Supabase SQL Editor — SEBELUM deploy kod yang guna jadual ini

-- Sambungan Meta setiap marketer (satu marketer = satu ad account)
CREATE TABLE IF NOT EXISTS meta_connections (
  marketer_id       UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  token_encrypted   TEXT NOT NULL,                  -- AES-256-GCM, kunci env ADS_TOKEN_KEY (tidak pernah dihantar ke browser)
  token_last4       TEXT NOT NULL,
  ad_account_id     TEXT NOT NULL,                  -- act_xxx
  ad_account_name   TEXT,
  currency          TEXT,
  status            TEXT NOT NULL DEFAULT 'ok' CHECK (status IN ('ok', 'error')),
  status_message    TEXT,                           -- sebab error (cth: token tamat / tiada akses)
  checked_at        TIMESTAMPTZ,
  last_synced_at    TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cache ads (status, nama, budget) — dikemas kini setiap sync
CREATE TABLE IF NOT EXISTS meta_ads (
  ad_id             TEXT PRIMARY KEY,
  marketer_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ad_account_id     TEXT NOT NULL,
  campaign_id       TEXT,
  campaign_name     TEXT,
  campaign_status   TEXT,
  adset_id          TEXT,
  adset_name        TEXT,
  adset_status      TEXT,
  adset_daily_budget NUMERIC(12,2),                 -- RM
  name              TEXT,
  status            TEXT,                           -- effective_status ad (ACTIVE, PAUSED, ADSET_PAUSED, CAMPAIGN_PAUSED, DISAPPROVED, ...)
  headline          TEXT,
  thumbnail_url     TEXT,
  angle             TEXT,                           -- tag angle oleh marketer (kosong = guna nama adset)
  created_time      TIMESTAMPTZ,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_meta_ads_marketer ON meta_ads(marketer_id);

-- Prestasi harian setiap ad (tarikh ikut zon waktu ad account)
CREATE TABLE IF NOT EXISTS meta_insights_daily (
  ad_id             TEXT NOT NULL,
  date              DATE NOT NULL,
  marketer_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  spend             NUMERIC(12,2) NOT NULL DEFAULT 0,
  impressions       INTEGER NOT NULL DEFAULT 0,
  reach             INTEGER NOT NULL DEFAULT 0,
  link_clicks       INTEGER NOT NULL DEFAULT 0,
  pixel_purchases   INTEGER NOT NULL DEFAULT 0,
  pixel_value       NUMERIC(12,2) NOT NULL DEFAULT 0,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (ad_id, date)
);
CREATE INDEX IF NOT EXISTS idx_meta_insights_marketer_date ON meta_insights_daily(marketer_id, date);

-- Padanan order ↔ ad
CREATE INDEX IF NOT EXISTS idx_submissions_utm_content ON submissions(utm_content);

-- Hanya server (service role) baca/tulis
ALTER TABLE meta_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_insights_daily ENABLE ROW LEVEL SECURITY;

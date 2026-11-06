-- Migration 038: Laporan Saya (Fighter) — kos ads fighter sendiri, berasingan dari ads_spend HQ.
-- source 'auto'   = belanja Meta + SST 8% dari Ads Hub fighter (tetapan "Isi ads spend automatik", sync setiap jam)
-- source 'manual' = diisi sendiri oleh fighter di Laporan Saya
-- Run in Supabase SQL Editor — SEBELUM deploy kod yang guna jadual ini

CREATE TABLE IF NOT EXISTS fighter_ads_spend (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fighter_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  spend_date  DATE NOT NULL,
  product     TEXT NOT NULL,                                -- sabun-garam / garam-pengasihan / kasturi-kijang / pengisian
  amount      NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  source      TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'auto')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (fighter_id, spend_date, product)
);
CREATE INDEX IF NOT EXISTS idx_fighter_ads_spend_date ON fighter_ads_spend(fighter_id, spend_date);

ALTER TABLE fighter_ads_spend ENABLE ROW LEVEL SECURITY;

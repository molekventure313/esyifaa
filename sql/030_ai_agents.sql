-- Migration 030: Ejen AI marketer + ads spend automatik dari Meta (Ads Hub).
-- Ejen AI = profil marketer biasa bertanda is_ai_agent (tiada login, gaji/komisen 0), diurus super_admin di Ads Hub.
-- Ads spend automatik: belanja Meta (+SST 8%) ditulis ke ads_spend ikut produk setiap kali sync.
-- Run in Supabase SQL Editor — SEBELUM deploy kod yang guna kolum/jadual ini

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_ai_agent BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE meta_connections
  ADD COLUMN IF NOT EXISTS auto_ads_spend  BOOLEAN NOT NULL DEFAULT FALSE,           -- tulis ads_spend dari Meta
  ADD COLUMN IF NOT EXISTS default_product TEXT    NOT NULL DEFAULT 'sabun-garam';   -- produk campaign yang tak dapat diteka

-- Produk setiap campaign (untuk pecahan ads_spend ikut produk). Tiada baris = teka dari nama / default_product.
CREATE TABLE IF NOT EXISTS meta_campaign_products (
  marketer_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  campaign_id  TEXT NOT NULL,
  product      TEXT NOT NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (marketer_id, campaign_id)
);
ALTER TABLE meta_campaign_products ENABLE ROW LEVEL SECURITY;   -- server sahaja (service role)

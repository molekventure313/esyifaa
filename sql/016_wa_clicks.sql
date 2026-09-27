-- Migration 016: Rekod klik butang WhatsApp (section "Nak order melalui WhatsApp?") + UTM
-- Run in Supabase SQL Editor — SEBELUM deploy kod yang guna jadual ini

CREATE TABLE IF NOT EXISTS wa_clicks (
  id            BIGSERIAL PRIMARY KEY,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  marketer_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,  -- NULL = SP HQ
  source        TEXT,          -- slug SP, cth: 'sabun-garam-2'
  product       TEXT,          -- 'sabun-garam' | 'garam-pengasihan' | 'kasturi-kijang' | NULL
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  utm_content   TEXT,
  utm_term      TEXT,
  fbclid        TEXT,
  ip_address    TEXT,
  user_agent    TEXT
);

CREATE INDEX IF NOT EXISTS idx_wa_clicks_created_at  ON wa_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_wa_clicks_marketer_id ON wa_clicks(marketer_id);

-- Hanya server (service role) tulis/baca — tiada akses terus dari client
ALTER TABLE wa_clicks ENABLE ROW LEVEL SECURITY;

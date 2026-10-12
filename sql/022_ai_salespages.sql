-- Migration 022: SP Generator AI — marketer jana SP sendiri ikut angle (Framework FSP 10%)
-- Run in Supabase SQL Editor — SEBELUM deploy kod yang guna jadual ini

CREATE TABLE IF NOT EXISTS ai_salespages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_key       TEXT NOT NULL,                  -- 'sabun-garam' | 'kasturi-kijang' | 'garam-pengasihan' | 'pengisian-esyifa' | 'ruqyah-harian' | 'rawatan'
  slug              TEXT NOT NULL UNIQUE,           -- URL awam: /s/<slug>
  title             TEXT NOT NULL,                  -- nama dalaman (untuk marketer)
  angle             JSONB NOT NULL DEFAULT '{}',    -- input angle (audience, masalah, hook, cerita, nada)
  content           JSONB NOT NULL DEFAULT '{}',    -- DRAF semasa (diedit)
  published_content JSONB,                          -- salinan yang dipapar kepada awam
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'unpublished')),
  published_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_salespages_owner ON ai_salespages(owner_id, updated_at DESC);

-- Log setiap panggilan AI (kuota bulanan + kos token)
CREATE TABLE IF NOT EXISTS ai_generation_logs (
  id             BIGSERIAL PRIMARY KEY,
  user_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  salespage_id   UUID REFERENCES ai_salespages(id) ON DELETE SET NULL,
  kind           TEXT NOT NULL,                    -- 'brief' (= 1 jana penuh) | 'section' | 'rewrite'
  model          TEXT,
  input_tokens   INTEGER,
  output_tokens  INTEGER,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_generation_logs_user ON ai_generation_logs(user_id, created_at DESC);

-- Hanya server (service role) baca/tulis
ALTER TABLE ai_salespages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_logs ENABLE ROW LEVEL SECURITY;

-- Storage bucket AWAM untuk gambar SP (dipapar terus di SP)
INSERT INTO storage.buckets (id, name, public)
VALUES ('sp-images', 'sp-images', true)
ON CONFLICT (id) DO NOTHING;

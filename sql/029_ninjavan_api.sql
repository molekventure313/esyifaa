-- Migration 029: NinjaVan API — push order terus (Order Create 4.2), waybill, webhook V2
-- Run in Supabase SQL Editor — SEBELUM deploy kod yang guna jadual ini

-- 1. Cache token OAuth (WAJIB oleh NinjaVan — audit gagal jika token diminta setiap request)
--    id = '<env>:<client_id>' → token sandbox & live berasingan
CREATE TABLE IF NOT EXISTS ninjavan_tokens (
  id            TEXT PRIMARY KEY,
  access_token  TEXT NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Parcel yang dihantar ke NinjaVan melalui API (satu baris = satu tracking number)
--    submission_id kosong untuk order ujian audit sandbox
CREATE TABLE IF NOT EXISTS ninjavan_shipments (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  env                        TEXT NOT NULL CHECK (env IN ('sandbox', 'live')),
  submission_id              UUID REFERENCES submissions(id) ON DELETE SET NULL,
  requested_tracking_number  TEXT NOT NULL UNIQUE,
  tracking_number            TEXT UNIQUE,                 -- dipulangkan NinjaVan (prefix + requested)
  is_test                    BOOLEAN NOT NULL DEFAULT false,
  cod_amount                 NUMERIC(10,2) NOT NULL DEFAULT 0,
  status                     TEXT NOT NULL DEFAULT 'Created',  -- 'status' webhook (Pending Pickup, Picked Up, Delivered, ...)
  event                      TEXT,                        -- 'event' webhook penuh (cth. 'Delivered, Received by Customer')
  is_terminal                BOOLEAN NOT NULL DEFAULT false,
  last_event_at              TIMESTAMPTZ,
  delivered_at               TIMESTAMPTZ,
  returned_at                TIMESTAMPTZ,
  cancelled_at               TIMESTAMPTZ,
  cod_remitted_at            TIMESTAMPTZ,                 -- diisi bila NinjaVan bayar COD (padanan laporan remittance)
  waybill_path               TEXT,                        -- PDF dalam bucket 'ninjavan-waybills' (WAJIB cache — API waybill sekali sahaja)
  request_payload            JSONB,
  response_payload           JSONB,
  created_by                 UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_nv_shipments_submission ON ninjavan_shipments(submission_id);
CREATE INDEX IF NOT EXISTS idx_nv_shipments_status ON ninjavan_shipments(status, created_at DESC);

-- 3. Log mentah setiap webhook V2 (audit + proses semula). Ulangan webhook yang sama diabaikan.
CREATE TABLE IF NOT EXISTS ninjavan_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number  TEXT NOT NULL,
  status           TEXT,
  event            TEXT,
  event_at         TIMESTAMPTZ,
  payload          JSONB NOT NULL,
  received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tracking_number, event, event_at)
);
CREATE INDEX IF NOT EXISTS idx_nv_events_tracking ON ninjavan_events(tracking_number, event_at DESC);

-- Hanya server (service role) baca/tulis
ALTER TABLE ninjavan_tokens    ENABLE ROW LEVEL SECURITY;
ALTER TABLE ninjavan_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ninjavan_events    ENABLE ROW LEVEL SECURITY;

-- Storage bucket PERSENDIRIAN untuk PDF waybill (dibaca melalui signed URL dari server)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ninjavan-waybills', 'ninjavan-waybills', false)
ON CONFLICT (id) DO NOTHING;

-- Migration 021: Pengisian Stok — staff upload gambar stok, pemilik buat bacaan ruqyah jarak jauh & tanda selesai
-- Run in Supabase SQL Editor — SEBELUM deploy kod yang guna jadual ini

CREATE TABLE IF NOT EXISTS stock_filling_photos (
  id           BIGSERIAL PRIMARY KEY,
  product      TEXT NOT NULL DEFAULT 'lain',     -- 'sabun-garam' | 'garam-pengasihan' | 'kasturi-kijang' | 'lain'
  image_path   TEXT NOT NULL,                    -- path dalam storage bucket 'stock-filling'
  qty          INTEGER,                          -- bilangan unit dalam gambar (pilihan)
  notes        TEXT,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
  uploaded_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  done_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  done_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_filling_status ON stock_filling_photos(status, product, created_at DESC);

-- Hanya server (service role) baca/tulis
ALTER TABLE stock_filling_photos ENABLE ROW LEVEL SECURITY;

-- Storage bucket PERSENDIRIAN untuk gambar (dibaca melalui signed URL dari server)
INSERT INTO storage.buckets (id, name, public)
VALUES ('stock-filling', 'stock-filling', false)
ON CONFLICT (id) DO NOTHING;

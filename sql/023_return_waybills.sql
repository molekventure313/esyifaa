-- Migration 023: Return Parcel — staff upload gambar waybill parcel yang dipulangkan (COD return)
-- Gambar dibaca & dipadankan dengan order, kemudian order ditanda return (stok dipulangkan,
-- order keluar dari sales/profit/komisen) dan gambar ditanda 'processed'.
-- Run in Supabase SQL Editor — SEBELUM deploy kod yang guna jadual ini

CREATE TABLE IF NOT EXISTS return_waybills (
  id             BIGSERIAL PRIMARY KEY,
  image_path     TEXT NOT NULL,                    -- path dalam storage bucket 'return-waybills'
  notes          TEXT,                             -- nota staff (pilihan)
  status         TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'processed', 'unmatched')),
  submission_id  UUID REFERENCES submissions(id) ON DELETE SET NULL,   -- order yang dipadankan
  process_note   TEXT,                             -- cth: sebab tak dapat dipadan / order dah di-return sebelum ini
  uploaded_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  processed_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  processed_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_return_waybills_status ON return_waybills(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_return_waybills_submission ON return_waybills(submission_id);

-- Hanya server (service role) baca/tulis
ALTER TABLE return_waybills ENABLE ROW LEVEL SECURITY;

-- Storage bucket PERSENDIRIAN untuk gambar waybill (dibaca melalui signed URL dari server)
INSERT INTO storage.buckets (id, name, public)
VALUES ('return-waybills', 'return-waybills', false)
ON CONFLICT (id) DO NOTHING;

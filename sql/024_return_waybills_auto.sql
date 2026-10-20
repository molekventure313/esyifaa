-- Migration 024: Return Parcel automatik — AI baca waybill, padankan order, tanda return.
--   status: pending → processing → processed (dah tanda return) | review (perlu semakan, ada order cadangan) | unmatched
--   Gambar dipadam 7 hari selepas 'processed'; maklumat yang dibaca (extracted) kekal untuk rujukan.
-- Run in Supabase SQL Editor — SEBELUM deploy kod yang guna kolum ini

ALTER TABLE return_waybills ADD COLUMN IF NOT EXISTS extracted             JSONB;        -- maklumat dibaca dari waybill (nama, 4 digit telefon, poskod, COD, unit, tracking)
ALTER TABLE return_waybills ADD COLUMN IF NOT EXISTS candidates            JSONB;        -- order cadangan untuk 'review'
ALTER TABLE return_waybills ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ;  -- elak diproses serentak; tersangkut > 10 min → cuba semula
ALTER TABLE return_waybills ADD COLUMN IF NOT EXISTS image_deleted_at      TIMESTAMPTZ;  -- gambar dipadam (7 hari selepas selesai)

ALTER TABLE return_waybills DROP CONSTRAINT IF EXISTS return_waybills_status_check;
ALTER TABLE return_waybills ADD CONSTRAINT return_waybills_status_check
  CHECK (status IN ('pending', 'processing', 'processed', 'review', 'unmatched'));

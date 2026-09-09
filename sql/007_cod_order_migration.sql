-- ============================================================
-- Migration 007: COD Orders & Amount Paid Column
-- Jalankan dalam Supabase SQL Editor
-- ============================================================

-- 1. Drop existing payment_type constraint dan tambah 'cod'
ALTER TABLE public.submissions
  DROP CONSTRAINT IF EXISTS submissions_payment_type_check;

ALTER TABLE public.submissions
  ADD CONSTRAINT submissions_payment_type_check
  CHECK (payment_type IN ('appointment', 'fpx_payment', 'cod'));

-- 2. Tambah column amount_paid untuk simpan jumlah sebenar order
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2) DEFAULT NULL;

-- 3. Backfill: COD orders yang pending → completed (order diterima = confirmed)
UPDATE public.submissions
  SET payment_status = 'completed'
  WHERE payment_type = 'cod'
    AND (payment_status = 'pending' OR payment_status IS NULL);

-- 4. Backfill amount_paid untuk COD orders dari notes field
--    Format notes: "[COD ORDER] [STATUS: pending] [AMOUNT: RM40] [QTY: 1 unit]"
UPDATE public.submissions
  SET amount_paid = (
    regexp_match(notes, '\[AMOUNT: RM([0-9]+(?:\.[0-9]+)?)\]')
  )[1]::DECIMAL
  WHERE payment_type = 'cod'
    AND notes ILIKE '%[AMOUNT: RM%'
    AND amount_paid IS NULL;

-- 5. Index untuk performance
CREATE INDEX IF NOT EXISTS idx_submissions_amount_paid ON public.submissions(amount_paid);

-- ✅ Verify:
-- SELECT payment_type, payment_status, count(*), sum(amount_paid) FROM submissions GROUP BY 1, 2;

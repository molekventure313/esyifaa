-- 043: Order duplikat — pelanggan sama (no. telefon) order produk sama dalam 7 hari.
--   COD  → auto batal (payment_status = 'cancelled') + nota "dah disubmit sebelum ini"
--   FPX  → ditanda sahaja (dah bayar — admin semak / refund)
-- Juga membenarkan payment_status 'cancelled' (sebelum ini disekat CHECK — auto-batal order pending gagal senyap).

DO $$
DECLARE c text;
BEGIN
  FOR c IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.submissions'::regclass AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%payment_status%'
  LOOP
    EXECUTE format('ALTER TABLE public.submissions DROP CONSTRAINT %I', c);
  END LOOP;
END $$;

ALTER TABLE public.submissions
  ADD CONSTRAINT submissions_payment_status_check
  CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled') OR payment_status IS NULL);

ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS duplicate_of   UUID REFERENCES public.submissions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS duplicate_note TEXT;

CREATE INDEX IF NOT EXISTS idx_submissions_duplicate_of ON public.submissions(duplicate_of) WHERE duplicate_of IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_submissions_phone_created ON public.submissions(phone, created_at);

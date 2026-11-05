-- 036: Tanda waybill NinjaVan yang dah dicetak (Pengurusan Order → tanda & penapis "Dah print / Belum print")
ALTER TABLE ninjavan_shipments
  ADD COLUMN IF NOT EXISTS waybill_printed_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS waybill_printed_by  UUID,
  ADD COLUMN IF NOT EXISTS waybill_print_count INT NOT NULL DEFAULT 0;

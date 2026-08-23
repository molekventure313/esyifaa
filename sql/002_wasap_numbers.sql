-- 002_wasap_numbers.sql
-- Table untuk simpan nombor WhatsApp perawat
-- Digunakan untuk auto-rotate di halaman /wa (FB Ads landing page)
-- Jalankan di Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.wasap_numbers (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT NOT NULL,           -- Nama perawat, e.g. "Perawat 1 — Ahmad"
    number     TEXT NOT NULL,           -- Nombor WA format E.164 tanpa '+', e.g. "601135172611"
    is_active  BOOLEAN DEFAULT true,    -- Boleh toggle off tanpa delete
    sort_order INTEGER DEFAULT 0,       -- Urutan dalam rotation (0 = pertama)
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_wasap_numbers_updated_at
    BEFORE UPDATE ON public.wasap_numbers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS — hanya admin boleh CRUD, semua orang boleh baca (untuk /wa page)
ALTER TABLE public.wasap_numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active wasap numbers"
    ON public.wasap_numbers FOR SELECT
    USING (is_active = true);

CREATE POLICY "Authenticated users can manage wasap numbers"
    ON public.wasap_numbers FOR ALL
    USING (auth.role() = 'authenticated');

-- Seed: Masukkan nombor pertama (tukar ke nombor sebenar)
INSERT INTO public.wasap_numbers (name, number, is_active, sort_order)
VALUES ('Perawat 1', '601135172611', true, 0)
ON CONFLICT DO NOTHING;

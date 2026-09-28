-- Migration 018: Saluran order (web / whatsapp) + sumber pelanggan order WhatsApp
-- Run in Supabase SQL Editor — SEBELUM deploy kod yang guna column ini
--
-- order_channel : 'web' (borang SP — default, semua order sedia ada) | 'whatsapp' (dimasukkan marketer/admin
--                 di dashboard → Order WhatsApp, terus diluluskan)
-- order_origin  : sumber pelanggan order WhatsApp — 'fb_ads' | 'repeat' | NULL

ALTER TABLE submissions ADD COLUMN IF NOT EXISTS order_channel TEXT NOT NULL DEFAULT 'web';
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS order_origin  TEXT;

CREATE INDEX IF NOT EXISTS idx_submissions_order_channel ON submissions(order_channel);

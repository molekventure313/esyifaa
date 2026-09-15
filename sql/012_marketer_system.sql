-- 1. Alter profiles table
DO $$
BEGIN
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('super_admin', 'admin', 'marketer', 'practitioner', 'perawat'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marketer_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marketer_basic_salary NUMERIC(10,2) DEFAULT 1700.00;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marketer_commission_pct NUMERIC(5,2) DEFAULT 10.00;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS meta_pixel_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS meta_access_token TEXT;


-- 2. Create marketer_pixels table
CREATE TABLE IF NOT EXISTS marketer_pixels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  marketer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  salespage_slug TEXT NOT NULL,
  pixel_type TEXT NOT NULL DEFAULT 'lead' CHECK (pixel_type IN ('lead', 'purchase')),
  meta_pixel_id TEXT,
  meta_access_token TEXT,
  meta_test_event_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(marketer_id, salespage_slug, pixel_type)
);

CREATE INDEX IF NOT EXISTS idx_marketer_pixels_marketer_id ON marketer_pixels(marketer_id);
CREATE INDEX IF NOT EXISTS idx_marketer_pixels_salespage_slug ON marketer_pixels(salespage_slug);

-- 3. Alter ads_spend table
ALTER TABLE ads_spend ADD COLUMN IF NOT EXISTS marketer_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

DO $$
BEGIN
    ALTER TABLE ads_spend DROP CONSTRAINT IF EXISTS ads_spend_spend_date_key;
    ALTER TABLE ads_spend ADD CONSTRAINT ads_spend_marketer_id_spend_date_key UNIQUE(marketer_id, spend_date);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_ads_spend_marketer_id ON ads_spend(marketer_id);

-- 4. Alter submissions table
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS marketer_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_submissions_marketer_id ON submissions(marketer_id);

-- 5. Alter page_views table
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS marketer_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_page_views_marketer_id ON page_views(marketer_id);

-- 6. Alter cases table
ALTER TABLE cases ADD COLUMN IF NOT EXISTS marketer_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_cases_marketer_id ON cases(marketer_id);

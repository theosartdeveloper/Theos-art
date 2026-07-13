-- Update company location for Theos Art (run in Supabase SQL Editor)
UPDATE site_settings
SET value = '342G+JX, Kigali, Rwanda', updated_at = NOW()
WHERE key = 'company_address';

INSERT INTO site_settings (key, value) VALUES
  ('company_address', '342G+JX, Kigali, Rwanda')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

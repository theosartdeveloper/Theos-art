-- Seed public company content for Theos Art Ltd
-- Run in Supabase SQL Editor after scripts/04-engineering-hub-platform.sql

INSERT INTO site_settings (key, value) VALUES
  ('about_content', 'Theos Art Ltd is a Rwanda-based art company focused on original artworks, creative experiences, and quality art materials for artists, collectors, and learners.

Through our Theos Art Hub platform, we offer studio pieces, supplies, and community programmes — combining gallery energy with practical tools for creating and collecting art in Kigali and beyond.'),
  ('mission_content', 'We make original art and quality art materials accessible — supporting creators, collectors, and learners with studio works, supplies, and inspiring creative experiences across Rwanda.'),
  ('company_email', 'kubwatheosart@gmail.com'),
  ('company_phone', '+250783086093'),
  ('company_phone_display', '+250 783 086 093'),
  ('company_whatsapp', '250783086093'),
  ('company_address', '342G+JX, Kigali, Rwanda'),
  ('company_logo_url', '/images/theos-art-logo.png'),
  ('payment_momo_code', '581661'),
  ('payment_account_name', 'THEOSART LTD'),
  ('payment_method_label', 'MTN Mobile Money (MoMo Pay)'),
  ('payment_workflow', 'Pay via MTN MoMo using the Pay Code below, then upload your payment receipt so our team can verify and confirm your order or enrollment.'),
  ('founder_name', 'Theos Art Studio'),
  ('founder_title', 'Art & Materials')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

INSERT INTO site_hero (title, subtitle, background_image, cta_primary_label, cta_primary_url, cta_secondary_label, cta_secondary_url, is_active)
SELECT
  'Theos Art',
  'Original artworks and quality art materials in Kigali — create, collect, and supply your studio.',
  '/hero/playlist',
  'Browse shop',
  '/shop',
  'About us',
  '/about',
  true
WHERE NOT EXISTS (SELECT 1 FROM site_hero WHERE is_active = true);

-- If a hero already exists, refresh copy for Theos Art branding
UPDATE site_hero SET
  title = 'Theos Art',
  subtitle = 'Original artworks and quality art materials in Kigali — create, collect, and supply your studio.',
  background_image = '/hero/playlist',
  cta_primary_label = 'Browse shop',
  cta_primary_url = '/shop',
  cta_secondary_label = 'About us',
  cta_secondary_url = '/about',
  updated_at = NOW()
WHERE is_active = true;

NOTIFY pgrst, 'reload schema';

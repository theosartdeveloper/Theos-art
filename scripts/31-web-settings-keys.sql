-- Extended website settings keys for Theos Art Ltd
-- Run in Supabase SQL Editor (safe to re-run — updates existing keys)

INSERT INTO site_settings (key, value) VALUES
  ('company_legal_name', 'Theos Art Ltd'),
  ('company_brand_name', 'Theos Art'),
  ('company_platform_name', 'Theos Art Hub'),
  ('company_email', 'kubwatheosart@gmail.com'),
  ('company_phone', '+250783086093'),
  ('company_phone_display', '+250 783 086 093'),
  ('company_whatsapp', '250783086093'),
  ('company_address', '342G+JX, Kigali, Rwanda'),
  ('company_slogan', 'Art that speaks'),
  ('company_tagline', 'Original artworks and quality art materials in Kigali, Rwanda.'),
  ('company_logo_url', '/images/theos-art-logo.png'),
  ('payment_momo_code', '581661'),
  ('payment_account_name', 'THEOSART LTD'),
  ('payment_method_label', 'MTN Mobile Money (MoMo Pay)'),
  ('payment_workflow', 'Pay via MTN MoMo using the Pay Code below, then upload your payment receipt so our team can verify and confirm your order or enrollment.'),
  ('seo_title', 'Theos Art — Art & Materials Rwanda'),
  ('seo_description', 'Original artworks and quality art materials in Kigali, Rwanda.'),
  ('seo_keywords', 'Theos Art, art Kigali, art materials Rwanda, original artworks, canvas, studio, East Africa')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

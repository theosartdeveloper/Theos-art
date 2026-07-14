INSERT INTO site_settings (key, value) VALUES
  ('certificate_stamp_url', '/images/company-stamp.png'),
  ('certificate_logo_url', '/images/theos-art-logo-v2.png'),
  ('certificate_signatory_name', 'Elie BISAMAZA'),
  ('certificate_signatory_title', 'Managing Director · Theos Art Ltd')
ON CONFLICT (key) DO NOTHING;

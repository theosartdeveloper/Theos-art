-- Clear stale local /images/* logo & stamp settings left from pre-R2 seeds.
-- After running: Admin → Website settings → Branding → re-upload company logo + certificate stamp,
-- then Save all settings (https://… R2 URLs are required for certificates and emails).

UPDATE site_settings
SET value = '', updated_at = NOW()
WHERE key IN ('certificate_logo_url', 'certificate_stamp_url', 'company_logo_url')
  AND value LIKE '/images/%';

-- Update public company contact email (site settings + existing installs).
UPDATE site_settings
SET value = 'info@theosartltd.com', updated_at = NOW()
WHERE key = 'company_email';

INSERT INTO site_settings (key, value)
VALUES ('company_email', 'info@theosartltd.com')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();

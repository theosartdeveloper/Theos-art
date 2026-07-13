-- Update homepage membership plans for Theos Art (free vs premium features)
-- Run after scripts/04-engineering-hub-platform.sql

INSERT INTO membership_plans (name, plan_type, benefits, features, price, billing_period, cta_label, cta_url, status, sort_order)
VALUES
  (
    'Free',
    'free',
    '["Browse the Art Gallery", "Public art events & announcements", "Shop catalogue access", "Create an account to order"]'::jsonb,
    '[]'::jsonb,
    0,
    'year',
    'Get started free',
    '/auth/register',
    'published',
    0
  ),
  (
    'Premium',
    'premium',
    '["Priority workshop access", "Studio support tickets with SLA", "Early notice on new artworks", "Members-only creative sessions", "Priority order handling after MoMo review"]'::jsonb,
    '["Workshop programmes", "Studio support", "Art events & announcements", "Member shop perks"]'::jsonb,
    35000,
    'programme',
    'Sign in for premium',
    '/auth/login?redirect=%2Fshop',
    'published',
    1
  )
ON CONFLICT DO NOTHING;

UPDATE membership_plans SET
  name = 'Free',
  benefits = '["Browse the Art Gallery", "Public art events & announcements", "Shop catalogue access", "Create an account to order"]'::jsonb,
  features = '[]'::jsonb,
  price = 0,
  billing_period = 'year',
  cta_label = 'Get started free',
  cta_url = '/auth/register',
  status = 'published',
  updated_at = NOW()
WHERE plan_type = 'free';

UPDATE membership_plans SET
  name = 'Premium',
  benefits = '["Priority workshop access", "Studio support tickets with SLA", "Early notice on new artworks", "Members-only creative sessions", "Priority order handling after MoMo review"]'::jsonb,
  features = '["Workshop programmes", "Studio support", "Art events & announcements", "Member shop perks"]'::jsonb,
  price = 35000,
  billing_period = 'programme',
  cta_label = 'Sign in for premium',
  cta_url = '/auth/login?redirect=%2Fshop',
  status = 'published',
  updated_at = NOW()
WHERE plan_type = 'premium';

NOTIFY pgrst, 'reload schema';

-- Engineering support subscription plans + gated ticket workflow
-- Run after scripts/07-manual-payment-verification.sql and scripts/04-engineering-hub-platform.sql

CREATE TABLE IF NOT EXISTS support_subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  duration_days INT NOT NULL DEFAULT 30,
  max_tickets INT,
  response_sla_hours INT,
  features JSONB NOT NULL DEFAULT '[]',
  sort_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES support_subscription_plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'payment_pending_review',
  payment_id UUID,
  applicant_phone TEXT,
  tickets_used INT NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS support_subscriptions_user_id_idx ON support_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS support_subscriptions_status_idx ON support_subscriptions(status);
CREATE INDEX IF NOT EXISTS support_subscriptions_active_idx ON support_subscriptions(user_id, ends_at)
  WHERE status = 'active';

ALTER TABLE payments ADD COLUMN IF NOT EXISTS support_subscription_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'payments_support_subscription_id_fkey'
  ) THEN
    ALTER TABLE payments
      ADD CONSTRAINT payments_support_subscription_id_fkey
      FOREIGN KEY (support_subscription_id) REFERENCES support_subscriptions(id) ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES support_subscriptions(id) ON DELETE SET NULL;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS requester_name TEXT;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS requester_email TEXT;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS requester_phone TEXT;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS admin_response TEXT;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS support_tickets_user_id_idx ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS support_tickets_status_idx ON support_tickets(status);

-- Default plans (admin can edit in panel)
INSERT INTO support_subscription_plans (name, slug, description, price, duration_days, max_tickets, response_sla_hours, features, sort_order, status)
VALUES
  (
    'Starter Support',
    'starter-support',
    'Individual creators — email-style help for one active shop or studio question at a time.',
    15000,
    30,
    3,
    48,
    '["Up to 3 support tickets per month", "48-hour response target", "Materials, studio & product questions", "MoMo receipt verification"]'::jsonb,
    1,
    'published'
  ),
  (
    'Professional Support',
    'professional-support',
    'For artists and collectors who need ongoing studio guidance.',
    35000,
    90,
    12,
    24,
    '["Up to 12 tickets over 90 days", "24-hour priority response", "Design review & troubleshooting", "Video call scheduling (by appointment)"]'::jsonb,
    2,
    'published'
  ),
  (
    'Enterprise Support',
    'enterprise-support',
    'Teams and frequent users — unlimited tickets with fastest SLA.',
    75000,
    365,
    NULL,
    8,
    '["Unlimited support tickets", "8-hour SLA on business days", "Dedicated studio specialist", "Order & commission review"]'::jsonb,
    3,
    'published'
  )
ON CONFLICT (slug) DO NOTHING;

INSERT INTO support_categories (name, slug, description, status)
VALUES
  ('Art Materials', 'art-materials', 'Paints, brushes, canvases, and studio supply questions', 'published'),
  ('Original Artworks', 'original-artworks', 'Commissions, collections, and purchasing studio pieces', 'published'),
  ('Workshops & Events', 'workshops-events', 'Creative sessions, exhibitions, and live painting', 'published'),
  ('Orders & Delivery', 'orders-delivery', 'Shop orders, pickup, and Kigali delivery', 'published')
ON CONFLICT (slug) DO NOTHING;

NOTIFY pgrst, 'reload schema';

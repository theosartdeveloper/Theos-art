-- Fix admin password for Theos Art (run anytime in Supabase SQL Editor)
-- Email:    kubwatheosart@gmail.com
-- Password: theosart2027
-- Hash:     bcrypt cost 10

INSERT INTO users (email, password_hash, first_name, last_name, role, status)
VALUES (
  'kubwatheosart@gmail.com',
  '$2a$10$iPJCVSNnGXd6ohaPB31g1ON/R9UPOct0HjjhhZkjYuw9Cd1BRJq02',
  'Theos',
  'Admin',
  'admin',
  'active'
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Also match case-insensitive if the unique constraint is on email as-stored
UPDATE users
SET
  password_hash = '$2a$10$iPJCVSNnGXd6ohaPB31g1ON/R9UPOct0HjjhhZkjYuw9Cd1BRJq02',
  role = 'admin',
  status = 'active',
  updated_at = NOW()
WHERE lower(email) = lower('kubwatheosart@gmail.com');

SELECT email, role, status,
  left(password_hash, 7) AS hash_prefix
FROM users
WHERE lower(email) = lower('kubwatheosart@gmail.com');

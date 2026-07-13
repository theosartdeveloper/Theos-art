-- Seed administrator for Theos Art (bcrypt-hashed password)
-- Run AFTER scripts/00-create-users-table.sql
--
-- Login at /auth/login:
--   Email:    kubwatheosart@gmail.com
--   Password: theosart2027
--   Role:     Administrator (admin)  ← must select Admin role on the login form
--
-- Password is stored as bcrypt ($2a$ / cost 10). Do not store plain-text passwords.

DELETE FROM users WHERE lower(email) = lower('kubwatheosart@gmail.com');
DELETE FROM users WHERE lower(email) = lower('eliebisamaza@gmail.com');

INSERT INTO users (email, password_hash, first_name, last_name, role, status)
VALUES (
  'kubwatheosart@gmail.com',
  '$2a$10$iPJCVSNnGXd6ohaPB31g1ON/R9UPOct0HjjhhZkjYuw9Cd1BRJq02',
  'Theos',
  'Admin',
  'admin',
  'active'
);

-- If the user already exists, force-update the hash (safe to re-run)
UPDATE users
SET
  password_hash = '$2a$10$iPJCVSNnGXd6ohaPB31g1ON/R9UPOct0HjjhhZkjYuw9Cd1BRJq02',
  first_name = 'Theos',
  last_name = 'Admin',
  role = 'admin',
  status = 'active',
  updated_at = NOW()
WHERE lower(email) = lower('kubwatheosart@gmail.com');

SELECT email, role, status,
  CASE
    WHEN password_hash LIKE '$2a$%' OR password_hash LIKE '$2b$%' THEN 'bcrypt'
    ELSE 'plain_or_other'
  END AS password_type
FROM users
WHERE lower(email) = lower('kubwatheosart@gmail.com');

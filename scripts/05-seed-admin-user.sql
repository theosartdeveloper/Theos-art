-- Seed administrator for Theos Art
-- Run AFTER scripts/00-create-users-table.sql
--
-- Login at /auth/login:
--   Email:    kubwatheosart@gmail.com
--   Password: admin123
--   Role:     Administrator (admin)
--
-- Change the password after first login.
-- Uses plain password in password_hash for compatibility (app accepts bcrypt OR plain legacy values)

DELETE FROM users WHERE lower(email) = lower('kubwatheosart@gmail.com');
DELETE FROM users WHERE lower(email) = lower('eliebisamaza@gmail.com');

INSERT INTO users (email, password_hash, first_name, last_name, role, status)
VALUES (
  'kubwatheosart@gmail.com',
  'admin123',
  'Theos',
  'Admin',
  'admin',
  'active'
);

SELECT email, role, status FROM users
WHERE lower(email) = lower('kubwatheosart@gmail.com');

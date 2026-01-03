-- Migration: Add email column to users table
-- Purpose: Support email notifications
-- Created: 2026-01-03

ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Update existing users if needed (placeholder, normally would be empty or manual)
-- UPDATE users SET email = username || '@hospital.com' WHERE email IS NULL;

COMMENT ON COLUMN users.email IS 'Email address for system notifications';

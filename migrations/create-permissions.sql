-- Migration: Create permissions table
-- Purpose: Store role-based permissions for dynamic permission management
-- Created: 2026-01-03

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(50) NOT NULL,
    permission VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate role-permission combinations
    UNIQUE(role, permission)
);

-- Ensure defaults are set if table existed without them
ALTER TABLE permissions ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE permissions ALTER COLUMN updated_at SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE permissions ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_permissions_role ON permissions(role);

-- Seed default permissions from current hardcoded map
INSERT INTO permissions (id, role, permission, created_at, updated_at) VALUES
-- ADMIN has all permissions (wildcard)
(gen_random_uuid(), 'ADMIN', '*', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- MANAGER permissions
(gen_random_uuid(), 'MANAGER', 'document:read', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'MANAGER', 'document:create', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'MANAGER', 'document:update', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'MANAGER', 'document:delete', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'MANAGER', 'document:approve', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'MANAGER', 'tag:manage', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'MANAGER', 'stats:read', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- STAFF permissions
(gen_random_uuid(), 'STAFF', 'document:read', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'STAFF', 'document:create', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'STAFF', 'document:update', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'STAFF', 'stats:read', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- USER permissions
(gen_random_uuid(), 'USER', 'document:read', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'USER', 'document:create', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'USER', 'stats:read', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- VIEWER permissions
(gen_random_uuid(), 'VIEWER', 'document:read', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'VIEWER', 'stats:read', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)

ON CONFLICT (role, permission) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE permissions IS 'Stores role-based permissions for dynamic access control';
COMMENT ON COLUMN permissions.role IS 'Role name (ADMIN, MANAGER, STAFF, USER, VIEWER)';
COMMENT ON COLUMN permissions.permission IS 'Permission string (e.g., document:read, user:manage)';

const db = require('../models');
const { Permission } = db;
const auditService = require('../services/audit.service');

// In-memory cache for permissions
let permissionCache = {};
let cacheLastUpdated = null;

/**
 * Load permissions from database into cache
 */
const loadPermissionsToCache = async () => {
    try {
        const permissions = await Permission.findAll();
        permissionCache = {};

        permissions.forEach(perm => {
            if (!permissionCache[perm.role]) {
                permissionCache[perm.role] = [];
            }
            permissionCache[perm.role].push(perm.permission);
        });

        cacheLastUpdated = new Date();
        console.log('[Permission Cache] Loaded permissions:', permissionCache);
    } catch (error) {
        console.error('[Permission Cache] Error loading permissions:', error);
    }
};

/**
 * Get permissions for a specific role (used by middleware)
 */
const getPermissionsForRole = (role) => {
    return permissionCache[role] || [];
};

/**
 * Get all permissions grouped by role
 */
const getAllPermissions = async (req, res) => {
    try {
        const permissions = await Permission.findAll({
            order: [['role', 'ASC'], ['permission', 'ASC']]
        });

        // Group by role
        const grouped = {};
        permissions.forEach(perm => {
            if (!grouped[perm.role]) {
                grouped[perm.role] = [];
            }
            grouped[perm.role].push(perm.permission);
        });

        res.status(200).json({
            data: grouped,
            cacheLastUpdated
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get list of all available permissions
 */
const getAvailablePermissions = async (req, res) => {
    try {
        const availablePermissions = [
            // Document permissions
            'document:read',
            'document:create',
            'document:update',
            'document:delete',
            'document:approve',

            // User permissions
            'user:read',
            'user:create',
            'user:update',
            'user:delete',

            // Department permissions
            'department:read',
            'department:manage',

            // Other permissions
            'tag:manage',
            'stats:read',
            'audit:read',
            'permission:manage'
        ];

        const roles = ['ADMIN', 'MANAGER', 'STAFF', 'USER', 'VIEWER'];

        res.status(200).json({
            permissions: availablePermissions,
            roles: roles
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Update permissions for a specific role
 */
const updateRolePermissions = async (req, res) => {
    try {
        const { role } = req.params;
        const { permissions } = req.body;

        if (!permissions || !Array.isArray(permissions)) {
            return res.status(400).json({ message: 'Permissions must be an array' });
        }

        // Prevent removing critical permissions from ADMIN
        if (role === 'ADMIN' && !permissions.includes('*')) {
            return res.status(400).json({
                message: 'Cannot remove wildcard (*) permission from ADMIN role'
            });
        }

        // Delete existing permissions for this role
        await Permission.destroy({ where: { role } });

        // Insert new permissions
        const permissionRecords = permissions.map(perm => ({
            role,
            permission: perm
        }));

        await Permission.bulkCreate(permissionRecords);

        // Reload cache
        await loadPermissionsToCache();

        // Audit log
        try {
            await auditService.logAction(
                req.userId,
                'UPDATE_PERMISSIONS',
                'permissions',
                role,
                { permissions },
                req
            );
        } catch (auditError) {
            console.error('Audit error:', auditError);
        }

        res.status(200).json({
            message: 'Permissions updated successfully',
            role,
            permissions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Reset permissions to default values
 */
const resetToDefault = async (req, res) => {
    try {
        // Delete all existing permissions
        await Permission.destroy({ where: {}, truncate: true });

        // Seed default permissions
        const defaultPermissions = [
            // ADMIN
            { role: 'ADMIN', permission: '*' },

            // MANAGER
            { role: 'MANAGER', permission: 'document:read' },
            { role: 'MANAGER', permission: 'document:create' },
            { role: 'MANAGER', permission: 'document:update' },
            { role: 'MANAGER', permission: 'document:delete' },
            { role: 'MANAGER', permission: 'document:approve' },
            { role: 'MANAGER', permission: 'tag:manage' },
            { role: 'MANAGER', permission: 'stats:read' },

            // STAFF
            { role: 'STAFF', permission: 'document:read' },
            { role: 'STAFF', permission: 'document:create' },
            { role: 'STAFF', permission: 'document:update' },
            { role: 'STAFF', permission: 'stats:read' },

            // USER
            { role: 'USER', permission: 'document:read' },
            { role: 'USER', permission: 'document:create' },
            { role: 'USER', permission: 'stats:read' },

            // VIEWER
            { role: 'VIEWER', permission: 'document:read' },
            { role: 'VIEWER', permission: 'stats:read' }
        ];

        await Permission.bulkCreate(defaultPermissions);

        // Reload cache
        await loadPermissionsToCache();

        // Audit log
        try {
            await auditService.logAction(
                req.userId,
                'RESET_PERMISSIONS',
                'permissions',
                'ALL',
                {},
                req
            );
        } catch (auditError) {
            console.error('Audit error:', auditError);
        }

        res.status(200).json({ message: 'Permissions reset to default successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllPermissions,
    getAvailablePermissions,
    updateRolePermissions,
    resetToDefault,
    loadPermissionsToCache,
    getPermissionsForRole
};

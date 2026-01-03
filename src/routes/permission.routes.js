const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permission.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

/**
 * All permission routes require ADMIN role
 */

// Get all permissions grouped by role
router.get(
    '/',
    [verifyToken, isAdmin],
    permissionController.getAllPermissions
);

// Get list of available permissions and roles
router.get(
    '/available',
    [verifyToken, isAdmin],
    permissionController.getAvailablePermissions
);

// Update permissions for a specific role
router.put(
    '/:role',
    [verifyToken, isAdmin],
    permissionController.updateRolePermissions
);

// Reset all permissions to default
router.post(
    '/reset',
    [verifyToken, isAdmin],
    permissionController.resetToDefault
);

module.exports = router;

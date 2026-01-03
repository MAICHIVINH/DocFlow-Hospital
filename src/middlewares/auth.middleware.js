const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt.config');

/**
 * Middleware verify JWT Token
 */
const verifyToken = (req, res, next) => {
    let token = req.headers['authorization']?.split(' ')[1];

    // Fallback: Check query parameter (for iframes/proxies)
    if (!token && req.query.token) {
        token = req.query.token;
    }

    if (!token) {
        return res.status(403).json({ message: 'No token provided!' });
    }

    jwt.verify(token, jwtConfig.secret, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized!' });
        }
        req.userId = decoded.id;
        req.userRole = decoded.role;
        req.userDeptId = decoded.department_id;
        next();
    });
};

/**
 * Middleware check Role
 * @param {Array} roles - Allowed roles for the route
 */
const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.userRole)) {
            return res.status(403).json({
                message: `Require one of the following roles: ${roles.join(', ')}`
            });
        }
        next();
    };
};

const isAdmin = (req, res, next) => {
    if (req.userRole !== 'ADMIN') {
        return res.status(403).json({ message: 'Quyền Admin là bắt buộc.' });
    }
    next();
};

const isManager = (req, res, next) => {
    if (req.userRole !== 'MANAGER') {
        return res.status(403).json({ message: 'Quyền Manager là bắt buộc.' });
    }
    next();
};

const isAdminOrManager = (req, res, next) => {
    if (req.userRole !== 'ADMIN' && req.userRole !== 'MANAGER') {
        return res.status(403).json({ message: 'Quyền Admin hoặc Manager là bắt buộc.' });
    }
    next();
};

/**
 * Fine-grained Permission Middleware
 * @param {String} permission - e.g., 'document:delete', 'user:manage'
 */
const checkPermission = (permission) => {
    return (req, res, next) => {
        const role = req.userRole;

        // Try to get permissions from database cache first
        const permissionController = require('../controllers/permission.controller');
        let allowedPermissions = permissionController.getPermissionsForRole(role);

        // Fallback to hardcoded map if cache is empty (safety measure)
        if (!allowedPermissions || allowedPermissions.length === 0) {
            console.warn(`[Auth] No cached permissions for role ${role}, using fallback`);
            const permissionMap = {
                'ADMIN': ['*'],
                'MANAGER': [
                    'document:read', 'document:create', 'document:update', 'document:delete',
                    'document:approve', 'tag:manage', 'stats:read'
                ],
                'STAFF': [
                    'document:read', 'document:create', 'document:update', 'stats:read'
                ],
                'USER': [
                    'document:read', 'document:create', 'stats:read'
                ],
                'VIEWER': [
                    'document:read', 'stats:read'
                ]
            };
            allowedPermissions = permissionMap[role] || [];
        }

        if (allowedPermissions.includes('*') || allowedPermissions.includes(permission)) {
            return next();
        }

        return res.status(403).json({
            message: `Bạn không có quyền thực hiện hành động này (${permission})`
        });
    };
};

module.exports = {
    verifyToken,
    authorizeRole,
    isAdmin,
    isManager,
    isAdminOrManager,
    checkPermission
};

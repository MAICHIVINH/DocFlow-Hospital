const db = require('../models');
const AuditLog = db.AuditLog;

/**
 * Audit Service
 * Handles recording of user actions for compliance and traceability
 */
const logAction = async (userId, action, targetTable, targetId, payload = {}, req = null) => {
    try {
        // Extract IP address from request with better handling
        let ipAddress = '0.0.0.0';

        if (req) {
            // Try to get real IP from various proxy headers
            ipAddress = req.headers['x-forwarded-for']
                || req.headers['x-real-ip']
                || req.connection.remoteAddress
                || req.socket.remoteAddress
                || '0.0.0.0';

            // Handle multiple IPs in x-forwarded-for (take the first one)
            if (ipAddress.includes(',')) {
                ipAddress = ipAddress.split(',')[0].trim();
            }

            // Convert IPv6 localhost to IPv4 for better readability
            if (ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1') {
                ipAddress = '127.0.0.1';
            }

            // Remove IPv6 prefix if present
            if (ipAddress.startsWith('::ffff:')) {
                ipAddress = ipAddress.substring(7);
            }
        }

        const logEntry = await AuditLog.create({
            userId: userId,
            action: action,
            targetTable: targetTable,
            targetId: targetId,
            payload: payload, // Sequelize handles JSONB
            ipAddress: ipAddress
        });

        console.log(`[AUDIT LOG] DB Saved: User ${userId} performed ${action} on ${targetTable}:${targetId}`);

        return logEntry;
    } catch (error) {
        console.error('Audit Log Error:', error);
    }
};

module.exports = {
    logAction
};

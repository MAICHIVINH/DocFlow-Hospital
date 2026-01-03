const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');
const { verifyToken, isAdminOrManager } = require('../middlewares/auth.middleware');

router.get('/', [verifyToken, isAdminOrManager], auditController.getAuditLogs);

module.exports = router;

const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const { verifyToken, checkPermission } = require('../middlewares/auth.middleware');

// Protected statistics routes
router.get(
    '/by-department',
    [verifyToken, checkPermission('stats:read')],
    statsController.getDocumentStatsByDept
);

router.get(
    '/usage',
    [verifyToken, checkPermission('stats:read')],
    statsController.getUsageStats
);

router.get(
    '/monthly',
    [verifyToken, checkPermission('stats:read')],
    statsController.getMonthlyStats
);

router.get(
    '/tags',
    [verifyToken, checkPermission('stats:read')],
    statsController.getTagStats
);

router.get(
    '/user-contributions',
    [verifyToken, checkPermission('stats:read')],
    statsController.getUserContributionStats
);

router.get(
    '/export/excel',
    [verifyToken, checkPermission('stats:read')],
    statsController.exportDocumentsToExcel
);

router.get(
    '/export/pdf',
    [verifyToken, checkPermission('stats:read')],
    statsController.exportDocumentsToPDF
);

module.exports = router;

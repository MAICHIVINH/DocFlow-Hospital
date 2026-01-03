const express = require('express');
const router = express.Router();
const docController = require('../controllers/document.controller');
const upload = require('../middlewares/upload.middleware');
const { verifyToken, checkPermission } = require('../middlewares/auth.middleware');

/**
 * Route: POST /api/documents/upload
 * Description: Upload a new document
 * Access: Verified Users with document:create
 */
router.post(
    '/upload',
    [verifyToken, checkPermission('document:create'), upload.single('file')],
    docController.uploadDocument
);

// List documents with search, filter, pagination
router.get(
    '/',
    [verifyToken, checkPermission('document:read')],
    docController.listDocuments
);

// Approval workflow
router.patch(
    '/:id/approve',
    [verifyToken, checkPermission('document:approve')],
    docController.approveDocument
);

router.patch(
    '/:id/reject',
    [verifyToken, checkPermission('document:approve')],
    docController.rejectDocument
);

// Download document
router.get(
    '/:id/download',
    [verifyToken, checkPermission('document:read')],
    docController.downloadDocument
);

// Tagging system
router.post(
    '/:id/tags',
    [verifyToken, checkPermission('tag:manage')],
    docController.tagDocument
);

// Get document
router.get(
    '/:id',
    [verifyToken, checkPermission('document:read')],
    docController.getDocument
);

// Delete document
router.delete(
    '/:id',
    [verifyToken, checkPermission('document:delete')],
    docController.deleteDocument
);

// Version history management
router.post(
    '/:id/versions',
    [verifyToken, checkPermission('document:update'), upload.single('file')],
    docController.createNewVersion
);

router.post(
    '/:id/versions/:versionId/restore',
    [verifyToken, checkPermission('document:update')],
    docController.restoreVersion
);

router.patch(
    '/:id/archive',
    [verifyToken, checkPermission('document:delete')],
    docController.archiveDocument
);

router.patch(
    '/:id/unarchive',
    [verifyToken, checkPermission('document:delete')],
    docController.unarchiveDocument
);

module.exports = router;

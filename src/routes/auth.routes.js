const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware');

// Public routes
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected routes examples
router.get(
    '/admin-only',
    [verifyToken, authorizeRole(['ADMIN'])],
    (req, res) => {
        res.json({ message: 'Welcome Admin! This is a restricted area.' });
    }
);

router.get(
    '/manager-or-admin',
    [verifyToken, authorizeRole(['ADMIN', 'MANAGER'])],
    (req, res) => {
        res.json({ message: 'Content for Managers and Admins.' });
    }
);

router.post(
    '/upload-doc',
    [verifyToken, authorizeRole(['ADMIN', 'MANAGER', 'STAFF'])],
    (req, res) => {
        res.json({ message: 'Document upload initiated by Staff/Manager/Admin.' });
    }
);

module.exports = router;

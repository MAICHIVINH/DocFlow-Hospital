const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isAdmin, authorizeRole } = require('../middlewares/auth.middleware');

// Allow ADMIN, MANAGER, and STAFF to list users (for filtering dropdowns)
// Controllers will handle visibility based on role
router.get('/', [verifyToken, authorizeRole(['ADMIN', 'MANAGER', 'STAFF'])], userController.listUsers);
router.get('/me', [verifyToken], userController.getMe);
router.put('/me', [verifyToken], userController.updateMe);
router.post('/', [verifyToken, isAdmin], userController.createUser);
router.put('/:id', [verifyToken, isAdmin], userController.updateUser);
router.delete('/:id', [verifyToken, isAdmin], userController.deleteUser);

module.exports = router;

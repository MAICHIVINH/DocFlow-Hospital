const express = require('express');
const router = express.Router();
const proxyController = require('../controllers/proxy.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Proxy route to serve files from Cloudinary
router.get('/file/:publicId(*)', [verifyToken], proxyController.proxyFile);

module.exports = router;

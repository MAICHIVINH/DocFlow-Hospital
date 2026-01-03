const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tag.controller');
const { verifyToken, checkPermission } = require('../middlewares/auth.middleware');

router.get('/', verifyToken, tagController.listTags);
router.post('/', [verifyToken, checkPermission('tag:manage')], tagController.createTag);
router.put('/:id', [verifyToken, checkPermission('tag:manage')], tagController.updateTag);
router.delete('/:id', [verifyToken, checkPermission('tag:manage')], tagController.deleteTag);

module.exports = router;

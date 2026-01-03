const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

router.get('/', departmentController.getAllDepartments);
router.post('/', [verifyToken, isAdmin], departmentController.createDepartment);
router.put('/:id', [verifyToken, isAdmin], departmentController.updateDepartment);
router.delete('/:id', [verifyToken, isAdmin], departmentController.deleteDepartment);

module.exports = router;

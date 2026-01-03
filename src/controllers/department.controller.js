const { Department, AuditLog } = require('../models');

const getAllDepartments = async (req, res) => {
    try {
        console.log('Fetching all departments...');
        const departments = await Department.findAll({
            order: [['name', 'ASC']]
        });
        console.log('Departments found:', departments.length);
        res.status(200).json(departments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createDepartment = async (req, res) => {
    try {
        const { name, description } = req.body;
        const dept = await Department.create({ name, description });

        await AuditLog.create({
            userId: req.userId,
            action: 'CREATE_DEPT',
            targetTable: 'departments',
            targetId: dept.id,
            ipAddress: req.ip
        });

        res.status(201).json(dept);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const dept = await Department.findByPk(id);
        if (!dept) return res.status(404).json({ message: 'Không tìm thấy phòng ban.' });

        await dept.update({ name, description });

        await AuditLog.create({
            userId: req.userId,
            action: 'UPDATE_DEPT',
            targetTable: 'departments',
            targetId: id,
            ipAddress: req.ip
        });

        res.status(200).json(dept);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const dept = await Department.findByPk(id);
        if (!dept) return res.status(404).json({ message: 'Không tìm thấy phòng ban.' });

        await dept.destroy();

        await AuditLog.create({
            userId: req.userId,
            action: 'DELETE_DEPT',
            targetTable: 'departments',
            targetId: id,
            ipAddress: req.ip
        });

        res.status(200).json({ message: 'Xóa thành công.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
};

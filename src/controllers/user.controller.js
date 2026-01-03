const { User, Role, Department, AuditLog, Sequelize } = require('../models');
const { Op } = Sequelize;
const bcrypt = require('bcryptjs');

const listUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role, department_id, search } = req.query;
        console.log('listUsers query params:', { page, limit, role, department_id, search });
        const offset = (page - 1) * limit;

        const where = {};
        if (department_id) where.departmentId = department_id;
        if (search) {
            console.log('Applying search filter:', search);
            where[Op.or] = [
                { fullName: { [Op.iLike]: `%${search}%` } },
                { username: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const include = [
            { model: Department, as: 'department', attributes: ['name'] },
            { model: Role, as: 'role', attributes: ['name'] }
        ];

        if (role) {
            console.log('Filtering by role name:', role);
            include[1].where = { name: role };
        }

        console.log('Executing User.findAndCountAll...');

        const { count, rows } = await User.findAndCountAll({
            where,
            include,
            attributes: { exclude: ['passwordHash'] },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        console.log(`Found ${count} users. Rows:`, rows.length);

        // Flatten role and department for frontend
        const data = rows.map(u => {
            const user = u.toJSON();
            return {
                ...user,
                role: user.role?.name,
                Department: user.department // Mapping to uppercase 'Department' as expected by frontend
            };
        });

        res.status(200).json({
            data,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        const { username, password, full_name, role, department_id, status } = req.body;

        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại.' });
        }

        const roleRecord = await Role.findOne({ where: { name: role || 'STAFF' } });
        if (!roleRecord) return res.status(400).json({ message: 'Vai trò không hợp lệ.' });

        const password_hash = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            passwordHash: password_hash,
            fullName: full_name,
            roleId: roleRecord.id,
            departmentId: department_id,
            status: status || 'ACTIVE'
        });

        // Audit Log
        await AuditLog.create({
            user_id: req.userId,
            action: 'CREATE_USER',
            target_table: 'users',
            target_id: newUser.id.toString(),
            ip_address: req.ip
        });

        res.status(201).json({ id: newUser.id, username: newUser.username });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, role, department_id, status, password } = req.body;

        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });

        const updateData = { fullName: full_name, departmentId: department_id, status };
        if (role) {
            const roleRecord = await Role.findOne({ where: { name: role } });
            if (roleRecord) updateData.roleId = roleRecord.id;
        }
        if (password) {
            updateData.passwordHash = await bcrypt.hash(password, 10);
        }

        await user.update(updateData);

        // Audit Log
        await AuditLog.create({
            user_id: req.userId,
            action: 'UPDATE_USER',
            target_table: 'users',
            target_id: id.toString(),
            payload: JSON.stringify(updateData),
            ip_address: req.ip
        });

        res.status(200).json({ message: 'Cập nhật thành công.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });

        // Prevents deleting self
        if (id === req.userId) {
            return res.status(400).json({ message: 'Bạn không thể xóa chính mình.' });
        }

        await user.destroy();

        // Audit Log
        await AuditLog.create({
            user_id: req.userId,
            action: 'DELETE_USER',
            target_table: 'users',
            target_id: id.toString(),
            ip_address: req.ip
        });

        res.status(200).json({ message: 'Xóa người dùng thành công.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            include: [
                { model: Department, as: 'department', attributes: ['name'] },
                { model: Role, as: 'role', attributes: ['name'] }
            ],
            attributes: { exclude: ['passwordHash'] }
        });

        if (!user) return res.status(404).json({ message: 'Không tìm thấy thông tin cá nhân.' });

        const userData = user.toJSON();
        res.status(200).json({
            ...userData,
            role: userData.role?.name,
            Department: userData.department
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateMe = async (req, res) => {
    try {
        const { full_name, password, currentPassword } = req.body;
        const user = await User.findByPk(req.userId);

        if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại.' });

        const updateData = {};
        if (full_name) updateData.fullName = full_name;

        if (password) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu hiện tại.' });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!isMatch) {
                return res.status(400).json({ message: 'Mật khẩu hiện tại không chính xác.' });
            }
            updateData.passwordHash = await bcrypt.hash(password, 10);
        }

        await user.update(updateData);

        await AuditLog.create({
            user_id: req.userId,
            action: 'UPDATE_PROFILE',
            target_table: 'users',
            target_id: req.userId.toString(),
            ip_address: req.ip
        });

        res.status(200).json({ message: 'Cập nhật thông tin cá nhân thành công.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    listUsers,
    createUser,
    updateUser,
    deleteUser,
    getMe,
    updateMe
};

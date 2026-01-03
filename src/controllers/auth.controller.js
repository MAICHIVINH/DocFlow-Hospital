const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const jwtConfig = require('../config/jwt.config');
const db = require('../models');
const User = db.User;
const Role = db.Role;

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Find user with Role
        const user = await User.findOne({
            where: { username },
            include: [{ model: Role, as: 'role' }]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.status === 'INACTIVE') {
            return res.status(401).json({ message: 'Account is inactive. Contact management.' });
        }

        // 2. Check password
        const passwordIsValid = bcrypt.compareSync(password, user.passwordHash);
        if (!passwordIsValid) {
            return res.status(401).json({
                accessToken: null,
                message: 'Invalid Password!'
            });
        }

        // 3. Generate Token
        const token = jwt.sign(
            { id: user.id, role: user.role.name, department_id: user.department_id },
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn }
        );

        res.status(200).json({
            id: user.id,
            username: user.username,
            role: user.role.name,
            full_name: user.fullName,
            department_id: user.departmentId,
            accessToken: token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const logout = (req, res) => {
    res.status(200).json({ message: 'Logged out successfully.' });
};

module.exports = {
    login,
    logout
};

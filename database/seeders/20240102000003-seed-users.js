'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin@123', salt);

        return queryInterface.bulkInsert('users', [
            {
                id: '00000000-0000-4000-a000-000000000000',
                username: 'admin',
                password_hash: hashedPassword,
                full_name: 'Hệ thống Quản trị viên',
                department_id: 'ad111111-1111-4111-a111-111111111111',
                role_id: 1, // ADMIN
                status: 'ACTIVE',
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('users', { username: 'admin' }, {});
    }
};

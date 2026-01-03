'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('departments', [
            {
                id: 'ad111111-1111-4111-a111-111111111111',
                name: 'Hành chính',
                description: 'Quản lý các hồ sơ hành chính, nhân sự.',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: 'ac222222-2222-4222-a222-222222222222',
                name: 'Kế toán',
                description: 'Quản lý tài chính, hóa đơn, lương bổng.',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: 'ee333333-3333-4333-a333-333333333333',
                name: 'Kỹ thuật',
                description: 'Bảo trì hệ thống, quản lý trang thiết bị vật tư.',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: 'de444444-4444-4444-a444-444444444444',
                name: 'Y tế',
                description: 'Các hồ sơ chuyên môn, phác đồ điều trị.',
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('departments', null, {});
    }
};

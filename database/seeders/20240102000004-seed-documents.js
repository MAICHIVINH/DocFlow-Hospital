'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('documents', [
            {
                id: 'd1d1d1d1-d1d1-41d1-ad11-d1d1d1d1d1d1',
                title: 'Quy trình tiếp nhận bệnh nhân 2024',
                description: 'Tài liệu hướng dẫn các bước tiếp nhận bệnh nhân mới tại Khoa Khám bệnh.',
                creator_id: '00000000-0000-4000-a000-000000000000',
                department_id: 'de444444-4444-4444-a444-444444444444',
                status: 'PUBLISHED',
                visibility: 'INTERNAL',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: 'd2d2d2d2-d2d2-42d2-ad22-d2d2d2d2d2d2',
                title: 'Kế hoạch bảo trì trang thiết bị Q1/2024',
                description: 'Lịch trình kiểm tra và bảo dưỡng máy móc y tế dự kiến.',
                creator_id: '00000000-0000-4000-a000-000000000000',
                department_id: 'ee333333-3333-4333-a333-333333333333',
                status: 'PENDING',
                visibility: 'INTERNAL',
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('documents', null, {});
    }
};

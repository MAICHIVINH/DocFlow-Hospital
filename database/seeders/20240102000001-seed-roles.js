'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('roles', [
            { id: 1, name: 'ADMIN', created_at: new Date(), updated_at: new Date() },
            { id: 2, name: 'MANAGER', created_at: new Date(), updated_at: new Date() },
            { id: 3, name: 'STAFF', created_at: new Date(), updated_at: new Date() },
            { id: 4, name: 'VIEWER', created_at: new Date(), updated_at: new Date() }
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('roles', null, {});
    }
};

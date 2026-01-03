'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('document_tag_map', {
            document_id: {
                type: Sequelize.UUID,
                references: {
                    model: 'documents',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
                primaryKey: true
            },
            tag_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'document_tags',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
                primaryKey: true
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('document_tag_map');
    }
};

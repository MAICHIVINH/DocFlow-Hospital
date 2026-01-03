'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('documents', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT
            },
            creator_id: {
                type: Sequelize.UUID,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            department_id: {
                type: Sequelize.UUID,
                references: {
                    model: 'departments',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            status: {
                type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED', 'PUBLISHED'),
                defaultValue: 'PENDING'
            },
            current_version_id: {
                type: Sequelize.UUID,
                allowNull: true // Updated later when version is created
            },
            visibility: {
                type: Sequelize.ENUM('INTERNAL', 'PRIVATE', 'PUBLIC'),
                defaultValue: 'INTERNAL'
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('documents');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_documents_status";');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_documents_visibility";');
    }
};

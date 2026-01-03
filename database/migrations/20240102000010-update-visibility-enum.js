'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. Rename the old enum type if it exists
        await queryInterface.sequelize.query('ALTER TYPE "enum_documents_visibility" RENAME TO "enum_documents_visibility_old"');

        // 2. Create the new enum type
        await queryInterface.sequelize.query('CREATE TYPE "enum_documents_visibility" AS ENUM(\'PUBLIC\', \'DEPARTMENT\', \'PRIVATE\')');

        // 3. Update the column to use the new type
        // Note: converting old values if necessary. 'INTERNAL' was the old default/value.
        // mapping 'INTERNAL' -> 'DEPARTMENT'
        await queryInterface.sequelize.query(`
            ALTER TABLE "documents" 
            ALTER COLUMN "visibility" TYPE "enum_documents_visibility" 
            USING (
                CASE 
                    WHEN "visibility"::text = 'INTERNAL' THEN 'DEPARTMENT'::"enum_documents_visibility"
                    WHEN "visibility"::text = 'PRIVATE' THEN 'PRIVATE'::"enum_documents_visibility"
                    WHEN "visibility"::text = 'PUBLIC' THEN 'PUBLIC'::"enum_documents_visibility"
                    ELSE 'DEPARTMENT'::"enum_documents_visibility"
                END
            )
        `);

        // 4. Set the default value for the column
        await queryInterface.sequelize.query('ALTER TABLE "documents" ALTER COLUMN "visibility" SET DEFAULT \'DEPARTMENT\'');

        // 5. Drop the old type
        await queryInterface.sequelize.query('DROP TYPE "enum_documents_visibility_old"');
    },

    down: async (queryInterface, Sequelize) => {
        // Reverse process
        await queryInterface.sequelize.query('ALTER TYPE "enum_documents_visibility" RENAME TO "enum_documents_visibility_new"');
        await queryInterface.sequelize.query('CREATE TYPE "enum_documents_visibility" AS ENUM(\'INTERNAL\', \'PRIVATE\', \'PUBLIC\')');

        await queryInterface.sequelize.query(`
            ALTER TABLE "documents" 
            ALTER COLUMN "visibility" TYPE "enum_documents_visibility" 
            USING (
                CASE 
                    WHEN "visibility"::text = 'DEPARTMENT' THEN 'INTERNAL'::"enum_documents_visibility"
                    WHEN "visibility"::text = 'PRIVATE' THEN 'PRIVATE'::"enum_documents_visibility"
                    WHEN "visibility"::text = 'PUBLIC' THEN 'PUBLIC'::"enum_documents_visibility"
                    ELSE 'INTERNAL'::"enum_documents_visibility"
                END
            )
        `);

        await queryInterface.sequelize.query('ALTER TABLE "documents" ALTER COLUMN "visibility" SET DEFAULT \'INTERNAL\'');
        await queryInterface.sequelize.query('DROP TYPE "enum_documents_visibility_new"');
    }
};

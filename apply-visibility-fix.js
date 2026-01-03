require('dotenv').config();
const { sequelize } = require('./src/models');

async function applyFix() {
    try {
        console.log('Applying Visibility ENUM fix...');

        // Check if the type exists
        const [types] = await sequelize.query("SELECT typname FROM pg_type WHERE typname = 'enum_documents_visibility'");

        if (types.length > 0) {
            console.log('Renaming old enum type...');
            await sequelize.query('ALTER TYPE "enum_documents_visibility" RENAME TO "enum_documents_visibility_old"');
        }

        console.log('Creating new visibility enum type...');
        await sequelize.query("CREATE TYPE \"enum_documents_visibility\" AS ENUM('PUBLIC', 'DEPARTMENT', 'PRIVATE')");

        console.log('Updating documents table visibility column...');
        await sequelize.query(`
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

        console.log('Setting default value to DEPARTMENT...');
        await sequelize.query('ALTER TABLE "documents" ALTER COLUMN "visibility" SET DEFAULT \'DEPARTMENT\'');

        if (types.length > 0) {
            console.log('Dropping old enum type...');
            await sequelize.query('DROP TYPE IF EXISTS "enum_documents_visibility_old"');
        }

        console.log('Fix applied successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error applying fix:', error);
        process.exit(1);
    }
}

applyFix();
